from flask import Blueprint, request, jsonify
from flask_cors import CORS

# Initialize Blueprint for post creation
post_bp = Blueprint('post_bp', __name__)
CORS(post_bp)  # Enable CORS for this blueprint

# Temporary in-memory storage for posts
posts = []

# API route to create a post
@post_bp.route('/api/posts', methods=['POST'])
def create_post():
    data = request.json
    if not data or 'user_id' not in data or 'content' not in data:
        return jsonify({'error': 'Invalid input'}), 400

    # Create a new post object
    new_post = {
        'id': len(posts) + 1,  # Generate a simple ID
        'user_id': data['user_id'],
        'content': data['content']
    }

    # Store post in memory
    posts.append(new_post)

    return jsonify({
        'message': "Post created successfully!",
        'post': new_post
    }), 201

# API route to get all posts
@post_bp.route('/api/posts', methods=['GET'])
def get_posts():
    return jsonify(posts)
