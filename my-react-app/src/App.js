import React, { useEffect, useState } from 'react';
import './App.css';
import StoryUpload from './storyUpload';

function App() {
  const [message, setMessage] = useState('');
  const [content, setContent] = useState('');
  const [postMessage, setPostMessage] = useState('');


  // Fatimah: variables for users 

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newUser, setNewUser] = useState(false);

  // Fatimah : variables to set up username and passwords

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  //Fatimah: variables to show errors for login
  const [authMessage, setAuthMessage] = useState('');



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


  //Fatimah: created the handle login fucntion that handles logging in

  const handleLogin = async() =>{

    // try only works with catch, otherwise it wont work

    try{
      const response = await fetch('http://127.0.0.1:5000/api/login',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({username, password}),
      }); 
      const data = await response.json();

      if (response.ok){

        setIsAuthenticated(true);
        setAuthMessage('You logged in successfully. Welcome in Pal');

      }

      else {
        setAuthMessage( data.error || 'loggin failed pal');
      }

    }

    catch (error) {
      setAuthMessage('Error connecting to server');
    }

};

// Fatimah: created the sign up function

  const handleSignUp = async() =>{

    // try only works with catch, otherwise it wont work

    try{
      const response = await fetch('http://127.0.0.1:5000/api/signup',{
         method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      }); 
      const data = await response.json();

      if (response.ok){

        setIsAuthenticated(true);
        setAuthMessage('You logged in successfully. Welcome ib Pal');

      }

      else {
        setAuthMessage(data.error || 'loggin failed pal');
      }

    }

    catch (error) {
      setAuthMessage('Error connecting to server');
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

      {/* Display the fetched message from Flask */}
      <p>{message || 'Backend data stuff'}</p>

      
     { /*logginn button and sign up button*/}
      {!isAuthenticated && (

        <div className="auth-container">
          <h2>{newUser ? 'Sign Up' : 'Login'}</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button onClick={newUser ? handleSignUp: handleLogin}>
            {newUser ? 'Sign Up' : 'Login'}
          </button>
          <p>{authMessage}</p>
          <p
            style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
            onClick={() => {
              // Toggle between login and sign up modes
              setNewUser(!newUser);
              setAuthMessage('');
            }}
          >
            {newUser ? 'Already have an account? Login' : 'New user? Sign Up'}
          </p>
        </div>
      )}

      {/* this shows only if someone logged in or signup*/}
      {isAuthenticated && (
        <>
          <header className="storySection">
            <StoryUpload />
          </header>
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post..."
            />
            <button onClick={handlePost}>Post</button>
            <p>{postMessage}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default App;