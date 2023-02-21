import os
import uuid

from model import ChatConversation
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = os.getenv('API_PREFIX')


@app.get(f"{API_PREFIX}/api/conversation_list")
def get_conversation_list():
    return [
        conversation.to_summary() for conversation
        in ChatConversation.conversation_list
    ]

@app.post(f"{API_PREFIX}/api/question")
async def ask_question(question=Form(), conversation_id=Form(default=None)):
    if not conversation_id:
        conversation_id = str(uuid.uuid4())

    conversation = ChatConversation.get_or_create_conversation(conversation_id)
    await conversation.ask(question)
    return conversation.to_info()

@app.get(f"{API_PREFIX}/api/conversation")
def get_conversation(conversation_id):
    conversation = ChatConversation.get_or_create_conversation(conversation_id, False)
    if conversation:
        return conversation.to_info()
    return {}