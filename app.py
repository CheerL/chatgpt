import os
import uuid

from model import ChatConversation, ChatRecord, COOKIES_PATH
from data import (
    database,
    add_conversation,
    rename_conversation,
    hide_conversation,
    add_record,
    load
)
from fastapi import FastAPI, Form, BackgroundTasks
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

API_PREFIX = os.getenv('API_PREFIX')

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
scheduler = AsyncIOScheduler()


@app.on_event('startup')
async def startup():
    scheduler.start()
    scheduler.add_job(ChatConversation.check_conversations,
                      'interval', minutes=1)
    await database.connect()
    await load()


@app.on_event('shutdown')
async def shutdown():
    scheduler.shutdown()
    await database.disconnect()


@app.get(f"{API_PREFIX}/api/cookies", response_class=HTMLResponse)
def get_cookies():
    with open(COOKIES_PATH, 'r') as file:
        cookies = file.read()
    return f'''
    <iframe  width=0 height=0 frameborder=0 id="myiframe" name="myiframe"></iframe>
    <form action="{API_PREFIX}/api/cookies" method="post" target='myiframe' onsubmit='return confirm("确定要提交?")'>
        <textarea name="cookies" style="width: 100%; height: 90%;">{cookies}</textarea>
        <input type="submit" value="提交" style="width:100%;margin-top: 4px;">
    </form>'''
    
@app.post(f"{API_PREFIX}/api/cookies")
def update_cookies(cookies=Form(), response_class=HTMLResponse):
    with open(COOKIES_PATH, 'w') as file:
        file.write(cookies)

    return f'''修改成功</div>'''
    # return RedirectResponse(f"{API_PREFIX}/api/cookies", 308)


@app.get(f"{API_PREFIX}/api/conversation_list")
def get_conversation_list():
    return [
        conversation.to_summary() for conversation
        in ChatConversation.conversation_list
    ]


@app.post(f"{API_PREFIX}/api/question")
async def ask_question(question=Form(), conversation_id=Form(default='')):
    if conversation_id == '$$new$$':
        conversation_id = ''

    conversation = ChatConversation.create_or_get_conversation(conversation_id)

    if not conversation_id:
        scheduler.add_job(
            add_conversation, args=[conversation],
            trigger='date'
        )

    record = await conversation.ask(question)
    if record:
        scheduler.add_job(
            add_record, args=[record],
            trigger='date'
        )
    return conversation.to_info()


@app.get(f"{API_PREFIX}/api/conversation")
def get_conversation(conversation_id):
    conversation = ChatConversation.get_conversation(conversation_id)
    if conversation:
        return conversation.to_info()
    return {}


@app.post(f"{API_PREFIX}/api/conversation")
def update_conversation(conversation_id, name):
    conversation = ChatConversation.get_conversation(conversation_id)
    if conversation:
        conversation.name = name
        return conversation.to_summary()
    return {}


@app.delete(f"{API_PREFIX}/api/conversation")
def delete_conversation(conversation_id):
    ChatConversation.remove_conversation(conversation_id)
    return get_conversation_list()
