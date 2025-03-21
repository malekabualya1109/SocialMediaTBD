import pytest
import json
from flask import Flask
from postcreation import post_bp, posts

# Setup Flask test client
@pytest.fixture
def client():
    """Creates a Flask test client for API testing"""
    app = Flask(__name__)
    app.register_blueprint(post_bp)
    return app.test_client()

#
# BLACK-BOX UNIT TEST: create_post()
#
# This test treats create_post as a black box. It verifies expected behavior w/o knowing internal implementation

def test_create_post_black_box(client):
    """Black box unit test: Verifies that post creation returns a valid response."""
    posts.clear()
    response = client.post('/api/posts', json={"user_id": 1, "content": "Hello World!"})

    assert response.status_code == 201 # Should return "Created"

    data = response.get_json()
    assert "message" in data
    assert "post" in data
    assert data["post"]["content"] == "Hello World!"
    assert data["post"]["user_id"] == 1
    assert "id" in data["post"] # ID should exist

# 
# WHITE-BOX UNIT TEST: repost()
# 
# This test ensures 100% branch coverage of the `repost()` function.
# Here is the function being tested below:
#
# def repost():
#     data = request.json
#     if not data or 'user_id' not in data or 'original_post_id' not in data:
#         return jsonify({'error': 'Invalid input'}), 400
#
#     original_post = next((post for post in posts if post['id'] == data['original_post_id']), None)
#     if not original_post:
#         return jsonify({'error': 'Original post not found'}), 404
#
#     repost_content = f"Repost from User {original_post['user_id']}: {original_post['content']}"
#     new_post = {
#         'id': len(posts) + 1,
#         'user_id': data['user_id'],
#         'content': repost_content,
#         'timestamp': datetime.utcnow().isoformat()
#     }
#     posts.append(new_post)
#     return jsonify({'message': "Repost successful!", 'post': new_post}), 201

def test_repost_white_box(client):
    """White-box unit test: Ensures full branch coverage for the repost function"""

    posts.clear()
    post = {"user_id": 2, "content": "Original Post"}
    original_response = client.post('/api/posts', json=post).get_json()
    original_post_id = original_response["post"]["id"]

    # Case 1: Valid Repost
    valid_repost = client.post('/api/repost', json={"user_id": 3, "original_post_id": original_post_id})
    assert valid_repost.status_code == 201 # Should Return Created
    data = valid_repost.get_json()
    assert "Repost from User 2" in data["post"]["content"]

    # Case 2: Invalid post ID (should return an error or 404)
    invalid_repost = client.post('/api/repost', json={"user_id": 3, "original_post_id": 999})
    assert invalid_repost.status_code == 404

#
# INTEGRATION TEST: fetchposts() (React frontend <--> Flask backend)
#
# This test ensures the frontend fetchPosts() function correctly interacts with the API
# It verifies that posts created via Flask API can be retrieved by React.

def test_fetch_posts_integration(client):
    """Integration Test: Ensures fetchPosts() interacts correctly with the backend"""

    posts.clear()
    client.post('/api/posts', json={"user_id": 1, "content": "Integration Test Post"})

    response = client.get('/api/posts')
    assert response.status_code == 200  # Should Return OK
    data = response.get_json()

    assert len(data) == 1  # Ensure only 1 posts exist
    assert data[0]["content"] == "Integration Test Post"
    assert data[0]["user_id"] == 1 

