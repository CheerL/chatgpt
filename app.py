import os
import asyncio
import uuid

from chat_history import ChatConversation
from ChatGPT_lite.ChatGPT import Chatbot
from flask import Flask, redirect, render_template, request, url_for

app = Flask(__name__)
session_token = os.getenv("CHATGPT_TOKEN")
chat = Chatbot(session_token)

print('ChatGPT starts')

question_dir = os.path.join('static', 'question')
answer_dir = os.path.join('static', 'answer')
chat_history: dict[str, ChatConversation] = {}

@app.route("/", methods=("GET", "POST"))
def index():
    if request.method == "POST":
        question = request.form["question"]
        conversation_id = request.form['conversation_id'] or str(uuid.uuid4())
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        loop.run_until_complete(chat.wait_for_ready())
        response = loop.run_until_complete(chat.ask(question, conversation_id))
        record_id = response['messageId']
        answer = response['answer']

        if conversation_id in chat_history:
            conversation = chat_history[conversation_id]
        else:
            conversation = ChatConversation(conversation_id, question_dir, answer_dir)
            chat_history[conversation_id] = conversation

        record = conversation.add_record(record_id, question, answer)
        # record.answer_tts()
        return redirect(url_for("index", conversation=conversation_id))


    conversation_id = request.args.get("conversation", '')
    conversation = chat_history.get(conversation_id, None)
    if conversation:
        # print(conversation.to_info())
        return render_template("index.html", conversation=conversation.to_info(), ids=list(chat_history.keys()))

    return render_template("index.html", ids=list(chat_history.keys()))
