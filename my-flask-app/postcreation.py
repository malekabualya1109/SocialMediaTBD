from flask import Blueprint, request, jsonify
from flask_cors import CORS
from datetime import datetime

post_bp = Blueprint('post_bp', __name__)
CORS(post_bp)

posts = []

# Create a post
@post_bp.route('/api/posts', methods=['POST'])
def create_post():
    data = request.json
    if not data or not data.get('user_id') or not data.get('content'):
        return jsonify({'error': 'Invalid input'}), 400

    new_post = {
        'id': len(posts) + 1,
        'user_id': data['user_id'],
        'content': data['content'].strip(),
        'timestamp': datetime.utcnow().isoformat(),
        'repost_count': 0  # new field added
    }

    posts.append(new_post)
    print(f"[POST CREATED] {new_post}")

    return jsonify({'message': "Post created successfully!", 'post': new_post}), 201

# Get all posts
@post_bp.route('/api/posts', methods=['GET'])
def get_posts():
    sorted_posts = sorted(posts, key=lambda x: x['timestamp'], reverse=True)
    return jsonify(sorted_posts)

# Repost an existing post
@post_bp.route('/api/repost', methods=['POST'])
def repost():
    data = request.json
    if not data or not data.get('user_id') or not data.get('original_post_id'):
        return jsonify({'error': 'Invalid input'}), 400

    original_post = next((p for p in posts if p['id'] == data['original_post_id']), None)

    if not original_post:
        return jsonify({'error': 'Original post not found'}), 404

    # Increment repost count
    original_post['repost_count'] = original_post.get('repost_count', 0) + 1

    repost_content = f"Repost from User {original_post['user_id']}: {original_post['content']}"
    new_post = {
        'id': len(posts) + 1,
        'user_id': data['user_id'],
        'content': repost_content,
        'timestamp': datetime.utcnow().isoformat(),
        'repost_count': 0  # reposts start fresh
    }

    posts.append(new_post)
    print(f"[REPOST CREATED] {new_post}")

    return jsonify({'message': "Repost successful!", 'post': new_post}), 201
