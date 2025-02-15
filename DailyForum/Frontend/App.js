import React, { useState, useEffect } from 'react';
import './App.css';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

function App() {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Fetch comments from the backend
  const fetchComments = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/comments');
      const data = await response.json();  // Parse response as JSON
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSendComment = () => {
    if (comment.trim()) {
      if (window.confirm('Are you sure you want to submit?')) {
        fetch('http://localhost:8080/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: comment,
        })
          .then(response => {
            if (response.ok) {
              setComments([...comments, { timestamp: new Date().toLocaleString(), text: comment }]);
              setComment('');
            } else {
              console.error('Failed to send comment.');
            }
          })
          .catch(error => console.error('Error sending comment:', error));
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendComment();
    }
  };

  return (
    <div className="container">
      <h1>Daily Forum</h1>
      <div className="comments-section">
        {comments.length > 0 ? (
          comments.map((cmt, index) => (
            <div key={index} className="comment-box">
              <p><strong>{cmt.timestamp}</strong></p>
              <p>{cmt.text}</p>
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
          onKeyDown={handleKeyPress}
          placeholder="Type your comment..."
          className="input-bar"
        />
        <button onClick={handleSendComment} className="send-button">
          Send
        </button>
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="emoji-button">
          😊
        </button>
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


