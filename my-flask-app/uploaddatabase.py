import pymysql

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "monaabualya",
    "database": "uploads_db"
}

def connect_db():
    return pymysql.connect(**DB_CONFIG, cursorclass=pymysql.cursors.DictCursor)

def init_db():
    conn=connect_db()
    with conn.cursor() as cursor:
        cursor.execute("CREATE database IF NOT EXISTS uploads_db")
        cursor.execute("USE uploads_db")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS uploads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL, 
                upload_timestamp DATETIME NOT NULL, 
                expiration_time DATETIME NOT NULL
            )
        ''')
    conn.commit()
    conn.close()

def insert_metadata(filename, upload_timestamp, expiration_time):
    conn = connect_db()
    with conn.cursor() as cursor:
        sql_InsertMeta = """
        INSERT INTO uploads (filename, upload_timestamp, expiration_time)
        VALUES (%s, %s, %s)
        """
        values = (filename, upload_timestamp, expiration_time)

        try:
            cursor.execute(sql_InsertMeta, values)
            conn.commit()
            print(f"Inserted: {values}") #debugging
        except Exception as e:
            print(f"Error inserting data: {e}")
            conn.rollback()
    conn.close()

init_db()