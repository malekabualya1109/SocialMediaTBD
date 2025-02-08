import React, { useState, useEffect } from 'react';
import './App.css'; // Import custom CSS for styling

function App() {
  // State to keep track of the current comment being typed
  const [comment, setComment] = useState('');
  
  // State to store the list of comments fetched from the backend
  const [comments, setComments] = useState([]);

  // useEffect to fetch comments from the backend when the page first loads
  useEffect(() => {
    fetch('http://localhost:8080/api/comments')
      .then(response => response.text()) // Convert the response to plain text
      .then(data => {
        // Split the data by newline and map each line into a comment object with timestamp and text
        const parsedComments = data.split('\n').map(cmt => {
          const [timestamp, ...textParts] = cmt.split('] '); // Split each comment at the first "] " to separate the timestamp
          const text = textParts.join('] '); // Join the remaining parts to handle cases where "]" is part of the comment
          return { timestamp: timestamp.replace('[', ''), text }; // Remove the leading "[" from the timestamp
        });
        setComments(parsedComments); // Update the state with the parsed comments
      })
      .catch(error => console.error('Error fetching comments:', error)); // Log an error if the fetch fails
  }, []); // Empty dependency array means this runs only once when the component mounts

  // Function to handle sending a new comment
  const handleSendComment = () => {
    if (comment.trim()) { // Ensure the comment isn't just whitespace
      console.log('Sending comment:', comment); // Log the comment for debugging
      fetch('http://localhost:8080/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain', // Content type is plain text, not JSON
        },
        body: comment, // Send the comment as the request body
      })
        .then(response => {
          console.log('Response status:', response.status); // Log the response status for debugging
          if (response.ok) {
            // Add the new comment to the existing list with the current timestamp
            setComments([...comments, { timestamp: new Date().toLocaleString(), text: comment }]);
            setComment(''); // Clear the input field after sending the comment
          } else {
            console.error('Failed to send comment. Status:', response.status);
          }
        })
        .catch(error => console.error('Error sending comment:', error)); // Handle any errors during the request
    }
  };

  return (
    <div className="container">
      <h1>Daily Forum</h1>
      <div className="comments-section">
        {/* Render each comment with its timestamp and text */}
        {comments.length > 0 ? (
          comments.map((cmt, index) => (
            <div key={index} className="comment-box">
              <p><strong>{cmt.timestamp}</strong></p> {/* Display the timestamp */}
              <p>{cmt.text}</p> {/* Display the comment text */}
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to comment!</p> // Show this message if there are no comments
        )}
      </div>
      <div className="comment-input">
        {/* Input box for typing a comment */}
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)} // Update state as the user types
          placeholder="Type your comment..."
          className="input-bar"
        />
        {/* Button to send the comment */}
        <button onClick={handleSendComment} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
}

export default App;


