import React, { useEffect, useState } from 'react';

function ViewPosts() {
  const [posts, setPosts] = useState([]);

  // Function to fetch posts from the API
  const fetchPosts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/posts');
      const data = await response.json();

      console.log("Received posts from API:", data); // Debugging API response
      console.log("Data type:", typeof data); // Check if it's an array

      if (Array.isArray(data) && data.length > 0) {
        setPosts(data);  // Update state with posts
      } else {
        console.warn("API returned empty or incorrect format:", data);
        setPosts([]);  // Ensure empty state is handled
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Function to handle reposting
  const handleRepost = async (originalPostId) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/repost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1, // Replace with dynamic user ID when authentication is implemented
          original_post_id: originalPostId,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        console.log("Repost successful:", data);
        setPosts((prevPosts) => [data.post, ...prevPosts]); // Add reposted post to UI
      } else {
        console.error("Repost failed:", data);
      }
    } catch (error) {
      console.error("Error reposting:", error);
    }
  };

  // Fetch posts when component mounts
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
