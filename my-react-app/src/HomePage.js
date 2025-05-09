import React, { useEffect, useState } from 'react'
import './App.css';
import ViewPosts from './ViewPosts';
import './index.css'; 
import './userAccount.css';
import './smallerPage.css';
import './user-profile.css';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Interest from './Interest';

function HomePage(){
    const [message, setMessage] = useState('');
    const [content, setContent] = useState('');
    const [postMessage, setPostMessage] = useState('');
    const [posts, setPosts] = useState([]); 
    const [users, setUsers] = useState([]);
    const [friends, setFriends] = useState([]);

 
  
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
    const[userId, setUserId] = useState(null); // nul or false

    //mona: to upload image
    const [uploadedStories, setUploadedStories] = useState([]);

    const navigate = useNavigate();

    const [profilePic, setProfilePic] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null); // <-- for popup
  const [isModalOpen, setIsModalOpen] = useState(false);

    //mona
    useEffect(() => {
      const savedProfilePic = localStorage.getItem("profilePic");
      if (savedProfilePic) {
        setProfilePic(savedProfilePic);
      }
    }, []);

    //mona
    const handleStoryClick = (story) => {
      setSelectedStory(story);
      setIsModalOpen(true);
    };

    //mona
    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedStory(null);
    };

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
    useEffect(() => {
      fetch("http://localhost:5000/api/users")
        .then((res) => res.json())
        .then((data) => {
          setUsers(data); //Get all the users available in the db (just something for now...)
        });
    }, []);

    useEffect(() => {
      if (username) {
        fetch(`http://localhost:5000/api/user/${username}`)
          .then(res => res.json())
          .then(data => {
            if (data.user_id) {
              setUserId(data.user_id);
            }
          })
          .catch(err => console.error("Error fetching user by username:", err));
      }
    }, [username]);

    useEffect(() => {
      if (username) {
        fetch(`http://localhost:5000/api/friends/${username}`)
          .then((res) => res.json())
          .then((data) => {
            setFriends(data); // assuming backend returns an array of friend usernames
          })
          .catch((err) => console.error("Error fetching friends:", err));
      }
    }, [username]);
    
    
    
    const addFriend = (friendUsername) => {
      // Make the API request to add a friend
      fetch("http://localhost:5000/api/add_friend_by_username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          friend_username: friendUsername,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message) {
            // If the friend was added successfully, show an alert
            alert(data.message);
            // Now we update the list of friends
            fetch(`http://localhost:5000/api/friends/${username}`)
              .then(res => res.json())
              .then((friendsData) => {
                setFriends(friendsData); // Update the friends list state
              });
          } else {
            // Handle any errors here (e.g., already friends or friend not found)
            alert(data.error || "An error occurred");
          }
        })
        .catch((err) => {
          console.error("Error adding friend:", err);
          alert("There was an error adding the friend.");
        });
    };
    
    
    
    
  
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
            username,  // Replace with actual user ID if needed
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
  
// Fatimah
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
      setUserId(data.user_id);
      setShowInterestsPrompt(true);

      // Store authentication info as needed
      // localStorage.setItem('isAuthenticated', false);
      // localStorage.setItem('username', username);
      
      // Navigate to the interests page and pass the user ID
      // navigate('/interests', { state: { userId: data.user_id } });
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
            <div className="mugIcon1">
              <i className="fa-solid fa-mug-hot"></i>
              <h1>Tea Talks</h1>
            </div>
            <div className="navigationHeader">
              <ul>
                <li>Notifications</li>
                <li>
                <Link to={`/profile/${username}`} style={{ textDecoration: 'none', color: 'inherit' }}>User Profile</Link>
                </li>
                <li>
                  <div className="setting" onClick={toggleDropdown}>
                    Settings
                    {isDropdownVisible && (
                      <ul className="setting-menu">
                        <li><Link to="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>Edit Account</Link></li>
                        <button onClick={handleLogout}>Logout</button>
                      </ul>
                    )}
                  </div>
                </li>
              </ul>
            </div>
          </header>
    
          <section className="sidebar">
            {/* Upload Story Section */}
            <header className="storySection">
              <div className="uploadStory-link">
                <Link to="/upload-story" className="pretty-button">New Story</Link>
              </div>
            </header>
    
            {/* Show uploaded story circles */}
            <div className="storyContainer">
              {uploadedStories.length > 0 && (
                <div style={{ display: 'flex', overflowX: 'scroll', padding: '10px' }}>
                  {uploadedStories.map((story, index) => (
                    <div
                      key={index}
                      className="storyCircle"
                      onClick={() => handleStoryClick(story)}
                      style={{ cursor: "pointer" }}
                    >
                      {profilePic && (
                        <img
                          src={profilePic}
                          alt="User Profile"
                          className="miniProfilePic"
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            marginBottom: '5px',
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
    
            {/* Modal for showing story */}
            {isModalOpen && selectedStory && (
              <div className="modalOverlay" onClick={closeModal}>
                <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                  {selectedStory.filename.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video
                      controls
                      autoPlay
                      style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }}
                    >
                      <source src={`http://localhost:5000/uploads/${selectedStory.filename}`} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={`http://localhost:5000/uploads/${selectedStory.filename}`}
                      alt="Story Content"
                      style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }}
                    />
                  )}
                  <button onClick={closeModal} className="closeButton">Close</button>
                </div>
              </div>
            )}
    
            {/* Button-style links */}
            <div className="sidebar-buttons">
              <Link to="/daily-forum" className="pretty-button">Daily Forum</Link>
              <Link to="/chat-ai" className="pretty-button">Chat with Ai</Link>
            </div>
          </section>
          <section className="friendbar">
          <h4>Suggested Friends:</h4>
          {users
            .filter(user => 
              user.username !== username &&
              !friends.some(friend => friend.username === user.username)
            )

            .map((user, index) => (
              <div key={index} style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
              <span style={{ color: "rgb(157, 16, 73)" }}>{user.username}</span>
              <button className="add-btn" onClick={() => addFriend(user.username)} style={{ marginLeft: "auto" }}>+</button>
              </div>

            ))}

            <h4>Friends:</h4>
            {friends.length === 0 && <p>No friends yet 😢</p>}
            {friends.map((friend, index) => (
            <div key={index}>
            <span style={{ color: "rgb(157, 16, 73)" }}>{friend.username}</span>
            </div>
            ))}
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

  {/* MALEK: post box goes above the recent posts */}
  <div className="postContainer">
    <textarea
      className="postArea"
      value={content}
      onChange={(e) => setContent(e.target.value)}
      placeholder="What's on your mind?"
    />
    <button className="postButton" onClick={handlePost}>Post</button>
    <p>{postMessage}</p>
  </div>

  {/* View Posts (FR2) (Malek) */}
  <div className="viewPosts">
    <ViewPosts posts={posts} setPosts={setPosts} username={username} />
  </div>

  {/* This interest prompt only shows if someone signs up */}

                {/* View Posts (FR2) (Malek) */}


  
  
          {/* This interest prompt only shows if someone signs up */}

  
              </section>
            </div>
          )}
        {/* Interest modal */}
      {isAuthenticated && showInterestsPrompt && userId && (
        <Interest
          userId={userId}
          onClose={() => setShowInterestsPrompt(false)}
          onSave={() => {
            // parent handles “after save” behavior:
            setShowInterestsPrompt(false);
            navigate('/');
          }}
        />
      )}
      </div>
    );
  }
    export default HomePage;