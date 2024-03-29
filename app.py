import json
import os
import time
from typing import Type

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import Body, FastAPI, Form, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from sse_starlette.sse import EventSourceResponse

from database import ChatDatabase
from model import BingChatConversation, ChatRecord, OpenaiChatConversation

API_PREFIX = os.getenv('API_PREFIX')
DEFAULT_BOT_TYPE = os.getenv('DEFAULT_BOT_TYPE', '')

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
scheduler = AsyncIOScheduler()
chat_db = ChatDatabase()


def get_conversation_class(
    bot_type: str = DEFAULT_BOT_TYPE
) -> Type[OpenaiChatConversation] | Type[BingChatConversation]:
    if bot_type == 'bing':
        return BingChatConversation
    elif bot_type == 'openai':
        return OpenaiChatConversation

    raise ValueError(f'Unknown bot_type: {bot_type}')


@app.on_event('startup')
async def startup():
    scheduler.start()
    scheduler.add_job(
        BingChatConversation.check_conversations,
        'interval', minutes=1
    )
    await chat_db.database.connect()
    await chat_db.load()


@app.on_event('shutdown')
async def shutdown():
    scheduler.shutdown()
    await chat_db.database.disconnect()


@app.get(f"{API_PREFIX}/api/cookies", response_class=HTMLResponse)
def get_cookies():
    with open(BingChatConversation.cookies_path, 'r') as file:
        cookies = file.read()

    return f'''
    <iframe  width=0 height=0 frameborder=0 id="myiframe" name="myiframe"></iframe>
    <form action="{API_PREFIX}/api/cookies" method="post" target='myiframe' onsubmit='return confirm("确定要提交?")'>
        <textarea name="cookies" style="width: 100%; height: 90%;">{cookies}</textarea>
        <input type="submit" value="提交" style="width:100%;margin-top: 4px;">
    </form>'''


@app.post(f"{API_PREFIX}/api/cookies")
def update_cookies(cookies=Form()):
    with open(BingChatConversation.cookies_path, 'w') as file:
        file.write(cookies)

    return '修改成功'


@app.get(f"{API_PREFIX}/api/conversation_list")
def get_conversation_list(bot_type: str = ''):
    if bot_type:
        conversation_list = get_conversation_class(bot_type).conversation_list
    else:
        conversation_list = BingChatConversation.conversation_list + \
            OpenaiChatConversation.conversation_list

    return [
        conversation.to_summary() for conversation
        in conversation_list
    ]


@app.post(f"{API_PREFIX}/api/question")
async def ask_question(
    question=Form(), conversation_id=Form(default=''),
    bot_type: str = Query(DEFAULT_BOT_TYPE, regex='^(bing|openai)$')
):
    if conversation_id == '$$new$$':
        conversation_id = ''

    ConversationClass = get_conversation_class(bot_type)
    conversation = await ConversationClass.create_conversation(
        conversation_id)

    record = await conversation.ask(question)

    if record:
        if not conversation_id:
            scheduler.add_job(
                chat_db.add_conversation, args=[conversation],
                trigger='date'
            )
        else:
            scheduler.add_job(
                chat_db.truncate_conversation, args=[conversation],
                trigger='date'
            )

        scheduler.add_job(
            chat_db.add_record, args=[record],
            trigger='date'
        )
    return conversation.to_info()


@app.post(f"{API_PREFIX}/api/question_stream")
async def ask_question_stream(
    payload=Body(),
    bot_type: str = Query(DEFAULT_BOT_TYPE, regex='^(bing|openai)$')
):
    payload = json.loads(payload)
    question = payload['question']
    conversation_id = payload['conversation_id']

    async def stream(conversation):
        async for result in conversation.ask_stream(question):
            if isinstance(result, str):
                yield {
                    'event': 'partial_message',
                    'data': result,
                    'retry': 30*1000
                }

            elif isinstance(result, ChatRecord):
                if not conversation_id:
                    scheduler.add_job(
                        chat_db.add_conversation, args=[conversation],
                        trigger='date'
                    )
                else:
                    scheduler.add_job(
                        chat_db.truncate_conversation, args=[conversation],
                        trigger='date'
                    )

                scheduler.add_job(
                    chat_db.add_record, args=[result],
                    trigger='date'
                )
                yield {
                    'event': 'all_message',
                    'data': json.dumps({'record': result.to_summary(), **conversation.to_info()}),
                    'retry': 30*1000
                }

    if conversation_id == '$$new$$':
        conversation_id = ''

    ConversationClass = get_conversation_class(bot_type)
    conversation = await ConversationClass.create_conversation(conversation_id)

    return EventSourceResponse(stream(conversation))


@app.get(f"{API_PREFIX}/api/conversation")
def get_conversation(conversation_id, bot_type: str = DEFAULT_BOT_TYPE):
    ConversationClass = get_conversation_class(bot_type)
    conversation = ConversationClass.get_conversation(conversation_id)
    if conversation:
        return conversation.to_info()
    return {}


@app.post(f"{API_PREFIX}/api/conversation")
def update_conversation(
    conversation_id: str = Body(''),
    name: str = Body(''),
    bot_type: str = Body(DEFAULT_BOT_TYPE)
):
    ConversationClass = get_conversation_class(bot_type)
    conversation = ConversationClass.get_conversation(conversation_id)
    if conversation:
        conversation.name = name
        scheduler.add_job(
            chat_db.rename_conversation, args=[conversation],
            trigger='date'
        )

        return conversation.to_summary()
    return {}


@app.delete(f"{API_PREFIX}/api/conversation")
def delete_conversation(conversation_id, bot_type: str = DEFAULT_BOT_TYPE):
    ConversationClass = get_conversation_class(bot_type)
    ConversationClass.remove_conversation(conversation_id)

    scheduler.add_job(
        chat_db.hide_conversation, args=[conversation_id],
        trigger='date'
    )

    return get_conversation_list(bot_type)


async def event_gernerator():
    for i in range(10):
        print(f"client connected!!! {i}")
        yield i
        time.sleep(0.5)


@app.get(f'{API_PREFIX}/api/stream')
async def run(request: Request):
    return EventSourceResponse(event_gernerator(request))
