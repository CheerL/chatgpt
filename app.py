import os
import uuid

from chat_history import ChatConversation
from EdgeGPT import Chatbot
from flask import Flask, redirect, render_template, request, url_for, jsonify

app = Flask(__name__)
cookies_path = os.getenv("COOKIES_PATH")
chat = Chatbot(cookiePath=cookies_path)
print('ChatGPT starts')

question_dir = os.path.join('static', 'question')
answer_dir = os.path.join('static', 'answer')
chat_history: dict[str, ChatConversation] = {}

async def ask(question, conversation_id):
    if conversation_id in chat_history:
        conversation = chat_history[conversation_id]
    else:
        conversation = ChatConversation(conversation_id, question_dir, answer_dir)
        chat_history[conversation_id] = conversation

    try:
        response = await chat.ask(question)
        print(response)
    except Exception as e:
        print(e)
        raise e
    record_id = response['item']['requestId']
    answer = response['item']['messages'][-1]['text']

    record = conversation.add_record(record_id, question, answer)
    # record.answer_tts()
    return record, conversation

@app.route("/", methods=["GET", "POST"])
async def index():
    if request.method == "POST":
        question = request.form["question"]
        conversation_id = request.form['conversation_id'] or str(uuid.uuid4())
        record, conversation = await ask(question, conversation_id)
        print('?')
        return redirect(f'/?conversation={conversation_id}')


    conversation_id = request.args.get("conversation", '')
    conversation = chat_history.get(conversation_id, None)
    if conversation:
        # print(conversation.to_info())
        return render_template("index.html", conversation=conversation.to_info(), ids=list(chat_history.keys()))

    return render_template("index.html", ids=list(chat_history.keys()))

@app.route("/api/conversation_list", methods=["GET"])
def get_conversations():
    return jsonify(list(chat_history.keys()))

@app.route("/api/question", methods=["POST"])
async def ask_question():
    question = request.form["question"]
    conversation_id = request.form['conversation_id'] or str(uuid.uuid4())
    record, conversation = await ask(question, conversation_id)
    return jsonify(conversation.to_info())

@app.route("/api/conversation", methods=["GET"])
def get_conversation():
    conversation_id = request.args.get("id", '')
    conversation = chat_history.get(conversation_id, None)
    if conversation:
        # print(conversation.to_info())
        return jsonify(conversation.to_info())

    return jsonify({})