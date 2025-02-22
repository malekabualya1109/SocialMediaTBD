import React, { useState, useEffect } from 'react';
import './App.css';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

function App() {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [username, setUsername] = useState('Maria'); // Default username
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Fetch comments from the backend
  const fetchComments = async () => {
    try {
      const response = await fetch('http://localhost:8080/comments'); // Adjusted endpoint
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSendComment = async () => {
    if (comment.trim()) {
      if (window.confirm('Are you sure you want to submit?')) {
        try {
          const response = await fetch('http://localhost:8080/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, text: comment }), // Send JSON instead of plain text
          });

          if (response.ok) {
            setComment('');
            fetchComments(); // Refresh comments after posting
          } else {
            console.error('Failed to send comment.');
          }
        } catch (error) {
          console.error('Error sending comment:', error);
        }
      }
    }
  };

  const handleLike = async (timestamp) => {
    try {
      const response = await fetch('http://localhost:8080/comments/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp }), // Send timestamp to like the comment
      });

      if (response.ok) {
        fetchComments(); // Refresh comments to update like count
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  return (
    <div className="container">
      <h1>Tea Talk</h1>

      {/* Username Selection */}
      <label>Select Username: </label>
      <select value={username} onChange={(e) => setUsername(e.target.value)}>
        <option value="Maria">User1</option>
        <option value="Cielo">User2</option>
      </select>

      <div className="comments-section">
        {comments.length > 0 ? (
          comments.map((cmt, index) => (
            <div key={index} className="comment-box">
              <p><strong>{cmt.username} - {cmt.timestamp}</strong></p>
              <p>{cmt.text}</p>
              <button onClick={() => handleLike(cmt.timestamp)}>👍 {cmt.likes}</button>
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}
      </div>

      <div className="comment-input">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Type your comment..."
          className="input-bar"
        />
        <button onClick={handleSendComment} className="send-button">Send</button>
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="emoji-button">😊</button>
        {showEmojiPicker && (
          <div className="emoji-picker">
            <Picker data={data} onEmojiSelect={(emoji) => setComment(comment + emoji.native)} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;



