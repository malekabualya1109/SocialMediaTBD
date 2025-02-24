/* Mona */
import react, { useState } from 'react';
import axios from 'axios'; // to make API requests

function StoryUpload() {
    const [file, setFile] = useState(null);  /* state to manage the selected file */
    const [preview, setPreview] = useState(null);   /* state to store the preview URL of the selected image */
    const [progress, setProgress] = useState(0);   /* state to keep track of upload progress percentage */

    /* function to handle file selection from input field
        parameter e - the event is triggered when a file is selected
    */
    const handleChange = (e) => {
        const selectedFile = e.target.files[0]; // get the first selected file
        setFile(selectedFile); // save selected file in state
        
        /* check if the selected file is an image and create a preview URL */
        if(selectedFile && selectedFile.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(selectedFile)); // Generate preview URL
        } else {
            setPreview(null);  //reset preview if file is not an image
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

            console.log('Upload Successful:', response.data); // log success response
        } catch (error){
            console.error('Upload Failed:', error); //upload fails
        }
    };

    return (
        <div className='uploadContainer'>
            <h2>Upload Story</h2>
            {/* file input field allowing selection of images and videos - still have not tested for videos */}
            <input type="file" accept="image/*,video/*" onChange={handleChange}/>
            
            {/* display preview only if an image is selected */}
            {preview && (
                <div className="previewContainer">
                    <p>Preview:</p>
                    <img src={preview} alt="Preview" style={{maxWidth: '300px', maxHeight: '300px', marginBottom: '10px'}} />
                </div>
            )}
            
            {/* display the selected filename if a file is chosen */}
            {file && <p>Select File: {file.name}</p>}
            {/* upload button to trigger the file upload process */}
            <button onClick={handleUpload}>Upload</button>
            {/* display upload progress percentage if greater than 0 */}
            {progress > 0 && <p>Upload Progress: {progress}%</p>}
        </div>
    );
}

export default StoryUpload;