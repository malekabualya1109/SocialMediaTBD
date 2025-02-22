from flask import Blueprint, request, jsonify
from flask_cors import CORS
from datetime import datetime

# Initialize Blueprint for posts
post_bp = Blueprint('post_bp', __name__)
CORS(post_bp)

# Temporary in-memory storage for posts
posts = []

# API route to create a post
@post_bp.route('/api/posts', methods=['POST'])
def create_post():
    data = request.json
    if not data or 'user_id' not in data or 'content' not in data:
        return jsonify({'error': 'Invalid input'}), 400

    new_post = {
        'id': len(posts) + 1,
        'user_id': data['user_id'],
        'content': data['content'],
        'timestamp': datetime.utcnow().isoformat()
    }

    posts.append(new_post)  # Save post

    print(f"New Post Created: {new_post}")  # Debugging

    return jsonify({
        'message': "Post created successfully!",
        'post': new_post
    }), 201

# API route to get all posts
@post_bp.route('/api/posts', methods=['GET'])
def get_posts():
    sorted_posts = sorted(posts, key=lambda x: x['timestamp'], reverse=True)
    return jsonify(sorted_posts)

# API route to repost an existing post
@post_bp.route('/api/repost', methods=['POST'])
def repost():
    data = request.json
    if not data or 'user_id' not in data or 'original_post_id' not in data:
        return jsonify({'error': 'Invalid input'}), 400

    # Find the original post
    original_post = next((post for post in posts if post['id'] == data['original_post_id']), None)
    
    if not original_post:
        return jsonify({'error': 'Original post not found'}), 404

    # Create a new post as a repost
    repost_content = f"Repost from User {original_post['user_id']}: {original_post['content']}"
    new_post = {
        'id': len(posts) + 1,
        'user_id': data['user_id'],
        'content': repost_content,
        'timestamp': datetime.utcnow().isoformat()
    }

    posts.append(new_post)  # Save repost

    print(f"New Repost Created: {new_post}")  # Debugging

    return jsonify({
        'message': "Repost successful!",
        'post': new_post
    }), 201
