import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [content, setContent] = useState('');
  const [postMessage, setPostMessage] = useState('');

  useEffect(() => {
    // Fetch data from Flask backend (message from home route "/")
    fetch('http://127.0.0.1:5000/') 
      .then((response) => response.text()) 
      .then((data) => setMessage(data))
      .catch((error) => console.log('Error fetching data:', error));
  }, []);

  // Function to handle post submission
  const handlePost = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1, // Replace with dynamic user ID if needed
          content,
        }),
      });

      const data = await response.json();
      if (response.status === 201) {
        setPostMessage('Post created successfully!');
        setContent(''); // Clear textarea
      } else {
        setPostMessage('Error creating post');
      }
    } catch (error) {
      setPostMessage('Failed to connect to backend');
    }
  };

  return (
    <div className="App">
      <header className="navigation">
        <h1>Tea Talks</h1>
        <ul>
          <li>Notifications</li>
          <li>User Profile</li>
          <li>Settings</li>
        </ul>
      </header>

      <p>{message || 'Backend data stuff'}</p> {/* Flask message */}

      {/* Create Post Section */}
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post..."
        />
        <button onClick={handlePost}>Post</button>
        <p>{postMessage}</p> {/* Feedback message after posting */}
      </div>
    </div>
  );
}

export default App;

