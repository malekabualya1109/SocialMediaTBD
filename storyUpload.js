/* Mona */
import react, { useState } from 'react';
import axios from 'axios'; // to make API requests

function StoryUpload() {
    const [file, setFile] = useState(null);  /* state to manage the selected file */
    const [preview, setPreview] = useState(null);   /* state for image preview */
    const [progress, setProgress] = useState(0);   /* state to keep track of upload progress percentage */

    /* function to handle file selection from input */
    const handleChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile); // save selected file in state
        
        /* Create a preview URL for the selected image */
        if(selectedFile && selectedFile.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            setPreview(null);  //reset preview if not image
        }
    };

    /* function to handle file uploading process */
    const handleUpload = async () => {
        if(!file) {
            console.error("no file selected.");
            return;
        }

        const formData = new FormData(); // create a new FormData object for file upload
        formData.append('story', file); // append the selected file under 'story'

        try {
            //make a HTTP POST request to upload story
            const response = await axios.post('/api/uploadStory', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    // calculate and update the upload progress percentage
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percent);
                }
            });

            console.log('Upload Successful:', response.data);
        } catch (error){
            console.error('Upload Failed:', error);
        }
    };

    return (
        <div className='uploadContainer'>
            <h2>Upload Story</h2>
            <input type="file" accept="image/*,video/*" onChange={handleChange}/>          
            {preview && (
                <div className="previewContainer">
                    <p>Preview:</p>
                    <img src={preview} alt="Preview" style={{maxWidth: '300px', maxHeight: '300px', marginBottom: '10px'}} />
                </div>
            )}
            
            {file && <p>Select File: {file.name}</p>}
            <button onClick={handleUpload}>Upload</button>
            {progress > 0 && <p>Upload Progress: {progress}%</p>}
        </div>
    );
}

export default StoryUpload;