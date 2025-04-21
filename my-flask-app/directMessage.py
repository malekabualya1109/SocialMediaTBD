# directMessage.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Store messages by user pair
conversation_store = {}
user_profiles = {}  # Track profile pics per user

def get_convo_key(user1, user2):
    return tuple(sorted([user1.lower(), user2.lower()]))

@app.route('/direct', methods=['POST'])
def send_direct_message():
    data = request.json
    sender = data.get("sender", "").strip()
    receiver = data.get("receiver", "").strip()
    text = data.get("text", "").strip()
    profile_pic = data.get("profilePic", "").strip()

    if not sender or not receiver or not text:
        return jsonify({"error": "Missing sender, receiver, or message"}), 400

    user_profiles[sender] = profile_pic

    message = {
        "username": sender,
        "receiver": receiver,
        "text": text,
        "profilePic": profile_pic,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    convo_key = get_convo_key(sender, receiver)
    if convo_key not in conversation_store:
        conversation_store[convo_key] = []

    conversation_store[convo_key].append(message)
    return jsonify({"message": "Message sent"}), 201

@app.route('/direct', methods=['GET'])
def get_direct_messages():
    sender = request.args.get("sender", "").strip()
    receiver = request.args.get("receiver", "").strip()

    if not sender or not receiver:
        return jsonify({"error": "Missing sender or receiver"}), 400

    convo_key = get_convo_key(sender, receiver)
    return jsonify(conversation_store.get(convo_key, []))

@app.route('/direct/conversations', methods=['GET'])
def get_conversations():
    current_user = request.args.get("user", "").strip().lower()
    if not current_user:
        return jsonify({"error": "Missing user"}), 400

    seen = set()
    convos = []
    for (user1, user2), messages in conversation_store.items():
        if current_user in (user1, user2):
            other = user2 if current_user == user1 else user1
            if other not in seen:
                seen.add(other)
                pic = user_profiles.get(other, "")
                convos.append({"username": other, "profilePic": pic})

    return jsonify(convos)

if __name__ == '__main__':
    print("Direct Message backend running at http://127.0.0.1:8082")
    app.run(host='127.0.0.1', port=8082)