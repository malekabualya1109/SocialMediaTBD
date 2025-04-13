import './SettingsPage.css';
import './App.css';
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

/*Emma's Setting Page*/

function SettingsPage({username, setIsAuthenticated, password}) {
  const [usernameBool, setusernameBool] = useState(false); 
  const [setpassword, setPasswordBool] = useState(false)
  const [newUserName, setusername] = useState(username); 
  const [newPassword, setNewPassword] = useState(password); 
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(null); 
  const [count, setCount] = useState(0); 
  const [userNameCount, setUserCount] = useState(0); 
  const [passwordNameCount, setPasswordCount] = useState(0); 
  let newCount = 0; 

  //Mona's method, I am borrowing it -Emma
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    navigate('/');
  }

  //Method to toggle accountDetail button
  const accountDetails = () => {
    newCount = count + 1; 
    setCount(newCount);
    if (newCount % 2 === 0){
        setShowInfo(false);
    }else{
        setShowInfo(true); 
    }
  }

  //Method to change boolean to true (obviously) for username button
  const userNameBoolean = () => {
    newCount = userNameCount + 1;
    setUserCount(newCount); 
    if (newCount % 2 === 0){
        setusernameBool(false); 
    }else{
        setusernameBool(true);
    }
  }

  //Same thing as above method but for password button
  const passwordBoolean = () => {
    newCount = passwordNameCount + 1; 
    setPasswordCount(newCount); 
    if (newCount % 2 === 0 ){
        setPasswordBool(false); 
    }else{
        setPasswordBool(true); 
    }
  }

  //Method to change the user's username name, not working
  const changeuserName = (newUserName) => {
    console.log("New user name is : ", newUserName); 
    setusername(newUserName); 
    localStorage.setItem("username", newUserName);
    setusernameBool(false); 
  }

  //Method to change the user's password
  const changepassword = (newPassword) => {
    console.log("New password is: ", newPassword); 
    setpassword(newPassword);
    setPasswordBool(false); 
  }

  return (
    <div className="Setting-Page">
        <button className= "buttons" onClick={accountDetails}>Account Details</button>
        <button className= "buttons"onClick={() => userNameBoolean()}>Change Username</button>
        <button className= "buttons"onClick={() => passwordBoolean()}>Change Password</button>
        <button className= "buttons"onClick={handleLogout}>Logout</button>

        {showInfo && (
            <div>
                <p>Username: {username}</p> 
                <p>Account Details</p>
            </div>
        )}

        {usernameBool && (
            <div>
                <input type = "username" placeholder = "new username" 
                    value = {newUserName} onChange={(e) => setusername(e.target.value)} />                 
                <button id="updatebutton" onClick={() => changeuserName(newUserName)}>Update</button>
            </div>
        )}

        {setpassword && (
            <div>
                <input type = "username" placeholder = "new password" 
                    value = {newPassword} onChange={(e) => setNewPassword(e.target.value)} />                 
                <button id="updatebutton" onClick={() => changepassword(newPassword)}>Update</button>    
            </div>

        )}

    </div>

  );
}
export default SettingsPage;