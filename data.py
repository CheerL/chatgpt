import databases
import sqlalchemy

from model import ChatConversation, ChatRecord

# from pydantic import BaseModel

DATABASE_URL = "sqlite:///./sqlite.db"
# DATABASE_URL = "postgresql://user:password@postgresserver/db"

database = databases.Database(DATABASE_URL)

metadata = sqlalchemy.MetaData()

conversations = sqlalchemy.Table(
    "conversations",
    metadata,
    sqlalchemy.Column("conversation_id", sqlalchemy.String, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String),
    sqlalchemy.Column("displayed", sqlalchemy.Boolean),
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


async def add_conversation(conversation: ChatConversation):
    query = conversations.insert().values(
        displayed=True,
        conversation_id=conversation.conversation_id,
        name=conversation.name
    )
    return await database.execute(query)


async def add_record(record: ChatRecord):
    query = records.insert().values(
        **record.to_summary()
    )
    return await database.execute(query)


async def rename_conversation(conversation: ChatConversation):
    query = conversations.update().where(
        conversations.c.conversation_id == conversation.conversation_id
    ).values(name=conversation.name)
    return await database.execute(query)

async def hide_conversation(conversation: ChatConversation):
    query = conversations.update().where(
        conversations.c.conversation_id == conversation.conversation_id
    ).values(displayed=False)
    return await database.execute(query)

async def load():
    query = conversations.select()
    conversation_list = await database.fetch_all(query)
    for conversation_db in conversation_list:
        if not conversation_db.displayed:
            continue

        conversation = ChatConversation.create_or_get_conversation(
            conversation_db.conversation_id, conversation_db.name, live=False
        )
        
        query = records.select().where(
            records.c.conversation_id == conversation.conversation_id
        )
        record_list = await database.fetch_all(query)
        for record_db in record_list:
            conversation.add_record(
                record_db.record_id, 
                record_db.question, record_db.answer,
                record_db.question_voice, record_db.answer_voice,
                record_db.question_ts, record_db.answer_ts,
                record_db.suggestions, record_db.sources
            )
    # return conversation_list, record_list
