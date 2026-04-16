from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from Chatbot.pizzaTechChatBot import chatbot

app = Flask(__name__)
CORS(app)

state = {
    "order_id": None,
    "last_intent": None
}

@app.route("/chatbot", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message")

    reply = chatbot(message, state)

    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(debug=True)

