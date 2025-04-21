import React, { useEffect, useState } from 'react';
import './App.css';

function ViewPosts({ posts, setPosts, username }) {
  const [commentInputs, setCommentInputs] = useState({});

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/posts');
      const data = await response.json();
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        console.warn("Unexpected API response format");
        setPosts([]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleRepost = async (originalPostId) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/repost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username, 
          original_post_id: originalPostId,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        fetchPosts();
      } else {
        console.error("Repost failed:", data);
      }
    } catch (error) {
      console.error("Error reposting:", error);
    }
  };

  const handleDelete = async (postId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/posts/${postId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Post deleted:", data);
        fetchPosts();
      } else {
        console.error("Failed to delete post:", data);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/posts/${postId}/like`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        fetchPosts();
      } else {
        console.error("Failed to like post:", data);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  const handleComment = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText || commentText.trim() === '') return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, text: commentText }),
      });

      const data = await response.json();
      if (response.ok) {
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        fetchPosts();
      } else {
        console.error("Failed to comment:", data);
      }
    } catch (error) {
      console.error("Error commenting:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div>
      <h2>Recent Posts</h2>
      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        <div className="postsGrid">
          <ul>
            {posts.map((post) => (
              <li key={post.id} style={{ marginBottom: '30px' }}>
                <strong>{post.username}:</strong> {post.content}
                <br />
                <small>{new Date(post.timestamp).toLocaleString()}</small>
                <br />
                <em>Reposts: {post.repost_count || 0}</em>
                <br />
                <button onClick={() => handleRepost(post.id)}>Repost</button>
                <button onClick={() => handleLike(post.id)}>Like ({post.likes || 0})</button>
                {post.user_id === 1 && post.content.startsWith("Repost from User") && (
                  <button onClick={() => handleDelete(post.id)}>Delete Repost</button>
                )}

                <div style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    placeholder="Add a comment"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                  />
                  <button onClick={() => handleComment(post.id)}>Comment</button>
                </div>

                {post.comments && post.comments.length > 0 && (
                  <ul>
                    {post.comments.map((c, idx) => (
                      <li key={idx}>
                        <strong>{c.username}:</strong> {c.text}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ViewPosts;
