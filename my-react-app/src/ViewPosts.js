import React, { useEffect, useState } from 'react';

function ViewPosts() {
  const [posts, setPosts] = useState([]);

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
          user_id: 1, // Replace with actual user ID
          original_post_id: originalPostId,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        setPosts((prev) => [data.post, ...prev]);
      } else {
        console.error("Repost failed:", data);
      }
    } catch (error) {
      console.error("Error reposting:", error);
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
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <strong>User {post.user_id}:</strong> {post.content}
              <br />
              <small>{new Date(post.timestamp).toLocaleString()}</small>
              <br />
              <button onClick={() => handleRepost(post.id)}>Repost</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ViewPosts;
