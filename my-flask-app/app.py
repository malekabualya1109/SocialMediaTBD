from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)#This will allow access the Flask api :) 

@app.route('/')
def home():
    return "Backend message sending to front end"

if __name__ == '__main__':
    app.run(debug=True)
