from flask import Blueprint, request, jsonify
from flask_cors import CORS
from datetime import datetime

# ✅ Initialize Blueprint for posts
post_bp = Blueprint('post_bp', __name__)
CORS(post_bp)

# ✅ Temporary in-memory storage for posts
posts = []

# ✅ API route to create a post (Using Blueprint correctly)
@post_bp.route('/api/posts', methods=['POST'])
def create_post():
    data = request.json
    if not data or 'user_id' not in data or 'content' not in data:
        return jsonify({'error': 'Invalid input'}), 400

    new_post = {
        'id': len(posts) + 1,
        'user_id': data['user_id'],
        'content': data['content'],
        'timestamp': datetime.utcnow().isoformat()  # UTC timestamp
    }

    posts.append(new_post)

    return jsonify({
        'message': "Post created successfully!",
        'post': new_post
    }), 201

# ✅ API route to get all posts (Using Blueprint correctly)
@post_bp.route('/api/posts', methods=['GET'])
def get_posts():
    sorted_posts = sorted(posts, key=lambda x: x['timestamp'], reverse=True)
    return jsonify(sorted_posts)
