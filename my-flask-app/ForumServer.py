from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from threading import Timer

app = Flask(__name__)
CORS(app)

# Class to manage comment storage and operations
class CommentStore:
    def __init__(self):
        self._comments = []

    def get_all(self):
        return self._comments

    def add_comment(self, comment):
        self._comments.append(comment)

    def clear_expired(self):
        now = datetime.now()
        self._comments = [
            c for c in self._comments
            if datetime.strptime(c["timestamp"], "%Y-%m-%d %H:%M:%S") > now - timedelta(minutes=15)
        ]

    def find_by_timestamp(self, timestamp):
        return self._find(self._comments, timestamp)

    def like_by_timestamp(self, timestamp):
        for comment in self._comments:
            if comment["timestamp"] == timestamp:
                comment["likes"] += 1
                return comment["likes"]
        return None

    def add_reply(self, timestamp, reply):
        target = self.find_by_timestamp(timestamp)
        if target:
            target.setdefault("replies", []).append(reply)
            return True
        return False

    def _find(self, comment_list, timestamp):
        for comment in comment_list:
            if comment["timestamp"] == timestamp:
                return comment
            found = self._find(comment.get("replies", []), timestamp)
            if found:
                return found
        return None

# Create single store instance
store = CommentStore()

# Background job to clear old comments
def clean_old_comments():
    store.clear_expired()
    print(f"[Cleaner] Remaining comments: {len(store.get_all())}")
    Timer(60, clean_old_comments).start()

@app.route('/comments', methods=['POST'])
def post_comment():
    data = request.json
    username = data.get("username", "").strip()
    text = data.get("text", "").strip()

    if not username or not text:
        return jsonify({"error": "Username and comment cannot be empty"}), 400

    new_comment = {
        "username": username,
        "text": text,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "likes": 0,
        "replies": []
    }

    store.add_comment(new_comment)
    return jsonify({"message": "Comment posted successfully!"}), 201

@app.route('/comments', methods=['GET'])
def get_comments():
    return jsonify(store.get_all())

@app.route('/comments/like', methods=['POST'])
def like_comment():
    data = request.json
    timestamp = data.get("timestamp")
    likes = store.like_by_timestamp(timestamp)
    if likes is not None:
        return jsonify({"message": "Comment liked!", "likes": likes}), 200
    return jsonify({"error": "Comment not found"}), 404

@app.route('/comments/reply', methods=['POST'])
def reply_to_comment():
    data = request.json
    timestamp = data.get("timestamp")
    text = data.get("text", "").strip()
    username = data.get("username", "").strip()

    if not text or not username:
        return jsonify({"error": "Username and reply text are required"}), 400

    reply = {
        "username": username,
        "text": text,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "replyingTo": "",
        "replies": []
    }

    success = store.add_reply(timestamp, reply)
    if success:
        return jsonify({"message": "Reply posted"}), 201
    return jsonify({"error": "Comment or reply not found"}), 404

# Start cleaner
clean_old_comments()

if __name__ == '__main__':
    print("Server running at http://127.0.0.1:8080")
    app.run(host='127.0.0.1', port=8080)
