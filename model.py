import os
import time
import uuid

from typing import Type
from speech import text_to_speech
from EdgeGPT import Chatbot, HEADERS, append_identifier
from datetime import datetime, timezone

import websockets.client as websockets

COOKIES_PATH = os.getenv("COOKIES_PATH")
MAX_WAIT_TIME = 5 * 60 * 60


def str2ts(date_str):
    # date_str = "2023-02-21T08:31:23.4009791+00:00"
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
            text_to_speech(text, wav_path)
            self.__setattr__(f'{tts_type}_voice', wav_path)
            self.__setattr__(f'{tts_type}_ts', time.time())

    def answer_tts(self) -> None:
        self._tts('answer')

    def question_tts(self) -> None:
        self._tts('question')

    def to_summary(self) -> dict[str, str]:
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
    conversation_list: list[Type['ChatConversation']] = []

    @classmethod
    def get_conversation(cls, conversation_id: str) -> Type['ChatConversation'] | None:
        for conversation in cls.conversation_list:
            if conversation.conversation_id == conversation_id:
                return conversation

        return None

    @classmethod
    def create_or_get_conversation(
        cls, conversation_id: str = '', name: str = '', live: bool = True
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
            conversation_id, name, cls.question_dir, cls.answer_dir, live
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
        question_dir: str = '', answer_dir: str = '', live: bool = True
    ) -> None:
        if live:
            self.bot = Chatbot(cookiePath=COOKIES_PATH)
            self.conversation_id = self.bot.chat_hub.request.conversation_id
        else:
            self.bot = None
            self.conversation_id = conversation_id or str(uuid.uuid4())
        self.name = name
        self.live = live
        self.question_dir = question_dir
        self.answer_dir = answer_dir
        self.records: dict[str, ChatRecord] = {}

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

    def to_info(self, sort_reverse: bool = True) -> dict[str, str]:
        records = [
            record.to_summary()
            for record_id, record in self.records.items()
            if record_id
        ]
        records.sort(
            key=lambda record: record['answer_ts'], reverse=sort_reverse)
        info = self.to_summary()
        info.update({'records': records})
        return info

    def to_summary(self) -> dict[str, str]:
        return {
            'conversation_id': self.conversation_id,
            'name': self.name,
            'live': self.live
        }

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

                if status == 'InvalidSession':
                    await self.kill()
                return

            new_conversation_id = response['conversationId']
            if new_conversation_id != self.conversation_id:
                self.conversation_id = new_conversation_id

            record_id = response['requestId']
            [question_item, answer_item] = response['messages']
            question_ts = str2ts(question_item['timestamp'])
            answer = answer_item.get(
                'text', '') or answer_item.get('hiddenText', '')
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
                record.suggestions += suggestions
                record.sources += sources

            # record.answer_tts()
            return record
        except Exception as e:
            print(e)
            raise e
