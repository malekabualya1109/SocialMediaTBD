from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import os

# create flask blueprint to handle story uploads
uploadstory_bp = Blueprint('uploadstory', __name__)

@uploadstory_bp.route('/api/uploadStory', methods=['POST'])
def upload_story():
    # check if the request has a file part with the key 'story'
    if 'story' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['story'] # retrieve the uploaded file

    # check if a file was actually selected
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # generate a unique filename using current timestamp
    filename = datetime.now().strftime("%Y%m%d%H%M%S") + "_" + file.filename
    file_path = os.path.join('uploads', filename) # defining the file save path

    #save the uploaded file to the specified folder
    file.save(file_path)

    # create metadata for uploaded file
    # includes: upload timestamp and expiration time
    metadata = {
        "filename": filename,
        "uploadTimestamp": datetime.now().isoformat(),
        "expirationTime": (datetime.now() + timedelta(hours=24)).isoformat()
    }

    # debug statements to ensure file and metadata is recognized
    print("recieved file:", file.filename)
    print("saving file to:", file_path)
    print("metadata:",metadata)

    # return success response with file metadata
    return jsonify({
        "message": "File uploaded successfully",
        "metadata": metadata
    }), 200
