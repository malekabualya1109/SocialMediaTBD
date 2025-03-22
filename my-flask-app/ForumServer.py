from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from threading import Timer

app = Flask(__name__)
CORS(app)

# Store comments in memory
comments = []

# Auto-remove comments older than 1 minute
def clean_old_comments():
    global comments
    now = datetime.now()
    comments = [
        c for c in comments
        if datetime.strptime(c["timestamp"], "%Y-%m-%d %H:%M:%S") > now - timedelta(minutes=1)
    ]
    print(f"[Cleaner] Remaining comments: {len(comments)}")
    Timer(60, clean_old_comments).start()

# Post a new comment
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
        "replies": []  # ← make sure replies are always initialized
    }
    comments.append(new_comment)
    return jsonify({"message": "Comment posted successfully!"}), 201

# Get all comments
@app.route('/comments', methods=['GET'])
def get_comments():
    return jsonify(comments)

# Like a comment
@app.route('/comments/like', methods=['POST'])
def like_comment():
    data = request.json
    timestamp = data.get("timestamp")

    for comment in comments:
        if comment["timestamp"] == timestamp:
            comment["likes"] += 1
            return jsonify({"message": "Comment liked!", "likes": comment["likes"]}), 200

    return jsonify({"error": "Comment not found"}), 404

# Reply to a comment
@app.route('/comments/reply', methods=['POST'])
def reply_to_comment():
    data = request.json
    timestamp = data.get("timestamp")
    text = data.get("text", "").strip()
    username = data.get("username", "").strip()

    if not text or not username:
        return jsonify({"error": "Username and reply text are required"}), 400

    for comment in comments:
        if comment["timestamp"] == timestamp:
            reply = {
                "username": username,
                "text": text,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "replyingTo": comment["username"]  
            }
            if "replies" not in comment:
                comment["replies"] = []
            comment["replies"].append(reply)
            return jsonify({"message": "Reply posted"}), 201

    return jsonify({"error": "Original comment not found"}), 404

# Start background cleaner
clean_old_comments()

if __name__ == '__main__':
    print("Server running at http://127.0.0.1:8080")
    app.run(host='127.0.0.1', port=8080)


