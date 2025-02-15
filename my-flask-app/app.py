from flask import Flask
from flask_cors import CORS
from postcreation import post_bp  # Import the Blueprint

app = Flask(__name__)
CORS(app)  #Enable CORS for the entire Flask app

#Register the post creation blueprint
app.register_blueprint(post_bp)

#Home route
@app.route('/')
def home():
    return "Welcome to Tea Talks!"

if __name__ == '__main__':
    app.run(debug=True)
