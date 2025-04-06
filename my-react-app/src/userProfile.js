import './user-profile.css';
import './App.css';
import React, { useState, useEffect } from "react";

function UserProfile() {
  const [profilePic, setProfilePic] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(false);

  useEffect(()=>{
    const savedProfilePic = localStorage.getItem("profilePic");
    const savedBackgroundImage = localStorage.getItem("backgroundImage");

    if(savedProfilePic) {
      setProfilePic(savedProfilePic);
    }

    if (savedBackgroundImage) {
      setBackgroundImage(savedBackgroundImage);
    }
  }, []);

  const handleBackgroundImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
  
        // Check size before storing in localStorage
        const sizeInBytes = imageUrl.length * (3/4); // Approximate base64 size
        const maxStorageSize = 5 * 1024 * 1024; // 5MB
  
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
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePic(imageUrl);
      localStorage.setItem("profilePic", imageUrl); 
    }
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

  <h1 className="userProf">Your Profile</h1>
</section>


      <section className="bottom">
        <div className="area1">

        </div>
        <div className="area2">

        </div>
        <div className="area3">

        </div>
        <div className="area4">

        </div>
        <div className="area5">

        </div>
        <div className="area6">

        </div>
      </section>
    </div>
  );
}
export default UserProfile;