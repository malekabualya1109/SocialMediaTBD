import { useNavigate } from 'react-router-dom';

import React, { useState } from 'react';

export default function Interest({ userId, onClose }) {
  const navigate = useNavigate();

  // internal flag
  const [showInterestsPrompt, setShowInterestsPrompt] = useState(true);



  //  ABOUT 80 interests
  const interestNames = [
    "Art","Music","Travel","Cooking","Fitness","Photography",
    "Technology","Gaming","Reading","Writing","Movies","Nature",
    "Fashion","Sports","Science","History","Politics","Finance",
    "DIY","Gardening","Pets","Yoga","Meditation","Cars",
    "Cycling","Hiking","Swimming","Fishing","Painting","Crafts",
    "Dancing","Singing","Coding","Robotics","Astronomy","Philosophy",
    "Education","Entrepreneurship","Philanthropy","Environment",
    "Architecture","Birdwatching","Blogging","Calligraphy","Chess","Knitting",
    "Magic","Model Building","Mythology","Origami","Podcasting","Pottery",
    "Quilting","Skateboarding","Snowboarding","Surfing","Theater","Woodworking",
    "Wine Tasting","Beer Brewing","Coffee Roasting","Board Games","Caving","Climbing",
    "Cosplaying","Drone Flying","eSports","Genealogy","Graphic Design","Herbalism",
    "Investing","Journaling","Karaoke","Language Learning","Marathon","Parkour",
    "Surrealism","Tattoo Art","Stand-up Comedy","Urban Exploration"
  ];

    const [availableInterests] = useState(() => {
    // mapping into {id,label}
    const full = interestNames.map((name, idx) => ({
      id: idx + 1,
      label: name
    }));
    // SHUFFLING
    for (let i = full.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [full[i], full[j]] = [full[j], full[i]];
    }
    // taking  20
    return full.slice(0, 20);
  });


  const [selectedInterests, setSelectedInterests] = useState([]);

  const handleInterestChange = (interestId) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };


  //saving the interests

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
        // exactly like your original
        setShowInterestsPrompt(false);
        onClose();         // tell parent to unmount the modal
        navigate('/');     // and go home
      } else {
        console.error('Error saving interests:', data);
      }
    } catch (error) {
      console.error('Error connecting to server:', error);
    }
  };

  const handleSkip = () => {
    // same skip as before
    setShowInterestsPrompt(false);
    onClose();
    navigate('/');
  };

  // if they've clicked save/skip, render nothing
  if (!showInterestsPrompt) return null;

  return (
    <div className="interest-modal-overlay">
      <div className="interest-modal">
        <h3>Pick your interests</h3>


        <div className="interest-grid">
          {availableInterests.map(({ id, label }) => (
            <div
              key={id}
              className={`interest-card ${selectedInterests.includes(id) ? 'selected' : ''}`}
              onClick={() => handleInterestChange(id)}
            >
              <div className="checkbox-custom">
                {selectedInterests.includes(id) && <span>✓</span>}
              </div>
              <span className="interest-label">{label}</span>
            </div>
          ))}
        </div>

        <div className="interest-buttons">
          <button onClick={handleSaveInterests} style={{ marginTop: '10px' }}>
            Save Interests
          </button>
          <button
            onClick={handleSkip}
            style={{ marginTop: '10px', marginLeft: '10px' }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
