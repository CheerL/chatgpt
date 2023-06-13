import databases
import sqlalchemy

# from pydantic import BaseModel
from model import ChatRecord, BingChatConversation, OpenaiChatConversation


DATABASE_URL = "sqlite:///./sqlite.db"
# DATABASE_URL = "postgresql://user:password@postgresserver/db"


metadata = sqlalchemy.MetaData()

conversations = sqlalchemy.Table(
    "conversations",
    metadata,
    sqlalchemy.Column("conversation_id", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String),
    sqlalchemy.Column("displayed", sqlalchemy.Boolean),
    sqlalchemy.Column("bot_type", sqlalchemy.String),
    sqlalchemy.Column("truncated_num", sqlalchemy.Integer),
    sqlalchemy.Column("truncated_text", sqlalchemy.String)
)
records = sqlalchemy.Table(
    "records",
    metadata,
    sqlalchemy.Column("record_id", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("conversation_id", sqlalchemy.String),
    sqlalchemy.Column("question", sqlalchemy.String),
    sqlalchemy.Column("question_voice", sqlalchemy.String),
    sqlalchemy.Column("question_dir", sqlalchemy.String),
    sqlalchemy.Column("answer", sqlalchemy.String),
    sqlalchemy.Column("answer_voice", sqlalchemy.String),
    sqlalchemy.Column("answer_dir", sqlalchemy.String),
    sqlalchemy.Column("question_ts", sqlalchemy.Float),
    sqlalchemy.Column("answer_ts", sqlalchemy.Float),
    sqlalchemy.Column("suggestions", sqlalchemy.PickleType),
    sqlalchemy.Column("sources", sqlalchemy.PickleType),
)


engine = sqlalchemy.create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
metadata.create_all(engine)

class ChatDatabase:
    def __init__(self, database_url:str=DATABASE_URL):
        self.database = databases.Database(database_url)

    async def add_record(self, record: ChatRecord):
        query = records.insert().values(
            **record.to_summary()
        )
        return await self.database.execute(query)

    async def add_conversation(
        self, 
        conversation: BingChatConversation | OpenaiChatConversation
        ):
        query = conversations.insert().values(
            displayed=True,
            conversation_id=conversation.conversation_id,
            name=conversation.name,
            bot_type=conversation.bot_type
        )
        return await self.database.execute(query)

    async def truncate_conversation(
        self, 
        conversation: OpenaiChatConversation
        ):
        if conversation.bot_type != 'openai':
            return

        query = conversations.update().where(
            conversations.c.conversation_id == conversation.conversation_id
        ).values(
            truncated_num=conversation.truncated_num,
            truncated_text=conversation.truncated_text
        )
        return await self.database.execute(query)

    async def rename_conversation(
        self, 
        conversation: BingChatConversation | OpenaiChatConversation
    ):
        query = conversations.update().where(
            conversations.c.conversation_id == conversation.conversation_id
        ).values(name=conversation.name)
        return await self.database.execute(query)

    async def hide_conversation(self, conversation_id: str):
        query = conversations.update().where(
            conversations.c.conversation_id == conversation_id
        ).values(displayed=False)
        return await self.database.execute(query)

    async def load(self):
        query = conversations.select()
        conversation_list = await self.database.fetch_all(query)
        for conversation_db in conversation_list:
            if not conversation_db.displayed:
                continue

            if conversation_db.bot_type == 'bing':
                conversation = await BingChatConversation.create_conversation(
                    conversation_id=conversation_db.conversation_id,
                    name=conversation_db.name, live=False
                )
            elif conversation_db.bot_type == 'openai':
                conversation = await OpenaiChatConversation.create_conversation(
                    conversation_id=conversation_db.conversation_id, 
                    name=conversation_db.name, live=True,
                    truncated_num=conversation_db.truncated_num,
                    truncated_text=conversation_db.truncated_text
                )

            query = records.select().where(
                records.c.conversation_id == conversation.conversation_id
            )
            record_list = await self.database.fetch_all(query)
            for record_db in record_list:
                conversation.add_record(
                    record_db.record_id,
                    record_db.question, record_db.answer,
                    record_db.question_voice, record_db.answer_voice,
                    record_db.question_ts, record_db.answer_ts,
                    record_db.suggestions, record_db.sources,
                )
