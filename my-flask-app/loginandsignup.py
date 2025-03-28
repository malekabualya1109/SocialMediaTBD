from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from postcreation import post_bp
from uploadstory import uploadstory_bp
from tkinter import * #this is for the message box
import getpass  # Maria's changes: used for password prompt

#the python sql libra
import pymysql

app = Flask(__name__)

#not permanent, i am trying something
app.secret_key = 'mykey'
CORS(app, supports_credentials=True)  # This will allow requests from any origin

# Maria's changes: Prompt for MySQL password
mysql_password = getpass.getpass("Enter your MySQL root password: ")

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



def admin():

    try:
        # connecting  to MySQL without specifying a database

        # Maria's changes: using prompted MySQL password
        connection = pymysql.connect(host='localhost', user='root', password=mysql_password)
        cursor = connection.cursor()

        # checking  if the admin user exists in the MySQL system database
        check_query = "SELECT COUNT(*) FROM mysql.user WHERE user = %s"

        cursor.execute(check_query, ("admin",))
        result = cursor.fetchone()

        if result and result[0] > 0:
            print("Admin user already exists. Skipping creation.")
        
        else:
            # creating the admin user and grant all privileges
            cursor.execute("CREATE USER 'admin'@'%' IDENTIFIED BY 'admin_password';")
            cursor.execute("GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;")
            connection.commit()

            print("Admin user created successfully with all privileges.")

        connection.close()
        
    except:

        return jsonify({"error": "Error creating admin user"}), 400




@app.route('/api/signup', methods=['POST'])
def signup():

    data = request.get_json()
    password = data.get('password', '').strip()
    username = data.get('username', '').strip()

    #list of interests:
    selected_interests = data.get('interests', [])

    #we don't want that to be empty 

    if not username or not password:
        return jsonify({"error": "Username or password cannot be empty"}), 400

    try:

        # Maria's changes: using prompted MySQL password
        theSQL = pymysql.connect(host='localhost', user='root', password=mysql_password)

            #store password in the a
            # third party autentificati

        #new user in  the database that has no password
        mycursor=theSQL.cursor()

        query='create database if not exists userdata'
        mycursor.execute(query)
        query='use userdata'
        mycursor.execute(query)

        #data table cause why not
        query='create table if not exists data(id int auto_increment primary key not null, username varchar(100), password varchar(20))'
        mycursor.execute(query)


        # i wanna check if the username doesnt already exist
        query ='select * from data where username= %s'
        mycursor.execute(query, (username,))
        existing= mycursor.fetchone()

        if existing:
            return jsonify({"error": "Username already exist"}), 400

        
        # inserting the new user in the dbms
        query=('insert into data(username, password) values(%s, %s)')
        mycursor.execute(query, (username, password))
        user_id = mycursor.lastrowid  # get the newly created user's ID



        theSQL.commit()
        theSQL.close()

        return jsonify({"message": "User created successfully!", "user_id": user_id}), 201


    except :
        return jsonify({"error": "Error in signup route"}), 400
        
        

    
    #insert into the ldata


    return jsonify({"message": "User created successfully!"}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    # extract the username and password from the request
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()


    if not username or not password:
        return jsonify({"error": "Username or password cannot be empty"}), 400

    try:
        # Maria's changes: using prompted MySQL password
        theSQL = pymysql.connect(host='localhost', user='root', password=mysql_password, database='userdata')
        mycursor = theSQL.cursor()

        #store password in a json file

    except:
        return jsonify({"error": "Could not connect to the database"}), 500

    try:
        # matching cause why not
        query = 'select *from data where username = %s and password = %s'
        mycursor.execute(query, (username, password))

        row = mycursor.fetchone()

        if row:
            # If user is found
            return jsonify({"message": "Login successful!"}), 200
        else:
            # If user not found
            return jsonify({"error": "Invalid credentials"}), 401

    except:
        return jsonify({"error": "Error during login query"}), 400

    theSQL.close()


# the interst part and i'm not done with it yet because i didn't completely store this in the databse

@app.route('/api/set_interests', methods=['POST'])

#test the route , with postmen
def set_interests():

    #first error, i was not creating the databse earlier, solved it yayyyys
    data = request.get_json()
    user_id = data.get('user_id')
    selected_interests = data.get('interests', [])


    #table creation and stuff
    try:
        # Maria's changes: using prompted MySQL password
        theSQL = pymysql.connect(host='localhost', user='root', password=mysql_password, database='userdata')
        mycursor = theSQL.cursor()
        query='create table if not exists user_interests(id int auto_increment primary key, user_id int not null, interest_id int not null)'

        mycursor.execute(query)

        for interest_id in selected_interests:
            query = 'insert into user_interests (user_id, interest_id) values (%s, %s)'
            mycursor.execute(query, (user_id, interest_id))


        theSQL.commit()
        theSQL.close()

        return jsonify({"message": "Interests saved successfully"}), 200

        #check messages


    except:
        return jsonify({"error": "Could not connect to database"}), 500
    



if __name__ == '__main__':
    admin()
    app.run(debug=True)