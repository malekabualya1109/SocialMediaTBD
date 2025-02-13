from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from postcreation import post_bp 
from uploadstory import uploadstory_bp

#the python sql libra
import pymysql

app = Flask(__name__)
CORS(app)  # This will allow requests from any origin

# this is to set up uploaded folder
UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

#  create the uploads folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


# Register the blueprint
app.register_blueprint(post_bp)
app.register_blueprint(uploadstory_bp)

# Home route
#had to add this again so that it wouldnt create a failed message on top
@app.route('/')
def home():
    return "Backend message sending to front end"


@app.route('/api/signup', methods=['POST'])


#note for my self: the numbers are htttp status codes that returns with json if a request is successful or not

def signup():
    data = request.get_json()

    # sign up logic here later
    return jsonify({"message": "User created successfully!"}), 201



@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    # login logic later, as of now demo is the logic
    if data['username'] == "demo" and data['password'] == "demo":
        return jsonify({"message": "Login successful!"}), 200


    else:
        return jsonify({"error": "Invalid credentials"}), 401




if __name__ == '__main__':
    app.run(debug=True)

