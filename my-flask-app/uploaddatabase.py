import pymysql

# database config dict with connection details
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "monaabualya",
    "database": "uploads_db"
}

# function to establish a connection to the database
def connect_db():
    return pymysql.connect(**DB_CONFIG, cursorclass=pymysql.cursors.DictCursor)

# function to initialize the database and create necessary tables if they do not exist
def init_db():
    conn=connect_db()
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
    with conn.cursor() as cursor:
        # SQL query to insert metadata into uploads table
        sql_InsertMeta = """
        INSERT INTO uploads (filename, upload_timestamp, expiration_time)
        VALUES (%s, %s, %s)
        """
        values = (filename, upload_timestamp, expiration_time)

        try:
            cursor.execute(sql_InsertMeta, values) # execute the insert query
            conn.commit()
            print(f"Inserted: {values}") # debugging
        except Exception as e:
            print(f"Error inserting data: {e}")
            conn.rollback() # in case of failure
    conn.close() # close database connection

# initialize the database when script runs
init_db()