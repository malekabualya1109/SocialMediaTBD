from flask import Flask, request, jsonify
from flask_cors import CORS
from postcreation import post_bp 

#the python sql libra
import pymysql

app = Flask(__name__)
CORS(app)  # This will allow requests from any origin

# Register the post creation blueprint
app.register_blueprint(post_bp)

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

