import React, { useEffect, useState } from 'react';
import './App.css';
import StoryUpload from './storyUpload';
import ViewPosts from './ViewPosts'; // ✅ Added ViewPosts Component

function App() {
  const [message, setMessage] = useState('');
  const [content, setContent] = useState('');
  const [postMessage, setPostMessage] = useState('');
  const [posts, setPosts] = useState([]);  // ✅ Added posts state

  // Fatimah: variables for users 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newUser, setNewUser] = useState(false);

  // Fatimah : variables to set up username and passwords
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Fatimah: variables to show errors for login
  const [authMessage, setAuthMessage] = useState('');

  // ✅ Fetch posts from backend (FR2)
  const fetchPosts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();  // ✅ Fetch posts when the app loads
  }, []);

  useEffect(() => {
    // Fetch data from Flask backend (message from home route "/")
    fetch('http://127.0.0.1:5000/') 
      .then((response) => response.text()) 
      .then((data) => setMessage(data))
      .catch((error) => console.log('Error fetching data:', error));
  }, []);

  // Function to handle post submission (MALEK)
  const handlePost = async () => {
    console.log("✅ Post button clicked");
  
    if (!content.trim()) {
      console.error("❌ Cannot post an empty message");
      return;
    }
  
    try {
      console.log("📡 Sending request to backend...");
  
      const response = await fetch('http://127.0.0.1:5000/api/posts', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1,  // Replace with actual user ID if needed
          content: content, 
        }),
      });
  
      console.log("📡 API request sent!");
  
      const data = await response.json();
      if (response.status === 201) {
        console.log("✅ Post successful:", data);
        setContent("");  // ✅ Clear input box
  
        // ✅ Immediately update the posts list **without needing a refresh**
        setPosts((prevPosts) => [data.post, ...prevPosts]);
  
      } else {
        console.error("❌ Post failed:", data);
      }
    } catch (error) {
      console.error("❌ Failed to connect to backend:", error);
    }
  };
  

  // Fatimah: created the handle login function that handles logging in
  const handleLogin = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      }); 
      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setAuthMessage('You logged in successfully. Welcome to Tea Talks!');
      } else {
        setAuthMessage(data.error || 'Login failed.');
      }
    } catch (error) {
      setAuthMessage('Error connecting to server');
    }
  };

  // Fatimah: created the sign-up function
  const handleSignUp = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      }); 
      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setAuthMessage('You signed up successfully. Welcome to Tea Talks!');
      } else {
        setAuthMessage(data.error || 'Signup failed.');
      }
    } catch (error) {
      setAuthMessage('Error connecting to server');
    }
  };
  
  /*Emma */
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  /*Emma */
  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };


  return (

    /*Emma: Navigation Bar/Page Layout*/
    <div className="App">
      {!isAuthenticated && (
      <header className="navigation1">
        <h1>Welcome to Tea Talks</h1>
      </header>
      )} 
        {isAuthenticated && (
          <header className="navigation">
        <h1>Tea Talks</h1>
        <ul>
          <li>Notifications</li>
          <li>User Profile</li>
          <li>
            <div className = "setting" onClick={toggleDropdown}>
              Settings
                {isDropdownVisible && (
                <ul className = "setting-menu">
                  <li>Change Password</li>
                  <li>Update Username</li>
                </ul>
                )} 
              </div>
          </li>
        </ul> 
        </header>
      )} 


      {/* Display the fetched message from Flask */}
    {/*  <p>{message || 'Backend data stuff'}</p>*/}

      {/* Login and sign-up button */}
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
          <button onClick={newUser ? handleSignUp : handleLogin}>
            {newUser ? 'Sign Up' : 'Login'}
          </button>
          <p>{authMessage}</p>
          <p
            style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
            onClick={() => {
              // Toggle between login and sign-up modes
              setNewUser(!newUser);
              setAuthMessage('');
            }}
          >
            {newUser ? 'Already have an account? Login' : 'New user? Sign Up'}
          </p>
        </div>
      )}

      {/* This shows only if someone is logged in */}
      {isAuthenticated && (
        <>
          <header className="storySection">
            <StoryUpload />
          </header>
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}  // ✅ Ensure state updates
              placeholder="Write your post..."
            />
            <button onClick={handlePost}>Post</button>
            <p>{postMessage}</p>
          </div>

          {/* ✅ View Posts (FR2) */}
          <ViewPosts posts={posts} setPosts={setPosts} />
        </>
      )}
    </div>
  );
}

export default App;
