from flask import Flask, request, jsonify
from datetime import datetime, timedelta
from threading import Timer

app = Flask(__name__)

# Thread-safe list of comments
comments = []

def remove_old_comments():
    """Removes comments older than 1 minute every 60 seconds."""
    global comments
    current_time = datetime.now()
    comments = [
        comment for comment in comments
        if datetime.strptime(comment['timestamp'], "%Y-%m-%d %H:%M:%S") > current_time - timedelta(minutes=1)
    ]
    print(f"Checked and removed old comments. Remaining comments: {len(comments)}")
    Timer(60, remove_old_comments).start()

@app.route('/api/comments', methods=['GET', 'POST', 'OPTIONS'])
def comments_handler():
    if request.method == 'GET':
        print("GET request received")
        response = jsonify(comments)  # Return comments as JSON
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response

    elif request.method == 'POST':
        print("POST request received")
        new_comment_text = request.data.decode('utf-8').strip()
        if new_comment_text:
            new_comment = {
                "text": new_comment_text,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            comments.append(new_comment)
            print(f"Comment added: {new_comment}")
            response = jsonify({"message": "Comment added successfully!"})
            response.headers["Access-Control-Allow-Origin"] = "*"
            return response, 200
        else:
            return "Invalid comment", 400

    elif request.method == 'OPTIONS':
        response = app.response_class(status=204)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response

remove_old_comments()

if __name__ == '__main__':
    print("Starting the server on http://127.0.0.1:8080")
    app.run(host='127.0.0.1', port=8080)
