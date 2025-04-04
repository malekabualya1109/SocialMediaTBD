import React, { useEffect, useState } from 'react'
import './index.css'; 
import './userAccount.css';
import './smallerPage.css';
import HomePage from "./HomePage.js";
import UserProfile from "./userProfile.js"; 
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import StoryUpload from './storyUpload.js';
import DailyForum from './dailyForum.js';

/* for Bot */
import BotForum from './botFront.js'; // Import the bot forum component
import Interest from './Interest.js';

/*File Archive: 
  - HomePage.js = Login code and pretty much everything that was originally in app.js 
  - dailyForum.js = DailyForum code that is displayed on Homepage
  - userProfile.js = Personal account display
  - storyUpload.js = Upload story on Homepage
  - index.js = Renders this file (App.js), part of framework
  - reportWebVitals = does not atm, part of framework
*/

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);


  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage /> } />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/upload-story" element={<StoryUpload />} />
        <Route path="/interests" element={<Interest />} />
      </Routes>
      <Routes>
        <Route path="/daily-forum" element={<DailyForum username={"User"} />} />
        <Route path="/bot-forum" element={<BotForum username={"User"} />} /> 
      </Routes>
    </Router>
  ); 
 
}; 






export default App;