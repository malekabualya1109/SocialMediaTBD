import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {//Fetch data from flaskbackend
    fetch('http://127.0.0.1:5000/') //Port flask is on
      .then((response) => response.text()) //message from Flask
      .then((data) => setMessage(data))//capture message from flask
      .catch((error) => console.log('Error fetching data:', error));
  }, []);

  return (
    <div className="App">
        <header class ="navigation">
          <h1>Tea Talks</h1>
          <ul>
            <li>Notifications</li>
            <li>User Profile</li>
            <li>Settings</li>
          </ul>
        </header>
        <p>{message || 'Backend data stuff'}</p> {/*flask message*/}
    </div>
  );
}

export default App;


