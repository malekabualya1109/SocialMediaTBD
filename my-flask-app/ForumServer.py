from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from threading import Timer

app = Flask(__name__)
CORS(app)  

# Store comments in a simple list
comments = []  # Stores {"username": "User1", "text": "Hello!", "timestamp": "2025-02-21 12:00:00", "likes": 0}

# Automatically remove old comments every 60 seconds
def clean_old_comments(): #Renamed this function so it's cleaner.
    global comments 
    now = datetime.now()
    comments = [c for c in comments if datetime.strptime(c["timestamp"], "%Y-%m-%d %H:%M:%S") > now - timedelta(minutes=1)]
    print(f"Comments cleaned. Remaining: {len(comments)}")
    Timer(60, clean_old_comments).start()

# Post a Comment (No authentication, anyone can post, this will eventually change )
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
        "likes": 0
    }
    comments.append(new_comment)
    return jsonify({"message": "Comment posted successfully!"}), 201

# Get All Comments
@app.route('/comments', methods=['GET'])
def get_comments():
    return jsonify(comments)

# Like a Comment 
@app.route('/comments/like', methods=['POST'])
def like_comment():
    data = request.json
    timestamp = data.get("timestamp")

    for comment in comments:
        if comment["timestamp"] == timestamp:
            comment["likes"] += 1
            return jsonify({"message": "Comment liked!", "likes": comment["likes"]}), 200

    return jsonify({"error": "Comment not found"}), 404

# Start cleaning old comments
clean_old_comments()

if __name__ == '__main__':
    print("Server running at http://127.0.0.1:8080")
    app.run(host='127.0.0.1', port=8080)

