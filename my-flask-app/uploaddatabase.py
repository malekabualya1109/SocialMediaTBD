import pymysql
import getpass
from config import mysql_password

# database config dict with connection details
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": mysql_password,
    #"database": "uploads_db"
}

# function to establish a connection to the database
def connect_db(use_database=True):
    """Connect to MySQL. If `use_database` is False, don't include the database in the connection."""
    config = DB_CONFIG.copy()
    if use_database:
        config["database"] = "uploads_db"
    print(f"Connecting to DB with config: {config}")

    return pymysql.connect(**config, cursorclass=pymysql.cursors.DictCursor)

# function to create or verify the admin user
def admin():
    try:
        # connect to mySql without specifying a database
        connection = pymysql.connect(host='localhost', user='root', password=mysql_password)
        cursor = connection.cursor()

        # check if the admin user exists in the mysql system database
        check_query = "SELECT COUNT(*) FROM mysql.user WHERE user = %s"
        cursor.execute(check_query, ("admin",))
        result = cursor.fetchone()

        if result and result[0] > 0:
            print("Admin user already exists. skipping creation")
        else:
            # create the admin user and grant all privileges
            cursor.execute("CREATE USER 'admin'@'%' IDENTIFIED BY 'admin_password';")
            cursor.execute("GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;")
            connection.commit()
            print("Admin user created successfully with all privileges.")
        
        connection.close()
    except Exception as e:
        print(f"Error creating admin user: {e}")

# function to initialize the database and create necessary tables if they do not exist
def init_db():
    conn=connect_db(use_database=False)
    with conn.cursor() as cursor:
        # create database if it does not exist
        cursor.execute("CREATE database IF NOT EXISTS uploads_db")
        cursor.execute("USE uploads_db") # select database

        # create the uploads table if it does not exist
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS uploads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL, 
                upload_timestamp DATETIME NOT NULL, 
                expiration_time DATETIME NOT NULL
            )
        ''')
    conn.commit() # save changes to database
    conn.close() # close database connection

# function to insert metadata of an uploaded file into database
def insert_metadata(filename, upload_timestamp, expiration_time):
    conn = connect_db()
    try:
        with conn.cursor() as cursor:
            sql_insert_meta = """
            INSERT INTO uploads (filename, upload_timestamp, expiration_time)
            VALUES (%s, %s, %s)
            """
            values = (filename, upload_timestamp, expiration_time)
            print(f"Attempting to insert: {values}")  # Debugging
            cursor.execute(sql_insert_meta, values)  # Execute the insert query
            conn.commit()
            print(f"Inserted: {values}")  # Debugging
    except Exception as e:
        print(f"Error inserting data: {e}")
        conn.rollback()  # In case of failure
    finally:
        conn.close()

# initialize the database when script runs
init_db()