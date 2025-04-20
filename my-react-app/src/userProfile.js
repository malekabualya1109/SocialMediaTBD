import './user-profile.css';
import './App.css';
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Maria

function UserProfile() {
  const [profilePic, setProfilePic] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(false);
  const [isFriend, setIsFriend] = useState(false); // Track friend state - Maria
  const { username } = useParams();
  const currentUser = localStorage.getItem("username"); //Current user used for comparison - Maria

  useEffect(() => {
    const savedProfilePic = localStorage.getItem("profilePic");
    const savedBackgroundImage = localStorage.getItem("backgroundImage");

    if (savedProfilePic) {
      setProfilePic(savedProfilePic);
    }

    if (savedBackgroundImage) {
      setBackgroundImage(savedBackgroundImage);
    }
  }, []);

  useEffect(() => {
    // Load friend status from localStorage - Maria
    const allFriends = JSON.parse(localStorage.getItem("friends") || "{}");
    const myFriends = allFriends[currentUser] || [];
    setIsFriend(myFriends.includes(username));
    // synch avatar pics properly 
    if (username && profilePic) {
    localStorage.setItem(`profilePic:${username}`, profilePic);
    }

  }, [username, currentUser]);

  const handleBackgroundImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        const sizeInBytes = imageUrl.length * (3 / 4);
        const maxStorageSize = 5 * 1024 * 1024;
        
        //Check size before storing in localStorage
        if (sizeInBytes > maxStorageSize) {
          alert("Image is too large! Please choose a smaller one.");
          return;
        }

        setBackgroundImage(imageUrl);
        localStorage.setItem("backgroundImage", imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  //Small changes to Emma's code to make the profile picture behave the same as the background picture
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePic(base64String);
        localStorage.setItem("profilePic", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFriend = () => {
    // Toggle friend logic stored locally - Maria
    const allFriends = JSON.parse(localStorage.getItem("friends") || "{}");
    const myFriends = new Set(allFriends[currentUser] || []);

    if (isFriend) {
      myFriends.delete(username);
    } else {
      myFriends.add(username);
    }

    allFriends[currentUser] = Array.from(myFriends);
    localStorage.setItem("friends", JSON.stringify(allFriends));
    setIsFriend(!isFriend);
  };

  return (
    <div className="UserProfile">
      <section className="top" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="profile-pic-upload">
          <input
            type="file"
            id="uploadProfile"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <label htmlFor="uploadProfile" className="profile-pic-circle">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="circle-img" />
            ) : (
              "Upload Profile"
            )}
          </label>
        </div>
        
        {/* Edit button for background */}
        <div className="background-edit-button">
          <input
            type="file"
            id="uploadBackground"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleBackgroundImageChange}
          />
          <label htmlFor="uploadBackground" className="edit-background-button">Edit</label>
          <div className="mugIcon2">
            <i className="fa-solid fa-mug-hot"></i>
          </div>
        </div>

        {/* If there's no background image, show the upload button */}   
        {!backgroundImage && (
          <div className="background-upload">
            <input
              type="file"
              id="uploadBackground"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleBackgroundImageChange}
            />
            <label htmlFor="uploadBackground" className="background-pic-button">Upload Background</label>
          </div>
        )}

        <h1 className="userProf">{username ? `${username}'s Profile` : "Your Profile"}</h1>

        {username &&
          currentUser &&
          username.trim().toLowerCase() !== currentUser.trim().toLowerCase() && (
            <div style={{ marginTop: "10px" }}>
              {/*Send Direct Message Button - Maria */}
              <button
                onClick={() => {
                  window.open(
                    `/direct/${username}`,
                    "_blank",
                    "width=600,height=600,left=200,top=200"
                  );
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#4B001f",
                  color: "white",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Send Direct Message
              </button>

              {/*Add/Unfriend Button - Maria*/}
              <button
                onClick={toggleFriend}
                style={{
                  padding: "8px 16px",
                  backgroundColor: isFriend ? "#aaa" : "#333",
                  color: "white",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer",
                  marginLeft: "10px"
                }}
              >
                {isFriend ? "Unfriend" : "Add Friend"}
              </button>
            </div>
          )}
      {/*Show on own profile - Maria */}
      {(!username || username === currentUser) && (
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={() => {
              window.open(
                `/direct/${currentUser}`,
                "_blank",
                "width=600,height=600,left=200,top=200"
              );
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4B001f",
              color: "white",
              borderRadius: "5px",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer"
            }}
          >
            Messages
        </button>
      </div>
    )} 
      </section>
      <section className="bottom">
        <div className="area1" />
        <div className="area2" />
        <div className="area3" />
        <div className="area4" />
        <div className="area5" />
        <div className="area6" />
      </section>
    </div>
  );
}

export default UserProfile;
