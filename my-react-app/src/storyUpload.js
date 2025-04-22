/* Mona */
import React, { useState } from 'react';
import axios from 'axios'; // to make API requests
import { useNavigate } from 'react-router-dom';
import './story.css';

function StoryUpload() {
    const [file, setFile] = useState(null);  /* state to manage the selected file */
    const [preview, setPreview] = useState(null);   /* state to store the preview URL of the selected image */
    const [progress, setProgress] = useState(0);   /* state to keep track of upload progress percentage */
    const [uploadedStories, setUploadedStories] = useState([]);  /* state to store list of story images */
    const navigate = useNavigate();

    /* function to handle file selection from input field */
    const handleChange = (e) => {
        const selectedFile = e.target.files[0]; // get the first selected file
        setFile(selectedFile); // save selected file in state
        console.log('selected file:', selectedFile);
        // Check if the selected file is an image or a video and create a preview URL
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setPreview({
                type: 'image',
                url: URL.createObjectURL(selectedFile)
            });
        } else if (selectedFile && selectedFile.type.startsWith('video/')) {
            setPreview({
                type: 'video',
                url: URL.createObjectURL(selectedFile)
            });
        } else {
            setPreview(null);
        }
    };

    /* function to handle file upload to the server */
    const handleUpload = async () => {

        console.log('Upload button clicked!');
        if (!file) {
        console.error("No file selected.");
        return;
    }
        if(!file) {
            console.error("no file selected.");
            return;
        }

        const formData = new FormData(); // create a new FormData object to send the file
        formData.append('story', file); // append the selected file with the key 'story'

        try {
            //make a HTTP POST request to upload story
            const response = await axios.post('http://localhost:5000/api/uploadStory', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    // Calculate the real progress percentage
                    const realPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          
                    // If real progress is less than 100, simulate a smooth progression to 100
                    let current = progress;
                    if (realPercent < 100) {
                      // Gradually fill the progress bar even if real progress is not at 100
                      const interval = setInterval(() => {
                        if (current < 100) {
                          current += 1;
                          setProgress(current);
                        } else {
                          clearInterval(interval);
                          // Once we reach 100, wait for 1 second to allow for the visual effect
                          setTimeout(() => {
                            navigate('/'); // Navigate to homepage after the progress bar fills
                            console.log('Navigated to homepage');
                          }, 1000); // Delay before navigating
                        }
                      }, 30); // Update progress every 60ms
                    } else {
                      setProgress(100);
                    }
                  },
                });

            console.log('Upload Successful:', response.data); // log success response

            setUploadedStories((prevStories) => [
                ...prevStories,
                response.data.metadata,
            ]);
        } catch (error){
            console.error('Upload Failed:', error); //upload fails
        }
    };
    
    return (
        <div className="story-section">
          <h2 className="title">📸 Upload Story</h2>
      
          <label className="file-upload">
            <input type="file" accept="image/*,video/*" onChange={handleChange} />
          </label>
      
          {preview && (
            <div className="preview-container">
              <p>Preview:</p>
              {preview.type === 'image' ? (
                <img src={preview.url} alt="Preview" className="media-preview" />
              ) : (
                <video
                  className="media-preview"
                  controls
                  autoPlay
                  muted
                  playsInline
                  onError={(e) => console.error('Video playback error:', e)}
                >
                  <source src={preview.url} type={file?.type} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}
      
          {file && <p className="file-info">Selected File: {file.name}</p>}
      
          <button className="upload-button" onClick={handleUpload}>Upload</button>
      
          {progress > 0 && progress < 100 && (
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              <p>{progress}%</p>
            </div>
          )}
        </div>
      );
}

export default StoryUpload;