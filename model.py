import os
import time
from speech import text_to_speech
from EdgeGPT import Chatbot
from datetime import datetime, timezone

COOKIES_PATH = os.getenv("COOKIES_PATH")

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
        self, record_id,
        question='', answer='', 
        question_voice='', answer_voice='',
        question_dir='', answer_dir=''
    ) -> None:
        self.record_id = record_id
        self.question = question
        self.question_voice = question_voice
        self.question_dir = question_dir
        self.question_ts = 0
        
        self.answer = answer
        self.answer_voice = answer_voice
        self.answer_dir = answer_dir
        self.answer_ts = 0
        
        self.suggestions = []
        self.sources = []
        
    def _tts(self, tts_type='answer') -> None:
        text = self.__getattribute__(tts_type)
        if text:
            tts_dir = self.__getattribute__(f'{tts_type}_dir')
            wav_path = os.path.join(tts_dir, f'{self.record_id}.wav').replace('-', '_')
            text_to_speech(text, wav_path)
            self.__setattr__(f'{tts_type}_voice', wav_path)
            self.__setattr__(f'{tts_type}_ts', time.time())
            
    def answer_tts(self) -> None:
        self._tts('answer')
        
    def question_tts(self) -> None:
        self._tts('question')


class ChatConversation:
    question_dir = os.path.join('static', 'question')
    answer_dir = os.path.join('static', 'answer')
    conversation_list = []
    
    @classmethod
    def get_or_create_conversation(cls, conversation_id, create=True):
        for conversation in cls.conversation_list:
            if conversation.conversation_id == conversation_id:
                return conversation

        if not create:
            return None

        name_list = [
            conversation.name for conversation
            in ChatConversation.conversation_list
        ]

        for i in range(1, 500):
            name = f'对话{i}'
            if name not in name_list:
                break

        conversation = ChatConversation(
            conversation_id, name, cls.question_dir, cls.answer_dir
        )
        cls.conversation_list.append(conversation)
        return conversation
    
    def __init__(self, conversation_id, name, question_dir='', answer_dir='', live=True) -> None:
        self.conversation_id = conversation_id
        self.name = name
        self.live = live
        self.question_dir = question_dir
        self.answer_dir = answer_dir
        self.records: dict[str, ChatRecord] = {}
        if live:
            self.bot = Chatbot(cookiePath=COOKIES_PATH)
        else:
            self.bot = None
        
    def add_record(self, record_id, question='', answer='', question_voice='', answer_voice=''):
        record = ChatRecord(
            record_id, question, answer, 
            question_voice, answer_voice, 
            self.question_dir, self.answer_dir
        )
        self.records[record_id] = record
        return record
        
    def get_record(self, record_id) -> ChatRecord | None:
        return self.records.get(record_id, None)
    
    def to_info(self, sort_reverse=True):
        records = [
            {
                'record_id': record_id,
                'conversation_id': self.conversation_id,
                'question': record.question,
                'question_voice': record.question_voice,
                'question_ts': record.question_ts,
                'answer': record.answer,
                'answer_voice': record.answer_voice,
                'answer_ts': record.answer_ts,
                'sources': record.sources,
                'suggestions': record.suggestions
            }
            for record_id, record in self.records.items()
            if record_id
        ]
        records.sort(key=lambda record: record['answer_ts'], reverse=sort_reverse)
        info = {'records': records}
        info.update(self.to_summary())
        return info
        
    def to_summary(self):
        return {
            'conversation_id': self.conversation_id,
            'name': self.name,
            'live': self.live
        }
        
    async def ask(self, question):
        async def kill():
            self.live = False
            await self.bot.close()
            self.bot = None

        if not self.live:
            return

        try:
            response = await self.bot.ask(question)
            response = response['item']
            print(response)
            if response.get('result', {}).get('value', '') != 'Success':
                return

            new_conversation_id = response['conversationId']
            if new_conversation_id != self.conversation_id:
                self.conversation_id = new_conversation_id

            record_id = response['requestId']
            [question_item, answer_item] = response['messages']
            question_ts = str2ts(question_item['timestamp'])
            answer = answer_item.get('text', '') or answer_item.get('hiddenText', '')
            answer_ts = str2ts(answer_item['timestamp'])
            record = self.add_record(record_id, question, answer)
            record.answer_ts = answer_ts
            record.question_ts = question_ts
            
            max_times = response.get('throttling',{}).get('maxNumUserMessagesInConversation',0)
            now_times = response.get('throttling',{}).get('numUserMessagesInConversation',0)
            left_times = max_times - now_times
            origin = response.get('contentOrigin', '')
            if left_times < 0:
                await kill()
            elif 'New topic' in answer:
                await kill()
            elif origin == 'Apology' or origin == 'TurnLimiter':
                await kill()
            else:
                suggestions = [
                    s.get('text', '') for s in
                    answer_item.get('suggestedResponses', [])
                ]
                sources = [
                    source for source in 
                    answer_item.get('adaptiveCards', [{}])[0].get('body',[{}])[0].get('text','').split('\n')
                    if source.startswith('[') and source.endswith('"')
                ]
                record.suggestions += suggestions
                record.sources += sources
            

            # record.answer_tts()
            # return record
        except Exception as e:
            print(e)
            raise e
