import os
from tarfile import ENCODING
import time
import uuid
import openai
import tiktoken

from typing import Type
#from speech import text_to_speech
from EdgeGPT import Chatbot, HEADERS, append_identifier
from datetime import datetime, timezone

import websockets.client as websockets

COOKIES_PATH = os.getenv("COOKIES_PATH", '')
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", '')
OPENAI_SYSTEM_PROMPT = os.getenv("OPENAI_SYSTEM_PROMPT", '')
MAX_WAIT_TIME = 5 * 60 * 60

def str2ts(date_str):
    ts = datetime.strptime(
        date_str[:26], "%Y-%m-%dT%H:%M:%S.%f"
    ).replace(
        tzinfo=timezone.utc
    ).timestamp()
    return ts


class ChatRecord:
    def __init__(
        self, record_id: str, conversation_id: str,
        question: str, answer: str,
        question_voice: str = '', answer_voice: str = '',
        question_ts: float = 0, answer_ts: float = 0,
        question_dir: str = '', answer_dir: str = '',
        suggestions: list[str] = [], sources: list[str] = []
    ) -> None:
        self.record_id: str = record_id
        self.conversation_id: str = conversation_id
        self.question: str = question
        self.question_voice: str = question_voice
        self.question_dir: str = question_dir
        self.question_ts: float = question_ts

        self.answer: str = answer
        self.answer_voice: str = answer_voice
        self.answer_dir: str = answer_dir
        self.answer_ts: float = answer_ts

        self.suggestions: list[str] = suggestions
        self.sources: list[str] = sources

    def _tts(self, tts_type='answer') -> None:
        text = self.__getattribute__(tts_type)
        if text:
            tts_dir = self.__getattribute__(f'{tts_type}_dir')
            wav_path = os.path.join(
                tts_dir, f'{self.record_id}.wav').replace('-', '_')
            #text_to_speech(text, wav_path)
            self.__setattr__(f'{tts_type}_voice', wav_path)
            self.__setattr__(f'{tts_type}_ts', time.time())

    def answer_tts(self) -> None:
        self._tts('answer')

    def question_tts(self) -> None:
        self._tts('question')

    def to_summary(self) -> dict[str, str | float | list[str]]:
        return {
            'record_id': self.record_id,
            'conversation_id': self.conversation_id,
            'question': self.question,
            'question_voice': self.question_voice,
            'question_ts': self.question_ts,
            'answer': self.answer,
            'answer_voice': self.answer_voice,
            'answer_ts': self.answer_ts,
            'sources': self.sources,
            'suggestions': self.suggestions
        }


class ChatConversation:
    question_dir = os.path.join('static', 'question')
    answer_dir = os.path.join('static', 'answer')
    conversation_list: list['ChatConversation'] = []
    bot_type = ''

    @classmethod
    def get_conversation(
        cls, conversation_id: str
    ) -> Type['ChatConversation'] | None:
        for conversation in cls.conversation_list:
            if conversation.conversation_id == conversation_id:
                return conversation

        return None

    @classmethod
    def create_conversation(
        cls, conversation_id: str = '', 
        name: str = '', live: bool = True,
        **kwargs
    ) -> Type['ChatConversation']:
        conversation = cls.get_conversation(conversation_id)

        if conversation:
            return conversation

        if not name:
            name_list = [
                conversation.name for conversation
                in cls.conversation_list
            ]

            for i in range(1, 500):
                name = f'对话{i}'
                if name not in name_list:
                    break

        conversation = cls(
            conversation_id=conversation_id,
            name=name, live=live,
            question_dir=cls.question_dir,
            answer_dir=cls.answer_dir,
            **kwargs
        )
        cls.conversation_list.append(conversation)
        return conversation

    @classmethod
    def remove_conversation(cls, conversation_id: str) -> None:
        cls.conversation_list = [
            conversation
            for conversation in cls.conversation_list
            if conversation.conversation_id != conversation_id
        ]

    @classmethod
    async def check_conversations(cls) -> None:
        raise NotImplementedError('check_conversations not implemented')

    def __init__(
        self, conversation_id: str, name: str,
        question_dir: str = '', answer_dir: str = '', live: bool = True
    ) -> None:
        self.conversation_id = conversation_id
        self.name = name
        self.live = live
        self.question_dir = question_dir
        self.answer_dir = answer_dir
        self.records: dict[str, ChatRecord] = {}

    def add_record(
        self, record_id: str, question: str, answer: str,
        question_voice: str = '', answer_voice: str = '',
        question_ts: float = 0, answer_ts: float = 0,
        suggestions: list[str] = [], sources: list[str] = []
    ) -> ChatRecord:
        record = ChatRecord(
            record_id, self.conversation_id, question, answer,
            question_voice, answer_voice,
            question_ts, answer_ts,
            self.question_dir, self.answer_dir,
            suggestions, sources
        )
        self.records[record_id] = record
        return record

    def get_record(self, record_id: str) -> ChatRecord | None:
        return self.records.get(record_id, None)

    def to_info(
        self, sort_reverse: bool = True
    ) -> dict[str, str | bool | list[dict[str, str | float | list[str]]]]:
        records = [
            record.to_summary()
            for record_id, record in self.records.items()
            if record_id
        ]
        records.sort(
            key=lambda record: record['answer_ts'],
            reverse=sort_reverse
        )
        return {'records': records, **self.to_summary()}

    def to_summary(self) -> dict[str, str | bool]:
        return {
            'conversation_id': self.conversation_id,
            'name': self.name,
            'live': self.live,
            'bot_type': self.bot_type
        }

    async def ask(self, question: str) -> ChatRecord | None:
        raise NotImplementedError('ask not implemented')


# 继承 ChatConversation 的类, for Bing Chatbot
class BingChatConversation(ChatConversation):
    question_dir = os.path.join('static', 'question', 'bing')
    answer_dir = os.path.join('static', 'answer', 'bing')
    conversation_list: list['BingChatConversation'] = []
    bot_type = 'bing'
    cookies_path = COOKIES_PATH

    @classmethod
    async def check_conversations(cls) -> None:
        for conversation in cls.conversation_list:
            if not conversation.live or not conversation.records:
                continue

            latest_answer_ts = max([
                record.answer_ts for record
                in conversation.records.values()
            ])
            if time.time() - latest_answer_ts > MAX_WAIT_TIME:
                await conversation.kill()
            else:
                await conversation.keep_alive()

    def __init__(
        self, conversation_id: str, name: str,
        question_dir: str = '', answer_dir: str = '',
        live: bool = True
    ) -> None:
        super().__init__(conversation_id, name, question_dir, answer_dir, live)
        if live:
            self.bot = Chatbot(cookiePath=self.cookies_path)
            self.conversation_id = self.bot.chat_hub.request.conversation_id
        else:
            self.bot = None
            self.conversation_id = conversation_id or str(uuid.uuid4())

    async def keep_alive(self) -> None:
        if self.live:
            if not self.bot.chat_hub.wss or self.bot.chat_hub.wss.closed:
                self.bot.chat_hub.wss = await websockets.connect(
                    "wss://sydney.bing.com/sydney/ChatHub",
                    extra_headers=HEADERS,
                    max_size=None,
                )
            wss = self.bot.chat_hub.wss
            await wss.send(append_identifier({"protocol": "json", "version": 1}))
            await wss.recv()

    async def kill(self) -> None:
        if self.live:
            self.live = False
            await self.bot.close()
            self.bot = None

    async def ask(self, question: str) -> ChatRecord | None:
        if not self.live:
            return

        try:
            response = await self.bot.ask(question)
            response = response['item']
            print(response)

            status = response.get('result', {}).get('value', '')
            if status != 'Success':
                error_message = response.get('result', {}).get('message', '')
                print(error_message)
                if status == 'InvalidSession':
                    await self.kill()
                return

            new_conversation_id = response['conversationId']
            if new_conversation_id != self.conversation_id:
                self.conversation_id = new_conversation_id

            record_id = response['requestId']
            [question_item, answer_item] = response['messages']
            question_ts = str2ts(question_item['timestamp'])
            answer = answer_item.get('text', '').strip(
            ) or answer_item.get('hiddenText', '').strip()
            answer_ts = str2ts(answer_item['timestamp'])
            record = self.add_record(
                record_id, question, answer,
                question_ts=question_ts, answer_ts=answer_ts
            )

            max_times = response.get('throttling', {}).get(
                'maxNumUserMessagesInConversation', 0)
            now_times = response.get('throttling', {}).get(
                'numUserMessagesInConversation', 0)
            left_times = max_times - now_times
            origin = response.get('contentOrigin', '')
            if left_times < 0:
                await self.kill()
            elif 'New topic' in answer:
                await self.kill()
            elif origin == 'Apology' or origin == 'TurnLimiter':
                await self.kill()
            else:
                suggestions = [
                    s.get('text', '') for s in
                    answer_item.get('suggestedResponses', [])
                ]
                sources = [
                    source for source in
                    answer_item.get('adaptiveCards', [{}])[0].get(
                        'body', [{}])[0].get('text', '').split('\n')
                    if source.startswith('[') and source.endswith('"')
                ]
                record.suggestions = suggestions
                record.sources = sources

            # record.answer_tts()
            return record
        except Exception as e:
            print(e)
            raise e


# 继承 ChatConversation 的类, for Openai GPT 3.5 api
class OpenaiChatConversation(ChatConversation):
    question_dir = os.path.join('static', 'question', 'openai')
    answer_dir = os.path.join('static', 'answer', 'openai')
    conversation_list: list['OpenaiChatConversation'] = []
    bot_type = 'openai'

    def __init__(
        self, conversation_id: str, name: str,
        question_dir: str = '', answer_dir: str = '',
        live: bool = True, system_prompt: str = OPENAI_SYSTEM_PROMPT,
        truncated_num: int = 0, truncated_text: str = '',
        model: str = 'gpt-3.5-turbo', max_tokens: int = 4000,
        temperature: float = 0.8, top_p: float = 0.9,
        frequency_penalty: float = 0.0, truncate_rate: float = 0.7
    ) -> None:
        super().__init__(
            conversation_id or str(uuid.uuid4()),
            name, question_dir, answer_dir, live
        )
        self.system_prompt = system_prompt
        self.truncated_num = truncated_num
        self.truncated_text = truncated_text
        self.max_tokens = max_tokens
        self.model = model
        self.temperature = temperature
        self.top_p = top_p
        self.frequency_penalty = frequency_penalty
        self.truncate_rate = truncate_rate

    def get_messages(self) -> list[dict[str, str]]:
        messages: list[dict[str, str]] = [
            {"role": "system", "content": self.system_prompt}
        ] if self.system_prompt else []

        if self.truncated_num and self.truncated_text:
            messages.extend([
                {'role': 'user', 'content': '概括一下我们前面聊了什么'},
                {"role": "assistant", "content": self.truncated_text}
            ])

        messages.extend([
            message
            for index, record in enumerate(self.records.values())
            if index >= self.truncated_num
            for message in [
                {"role": "user", "content": record.question},
                {"role": "assistant", "content": record.answer}
            ]
        ])
        return messages

    async def truncate(self) -> None:
        # print('truncate')
        untruncated_num = len(self.records) - self.truncated_num

        if untruncated_num <= 0:
            return

        new_record_num = min(max(untruncated_num - 2, 2), untruncated_num)
        end = new_record_num * 2 + 3 if self.truncated_num else new_record_num * 2 + 1
        messages = self.get_messages()[:end]
        truncate_prompt = '请总结一下我们刚才的对话，尽可能保留对话的细节，包括我说了什么以及你如何回答。' + \
            '请特别注意最后一段对话的主题（可能不止一次问答），我正在让你做什么，你回复了什么。' + \
            '早期的对话的内容可以相对简略。' + \
            '总结在400字左右，不要太短。在回答中不要包含这句话'
        messages.append({
            "role": "user",
            "content": truncate_prompt
        })
        tokens = self._get_tokens(messages)
        # print(messages, end, tokens)

        response = await openai.ChatCompletion.acreate(
            api_key=OPENAI_API_KEY,
            model=self.model,
            max_tokens=min(self.max_tokens - tokens, 800),
            temperature=self.temperature,
            top_p=self.top_p,
            frequency_penalty=self.frequency_penalty,
            messages=messages,
            stream=False
        )
        # print(response)

        self.truncated_text = response.choices[0]["message"]["content"].strip()
        self.truncated_num += new_record_num
        # print(self.truncated_text, self.truncated_num)

    def _get_tokens(self, messages: list[dict[str, str]]) -> int:
        encoding = tiktoken.encoding_for_model('gpt-3.5-turbo')
        num_tokens = 0
        for message in messages:
            # every message follows <im_start>{role/name}\n{content}<im_end>\n
            num_tokens += 4
            for key, value in message.items():
                num_tokens += len(encoding.encode(value))
                if key == "name":  # if there's a name, the role is omitted
                    num_tokens += -1  # role is always required and always 1 token
        num_tokens += 2  # every reply is primed with <im_start>assistant
        return num_tokens

    async def ask(self, question: str) -> ChatRecord | None:
        messages = self.get_messages()
        messages.append(
            {"role": "user", "content": question}
        )

        tokens = self._get_tokens(messages)
        if tokens >= self.max_tokens * self.truncate_rate:
            await self.truncate()
            return await self.ask(question)

        question_ts = time.time()
        # print(tokens, messages)

        response = await openai.ChatCompletion.acreate(
            api_key=OPENAI_API_KEY,
            model=self.model,
            max_tokens=min(self.max_tokens - tokens, 800),
            temperature=self.temperature,
            top_p=self.top_p,
            frequency_penalty=self.frequency_penalty,
            messages=messages,
            stream=False
        )
        print(response)

        answer_ts = time.time()
        answer = response.choices[0]["message"]["content"].strip()
        record_id = response['id']
        record = self.add_record(
            record_id, question, answer,
            question_ts=question_ts, answer_ts=answer_ts
        )
        total_tokens = response["usage"]["total_tokens"]
        prompt_tokens = response["usage"]["prompt_tokens"]
        answer_tokens = response["usage"]["completion_tokens"]
        usage = f'Tokens usage [{total_tokens} ({prompt_tokens}, {answer_tokens}) / {self.max_tokens}] '
        print(usage)

        return record
