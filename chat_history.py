import os
import time
from speech import text_to_speech


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
        
        self.answer = answer
        self.answer_voice = answer_voice
        self.answer_dir = answer_dir
        self.ts = time.time()
        
    def _tts(self, tts_type='answer') -> None:
        text = self.__getattribute__(tts_type)
        if text:
            tts_dir = self.__getattribute__(f'{tts_type}_dir')
            wav_path = os.path.join(tts_dir, f'{self.record_id}.wav').replace('-', '_')
            text_to_speech(text, wav_path)
            self.__setattr__(f'{tts_type}_voice', wav_path)
            self.ts = time.time()
            
    def answer_tts(self) -> None:
        self._tts('answer')
        
    def question_tts(self) -> None:
        self._tts('question')


class ChatConversation:
    def __init__(self, conversation_id, question_dir='', answer_dir='') -> None:
        self.conversation_id = conversation_id
        self.question_dir = question_dir
        self.answer_dir = answer_dir
        self.records: dict[str, ChatRecord] = {}
        
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
                'question': record.question,
                'question_voice': record.question_voice,
                'answer': record.answer,
                'answer_voice': record.answer_voice,
                'ts': record.ts
            }
            for record_id, record in self.records.items()
            if record_id
        ]
        records.sort(key=lambda record: record['ts'], reverse=sort_reverse)
        return {
            'conversation_id': self.conversation_id,
            'records': records
        }
