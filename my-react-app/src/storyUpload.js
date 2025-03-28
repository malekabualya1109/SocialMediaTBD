/* Mona */
import React, { useState } from 'react';
import axios from 'axios'; // to make API requests
import { useNavigate } from 'react-router-dom';

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
                    // calculate and update the upload progress percentage
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percent); // update the progress state
                }
            });
            
            setUploadedStories((prevStories) => [
                ...prevStories,
                response.data.metadata,
            ]);
            console.log('Upload Successful:', response.data); // log success response
            navigate('/')
        } catch (error){
            console.error('Upload Failed:', error); //upload fails
        }
    };
    
    return (
        <div className="storySection">
            <h2>Upload Story</h2>

            <input type="file" accept="image/*,video/*" onChange={handleChange} />

            {preview && preview.type === 'video' && (
                <div className="previewContainer" style={{ width: '100%', maxHeight: '500px', maxWidth: '500px' }}>
                    <p>Preview:</p>
                    <video width="100%" controls autoPlay>
                        <source src={preview.url} type={file && file.type} />
                        {/* Log the URL and file type for debugging */}
                        {console.log('Video Preview URL:', preview.url)}
                        {console.log('Video Type:', file && file.type)}
                        Your browser does not support the video tag.
                    </video>
                </div>
            )}

            {preview && preview.type === 'image' && (
                    <div className="previewContainer">
                        <p>Preview:</p>
                            <img src={preview.url} alt="Preview" style={{ maxWidth: '50px', maxHeight: '50px', marginBottom: '1px' }} />
                    </div>
            )}

            {file && <p>Selected File: {file.name}</p>}

            <button onClick={handleUpload}>Upload</button>

            {progress > 0 && progress < 100 && (
                <div style={{ width: '100%', backgroundColor: '#f3f3f3', borderRadius: '8px', marginTop: '10px' }}>
                    <div style={{ width: `${progress}%`, height: '10px', backgroundColor: '#4f0000', borderRadius: '8px' }}></div>
                    <p style={{ textAlign: 'center', fontWeight: 'bold' }}>{progress}%</p>
                </div>
            )}
            

            <div className="storyContainer">
                {uploadedStories.length > 0 && (
                    <div style={{ display: 'flex', overflowX: 'scroll', padding: '10px' }}>
                        {uploadedStories.map((story, index) => (
                            <div
                                key={index}
                                className="storyCircle"
                            >
                                <img
                                    src={`http://localhost:5000/uploads/${story.filename}`} // Correct image URL
                                    alt={`Story ${index}`}
                                    onError={(e) => console.log("Image load error:", e.target.src)}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default StoryUpload;
