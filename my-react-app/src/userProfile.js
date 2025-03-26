import './user-profile.css';
import './App.css';

//User Profile Page
const UserProfile = () => {
    return (
      <div className = "UserProfile">
        <h1 class="userProf">Your Profile</h1>
        <iframe className = "vid"
        width="700"
        height="500"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&"
        title="YouTube video player"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        ></iframe>
      </div>
    );
  };
  export default UserProfile; 
  