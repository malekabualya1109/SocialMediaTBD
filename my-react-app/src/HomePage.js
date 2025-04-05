import React, { useEffect, useState } from 'react'
import './App.css';
import StoryUpload from './storyUpload';
import ViewPosts from './ViewPosts';
import './index.css'; 
import './userAccount.css';
import DailyForum from './dailyForum';
import './smallerPage.css';
import './user-profile.css';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function HomePage(){
    const [message, setMessage] = useState('');
    const [content, setContent] = useState('');
    const [postMessage, setPostMessage] = useState('');
    const [posts, setPosts] = useState([]);  
  
    // Fatimah: variables for users 
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [newUser, setNewUser] = useState(false);
  
    // Fatimah : variables to set up username and passwords
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
  
    // Fatimah: variables to show errors for login
    const [authMessage, setAuthMessage] = useState('');
  
    // Fatimah: Pick Interests popup
    const [showInterestsPrompt, setShowInterestsPrompt] = useState(false);
  
    //Fatimah:user id for the interest
    const[userId, setUserId] = useState(false);

    //mona: to upload image
    const [uploadedStories, setUploadedStories] = useState([]);

    const navigate = useNavigate();

    //mona: fetching stories
    useEffect(() => {
      fetch('http://localhost:5000/api/stories')
        .then((res) => res.json())
        .then((data) => setUploadedStories(data))
        .catch((err) => console.error('Error fetching stories:', err));
    }, []);
    

    useEffect(() => {
      const isUserAuthenticated = localStorage.getItem('isAuthenticated');
      if(isUserAuthenticated) {
        setIsAuthenticated(true);
        setUsername(localStorage.getItem('username'));
      }
      else{
        setIsAuthenticated(false);
      }
    }, [])
  
    // Fatimah: Hard-coded available interests for now
    const availableInterests = [
      { id: 1, label: 'Music' },
      { id: 2, label: 'Sports' },
      { id: 3, label: 'Movies' },
      { id: 4, label: 'Photography' },
    ];
    const [selectedInterests, setSelectedInterests] = useState([]);
  
  
      // Fatimah: Toggle an interest
    const handleInterestChange = (interestId) => {
      setSelectedInterests((prev) => {
        if (prev.includes(interestId)) {
          return prev.filter((id) => id !== interestId);
        } else {
          return [...prev, interestId];
        }
      });
    };
  
    // Fetch posts from backend (FR2) (MALEK)
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
  
    useEffect(() => {
      fetchPosts();  // Fetch posts when the app loads
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
      console.log("Post button clicked");
    
      if (!content.trim()) {
        console.error("Cannot post an empty message");
        return;
      }
    
      try {
        console.log("Sending request to backend...");
    
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
    
        console.log("API request sent!");
    
        const data = await response.json();
        if (response.status === 201) {
          console.log("Post successful:", data);
          setContent("");  // Clear input box
    
          // Immediately update the posts list **without needing a refresh**
          setPosts((prevPosts) => [data.post, ...prevPosts]);
    
        } else {
          console.error("Post failed:", data);
        }
      } catch (error) {
        console.error("Failed to connect to backend:", error);
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
          localStorage.setItem('isAuthenticated', true);
          localStorage.setItem('username', username)
          setAuthMessage('You logged in successfully. Welcome to Tea Talks!');
          navigate('/');
        } else {
          setAuthMessage(data.error || 'Login failed.');
        }
      } catch (error) {
        setAuthMessage('Error connecting to server');
      }
    };

    // MONA: handling logout logic
    const handleLogout = () => {
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('username');
      navigate('/');
    }
  
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
          //when you sign up, the user id becomes the user id of the one who just signed up
          setUserId(data.user_id);
  
          setAuthMessage('You signed up successfully. Welcome to Tea Talks!');
          setShowInterestsPrompt(true);
          localStorage.setItem('isAuthenticated', true);
          localStorage.setItem('username', username);
          navigate('/');
        } else {
          setAuthMessage(data.error || 'Signup failed.');
        }
      } catch (error) {
        setAuthMessage('Error connecting to server');
      }
    };
  
    //Fatimah: the interest bar:
      // Save selected interests (after sign up)
    const handleSaveInterests = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/set_interests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId, // the user id cause why not
            interests: selectedInterests,
          }),
        });
        const data = await response.json();
  
        if (response.ok) {
          // Hide the prompt
          setShowInterestsPrompt(false);
          console.log('Interests saved successfully!');
        } else {
          console.error('Error saving interests:', data);
        }
      } catch (error) {
        console.error('Error connecting to server:', error);
      }
    };
    
    /*Emma */
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  
    /*Emma */
    const toggleDropdown = () => {
      setIsDropdownVisible(!isDropdownVisible);
    };
  
  
    return(
      <div className="App"> 
  
      {!isAuthenticated && (
          <header className="navigation1">
            <h1>Welcome to Tea Talks</h1>
          </header>
      )}
          
      
          {isAuthenticated && (
            <>
              <header className="header">
                <h1>Tea Talks</h1>
                <ul>
                  <li>Notifications</li>
                  <li><Link to="/profile">User Profile</Link></li>
                  <li>
                    <div className="setting" onClick={toggleDropdown}>
                      Settings
                      {isDropdownVisible && (
                        <ul className="setting-menu">
                          <li>Change Password</li>
                          <li>Update Username</li>
                          <button onClick={handleLogout}>Logout</button>
                        </ul>
                      )}
                    </div>
                  </li>
                </ul>
              </header>
              
     
              <section className="sidebar">
                <header className="storySection">
                  <div className="uploadStory-link">
                    <Link to="/upload-story">New Story</Link>
                  </div>
                </header>
                
                {/* Shoe uploaded story circles */}
                <div className="storyContainer">
                  {uploadedStories.length > 0 && (
                    <div style={{ display: 'flex', overflowX: 'scroll', padding: '10px' }}>
                      {uploadedStories.map((story, index) => (
                        <div key= { index } className="storyCircle">
                          <img
                            src={`http://localhost:5000/uploads/${story.filename}`}
                            alt={`Story ${index}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => console.log("Image load error: ", e.target.src)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/*Maria's link*/}
                <header className = "daily-forum">
                  <div className = "dailyForum-link">
                    <Link to="/daily-forum">Daily Forum</Link>
                  </div>
                </header>
          
              </section>
  
              <section className="friendbar">
                <h4>Friends List</h4>
              </section>
  
              <footer className="footer">
                <p>Copyright of WSU Computer Science Students</p>
              </footer>
            </>
          )}

          
      
          {/* Display the fetched message from Flask */}
          {/* <p>{message || 'Backend data stuff'}</p> */}
      
          {/* Login and sign-up button */}
          {!isAuthenticated && (
            <div className="auth-container">
              {/* Emma added this bit in here with the mug icon */}
              <div className="mugIcon">
                <i className="fa-solid fa-mug-hot"></i>
              </div>
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
            <div className="content-wrapper">
      
              <section className="main">
              <div className = "viewPosts">
                  <ViewPosts posts={posts} setPosts={setPosts} />
                </div> 
                <div>
                  <textarea class="postArea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)} 
                    placeholder="Write your post..."
                  />
                  <button class="postButton" onClick={handlePost}>Post</button>
                  <p>{postMessage}</p>
                </div>
                {/* View Posts (FR2) (Malek) */}
  
  
          {/* This interest prompt only shows if someone signs up */}
          {showInterestsPrompt && (
            <div className="interest-modal">
              <div className="interest-modal-content">
                <h3>Pick your interests</h3>
                {availableInterests.map((intObj) => (
                  <label key={intObj.id} style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      checked={selectedInterests.includes(intObj.id)}
                      onChange={() => handleInterestChange(intObj.id)}
                    />
                    {intObj.label}
                  </label>
                ))}
                <button onClick={handleSaveInterests} style={{ marginTop: '10px' }}>
                  Save Interests
                </button>
              </div>
            </div>
          )}
  
              </section>
            </div>
          )}
        </div> 
      );
    }
    export default HomePage;