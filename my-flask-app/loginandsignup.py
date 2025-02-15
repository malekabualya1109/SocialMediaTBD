from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from postcreation import post_bp
from uploadstory import uploadstory_bp
from tkinter import * #this is for the message box

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

# def connect_datase():
#     if passwordEntry.get()==''  or passwordEntry.get()==' '  :
#         messagebox.showerror('empty fields')



@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()

    # Example: simple validation
    password = data.get('password', '').strip()
    username = data.get('username', '').strip()

    if not username or not password:
        return jsonify({"error": "Username or password cannot be empty"}), 400

    else:
        try:
            theSQL= pymysql.connect(host='localhost', user='root', password='Rongon@@12Fat')
            mycursor=theSQL.cursor()
        except:
            messagebox.showerror('error')
            return

    try:

        #if the username exist not working for now, will perfect it later

        query ='select * from data where username= %s'
        mycursor.execute(query, (username,))


        existing= mycursor.fetchone()

        if existing !=None:
            messagebox.showerror('Error', 'Username already exists!')
            return jsonify({"error": "Username already exist"}), 400

        else:

            query='create database userdata'
            mycursor.execute(query)
            query='use userdata'
            mycursor.execute(query)
            query='create table data(id int auto_increment primary key not null, username varchar(100), password varchar(20))'
            mycursor.execute(query)

    except:
        mycursor.execute('use userdata')

    
    #insert into the ldata

    query=('insert into data(username, password) values(%s,%s)')
    mycursor.execute(query, (username, password))
    theSQL.commit()
    theSQL.close()
    




    return jsonify({"message": "User created successfully!"}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    # Extract the username and password from the request
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    # Simple validation
    if not username or not password:
        return jsonify({"error": "Username or password cannot be empty"}), 400

    try:
        # Connect to the existing 'userdata' database
        theSQL= pymysql.connect(host='localhost', user='root', password='Rongon@@12Fat', database='userdata'  )
        mycursor = theSQL.cursor()

    except:
        return jsonify({"error": "Could not connect to the database"}), 500

    try:
        # Prepare a SELECT statement to check if the user exists with matching credentials
        query = 'select *from data where username = %s and password = %s'
        mycursor.execute(query, (username, password))

        row = mycursor.fetchone()

        if row:
            # If user is found
            return jsonify({"message": "Login successful!"}), 200
        else:
            # If user not found
            return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        print("Error during login query:", e)
        return jsonify({"error": "Database query failed"}), 500

    theSQL.close()



if __name__ == '__main__':
    app.run(debug=True)

