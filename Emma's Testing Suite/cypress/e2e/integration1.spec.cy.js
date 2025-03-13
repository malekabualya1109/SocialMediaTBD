/*Integration Test:
  In this test I am testing two methods, handleChange and handleUpload, and how they interact with each other.
  The code of the two js methods are shown below. They were created by Mona for her upload story 
  cool cam. I decided to test this code because I realized that I never actually saw the progress bar
  when uploading a file. And, I found that it actually fails that test. I did not look deeply into why
  the progress bar is not appearing, but my theory is that the file upload just happens so fast 
  it doesn't give the file upload to have enough time for the upload progress bar to actually appear.
  I ran out of time to test this further, but if I would have, I would have looked into ways
  to reduce the speed of the file upload to see if the progress bar actually appears or not. I am 
  also not really sure on how I could do that, but that seems a plausible solution 

    const handleChange = (e) => {
      const selectedFile = e.target.files[0]; // get the first selected file
      setFile(selectedFile); // save selected file in state
      console.log('selected file:', selectedFile);
      // check if the selected file is an image and create a preview URL 
      if(selectedFile && selectedFile.type.startsWith('image/')) {
          setPreview(URL.createObjectURL(selectedFile)); // Generate preview URL
      } else {
          setPreview(null);  //reset preview if file is not an image
      }
  };

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
     
      } catch (error){
          console.error('Upload Failed:', error); //upload fails
      }
  };*/


/*Testing Suite for Integration testing */
/*Additional note: I created test files for this test just to ensure that things were working properly,
I found it difficult to test the code while it was actually running, hence the mockups */
describe('StoryUpload Integration Test', ()=>{

  beforeEach(() =>{
    cy.visit('http://localhost:3000'); 
  });



  //Test #1: Should allow for preview of image selection
  it('display preview of the image', () => {
    //Select this file from the folder, I added a small file to use as a mock test
    cy.get('input[type="file"]').selectFile('cypress/fixtures/sample-image.jpg', { force: true });
    //If file works, it will assert true, otherwise it will fail 
    cy.get('p').should(($p) =>{
      assert.strictEqual($p.text().includes('Selected File: sample-image.jpg'),true, 'File selection works');
    });
    //assert that the image is visible on the front end of the app
    cy.get('.previewContainer img').should('be.visible');
  });



  //Test #2: If boo boo file is selected, should reject
  it('should not show a file that aint an image', () => {
    //Select this sample.txt to test if actually a non-image file
    cy.get('input[type="file"]').selectFile('cypress/fixtures/sample.txt', { force:true });
    //If bad, assert bad
    cy.get('.previewContainer img').should('not.exist');
  });



  //Test #3: Verify images actually shows up on screen
  it('upload image', ()=>{
    //Insert the photo onto the actual running app page
    cy.intercept('POST','http://localhost:5000/api/uploadStory',{
      statusCode: 200,
      body: {metadata:{filename:'uploaded-image.jpg'} },
    }).as('uploadStory');
    //Select this as my mock test file
    cy.get('input[type="file"]').selectFile('cypress/fixtures/sample-image.jpg', { force: true});
    cy.get('button').contains('Upload').click();
    //asert true if image appears.
    cy.get('.storyContainer img').should('have.attr', 'src').then((src) => {
      assert.strictEqual(src.includes('uploaded-image.jpg'), true, 'Uploaded image appears');
    });
  });



  //Test #4: Progess bar should appear while file loads
  //This test is currently failing...
  it('should show progress bar while uploading',() =>{
    //Post on the actual running app page
    cy.intercept('POST','http://localhost:5000/api/uploadStory',(req) =>{
      req.on('response', (res) => res.setDelay(2000));
    }).as('uploadStory');
    //Select this as my mock test file
    cy.get('input[type="file"]').selectFile('cypress/fixtures/sample-image.jpg', {force: true});
    cy.get('button').contains('Upload').click();
    //Assert that the progress bar should be visible
    cy.get('div').contains('%').should('be.visible');
    //Assert then after that the progress bar should disappear
    cy.get('div').contains('%').should('not.exist');
  });



  //Test #5: Reject if no file is uploaded
  it('should not upload if no file is selected',()=> {
    cy.get('button').contains('Upload').click();
    cy.on('window:console', (msg) => {
      expect(msg).to.contain('no file selected.');
    });
    //assert if the file is uploaded or not
    cy.get('.storyContainer img').should('not.exist');
  });
});

  
  