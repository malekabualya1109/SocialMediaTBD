import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Interest() {
  const location = useLocation();
  const navigate = useNavigate();
  // Retrieve the userId passed in the state during sign-up (if any)
  const { userId } = location.state || {};

  // We always want to show the interest options on this page.
  const [showInterestsPrompt, setShowInterestsPrompt] = useState(true);

  // Define available interests options
  const availableInterests = [
    { id: 1, label: 'Music' },
    { id: 2, label: 'Sports' },
    { id: 3, label: 'Movies' },
    { id: 4, label: 'Photography' },
  ];

  const [selectedInterests, setSelectedInterests] = useState([]);

  // Toggle the selection of an interest
  const handleInterestChange = (interestId) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  // Save the selected interests to the backend
  const handleSaveInterests = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/set_interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          interests: selectedInterests,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        // Hide the prompt and navigate to the homepage after saving
        setShowInterestsPrompt(false);
        navigate('/');
      } else {
        console.error('Error saving interests:', data);
      }
    } catch (error) {
      console.error('Error connecting to server:', error);
    }
  };

  // Skip button: navigates directly to the homepage without saving interests
  const handleSkip = () => {
    navigate('/');
  };

  return (
    <div className="interest-page">
      <section className="interests-section">
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
              <button onClick={handleSkip} style={{ marginTop: '10px', marginLeft: '10px' }}>
                Skip
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Interest;
