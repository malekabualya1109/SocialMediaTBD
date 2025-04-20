import React, { useEffect, useState } from 'react'
import './index.css'; 
import './userAccount.css';
import './smallerPage.css';
import HomePage from "./HomePage.js";
import UserProfile from "./userProfile.js"; 
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import StoryUpload from './storyUpload.js';
import DailyForum from './dailyForum.js';
import ChatAi from './chatAi.js';
import SettingsPage from './SettingsPage.js'; 
import DirectMessage from "./directMessage";




/* for Bot */
import BotForum from './botFront.js'; // Import the bot forum component
import Interest from './Interest.js';

/*File Archive: 
  - App.js = Routes to different pages. Contributors: Fatimah, Emma, Maria, Mona, Steven
  - HomePage.js = Login code and pretty much everything that was originally in app.js. Contributors: Fatimah, Emma, Maria, Mona, Malek
  - dailyForum.js = DailyForum code that is displayed on Homepage. Contributor: Maria
  - dailyForum.css = Contributor: Maria
  - storyUpload.js = Upload story on Homepage. Contributor: Mona
  - index.js = Renders this file (App.js), part of framework
  - reportWebVitals = does not atm, part of framework. 
  - userProfile.js = javascript for the user profile page. Contributor: Emma
  - user-profile.css = css styling for the user profile page. Contributor: Emma
  - smallerPage.css = Not currently implemented. Used for when screen size shrinks. 
  - index.js = Framework
  - Interest.js = Contributor: Fatimah
  - viewPosts.js = Post area on main page. Contributor: Malek
  - userAccount.css = Contributors: Mona, Emma
  - botFront.js = Ai chatbox. Contributor: Steven
*/

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); 

  //useEffect to get the username and isAuthenticated -Emma
  //Isn't currently working bwamp bwamp
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");
    const authStatus = localStorage.getItem("isAuthenticated");
  
    if (storedUsername && authStatus === "true") {
      setUsername(storedUsername);
      setIsAuthenticated(true);
      setPassword(storedPassword); 
    }
  }, []);
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage /> } />
        <Route path="/profile/:username" element={<UserProfile />} /> 
        <Route path="/upload-story" element={<StoryUpload />} />
        <Route path="/interests" element={<Interest />} />
        <Route path="/settings" element={<SettingsPage username={username} isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} setUsername={setUsername} password = {password} />} />
        <Route path="/daily-forum" element={<DailyForum username={"User"} />} />
        <Route path="/bot-forum" element={<BotForum username={"User"} />} /> 
        <Route path="/chat-ai" element={<ChatAi username={"User"} />} />
        <Route path="/direct/:username" element={<DirectMessage />} />


      </Routes>
    </Router>
  ); 
 
}; 






export default App;