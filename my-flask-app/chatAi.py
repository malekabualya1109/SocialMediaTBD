# chatAi.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Class to encapsulate chat message storage and operations
class ChatStore:
    def __init__(self):
        self._messages = []

    def get_messages(self):
        return self._messages

    def add_message(self, message):
        self._messages.append(message)

    def clear_messages(self):
        self._messages = []

    def find_by_timestamp(self, timestamp):
        return self._find_by_timestamp(self._messages, timestamp)

    def _find_by_timestamp(self, msg_list, timestamp):
        for msg in msg_list:
            if msg["timestamp"] == timestamp:
                return msg
            result = self._find_by_timestamp(msg.get("replies", []), timestamp)
            if result:
                return result
        return None

# Create a single instance of ChatStore for the app
chat_store = ChatStore()

# Route to post a new chat message
@app.route('/chat', methods=['POST'])
def post_message():
    data = request.json
    username = data.get("username", "").strip()
    text = data.get("text", "").strip()

    if not username or not text:
        return jsonify({"error": "Username and message cannot be empty"}), 400

    new_message = {
        "username": username,
        "text": text,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "replies": []
    }

    chat_store.add_message(new_message)
    return jsonify({
        "message": "Message posted successfully!",
        "timestamp": new_message["timestamp"]
    }), 201

# Route to get all chat messages
@app.route('/chat', methods=['GET'])
def get_messages():
    return jsonify(chat_store.get_messages())

# Route to post a reply to a message
@app.route('/chat/reply', methods=['POST'])
def reply_to_message():
    data = request.json
    timestamp = data.get("timestamp")
    text = data.get("text", "").strip()
    username = data.get("username", "").strip()

    if not text or not username:
        return jsonify({"error": "Username and reply text are required"}), 400

    target_msg = chat_store.find_by_timestamp(timestamp)

    if target_msg:
        reply = {
            "username": username,
            "text": text,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "replyingTo": target_msg["username"],
            "replies": []
        }
        target_msg["replies"].append(reply)
        return jsonify({"message": "Reply posted"}), 201

    return jsonify({"error": "Message not found"}), 404

# Route to clear all messages
@app.route('/chat/clear', methods=['POST'])
def clear_chat():
    chat_store.clear_messages()
    return jsonify({"message": "Chat cleared"}), 200

# Run the Flask app
if __name__ == '__main__':
    print("Chat AI backend running at http://127.0.0.1:8081")
    app.run(host='127.0.0.1', port=8081)

