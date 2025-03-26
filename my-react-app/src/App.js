import React, { useEffect, useState } from 'react'
import './index.css'; 
import './userAccount.css';
import './smallerPage.css';
import HomePage from "./HomePage.js";
import UserProfile from "./userProfile.js"; 
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

/*File Archive: 
  - HomePage.js = Login code and pretty much everything that was originally in app.js 
  - dailyForum.js = DailyForum code that is displayed on Homepage
  - userProfile.js = Personal account display
  - storyUpload.js = Upload story on Homepage
  - index.js = Renders this file (App.js), part of framework
  - reportWebVitals = does not atm, part of framework
*/

function App() {

  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );    
}; 
export default App;