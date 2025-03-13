import unittest
import random
import string
import pymysql
from loginandsignup import app 



# ---------------------------------------------------
# This is a test file for loginandsignup.py
# ---------------------------------------------------


class SnL_Test(unittest.TestCase):

    #my testers constant that I will use accross my tests

    TEST_USERNAME = "testuser"
    TEST_PASSWORD = "testpass"

    #creating a client test

    def setUp(self):

        #setting up test client and cleaning the database before each test

        self.client = app.test_client()
        self.client.testing = True
    

        #cleaning up before starting the other tests, so that each tests are independants

        self.clean()


    def clean(self):

        """removing any existing test user from the database"""

        connection = pymysql.connect( host='localhost', user='tea', password='', database='userdata')
        cursor = connection.cursor()

        # deleting the test user if it alrady exists
        cursor.execute( "DELETE FROM data WHERE username = %s", (self.TEST_USERNAME,))

        connection.commit()
        connection.close()



    # --------------------------------------
    # BLACK-BOX TESTS
    # --------------------------------------


    #testing the home route

    """Testing if the home route works"""

    def test_home(self):

        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Backend message sending to front end", response.data)

    # testing the sign ups
   

    #empty fields

    #for my self, asserts errors needs  to match wathever i putted in the loginandsignup

    def test_sEmpty(self):

        """Testing sign-up failure with empty username or password"""

        response = self.client.post('/api/signup', json={ 'username': '', 'password': self.TEST_PASSWORD})
        self.assertEqual(response.status_code, 400)
        data = response.get_json()

        self.assertEqual(data["error"], "Username or password cannot be empty")

        response = self.client.post('/api/signup', json={'username': self.TEST_USERNAME, 'password': ''})

        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertEqual(data["error"], "Username or password cannot be empty")




    # validity of the sign up

    def test_sValid(self):

        """Testing successful sign-up with valid username/password"""

        response = self.client.post('/api/signup', json={ 'username': self.TEST_USERNAME, 'password': self.TEST_PASSWORD})
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn("user_id", data)
        self.assertEqual(data["message"], "User created successfully!")
    


    # --------------------------------------
    # WHITE BOX TESTS
    # --------------------------------------


    # This test here is veryfying both the statement and branch coverage for each endpoint functions


    def test_sExistence(self):

        """Testing sign-up fails if the username already exists
        This is both a statement and branch coverage 
        Function under test :
           def signup():
                if username == "" or password == "":
                    return error("Username or password cannot be empty")
                if user_exists(username):
                    return error("Username already exist")
                # User creation logic

        """


        # First signup attempt (should succeed)
        response1 = self.client.post('/api/signup', json={ 'username': self.TEST_USERNAME,'password': self.TEST_PASSWORD})
        self.assertEqual(response1.status_code, 201)

        # Second signup attempt (should fail)
        response2 = self.client.post('/api/signup', json={'username': self.TEST_USERNAME, 'password': self.TEST_PASSWORD})
        
        self.assertEqual(response2.status_code, 400)
        data = response2.get_json()
        self.assertEqual(data["error"], "Username already exist")

      




    def test_lValid(self):
        
        """Testing a valid login after sign-up


        This is a statement coverage 
        Function under test :
          def login():
                if not verify_user(username, password):
                    return error("Invalid credentials")
                return success("Login successful!")


        """

        # First, signup
        signup_response = self.client.post('/api/signup', json={ 'username': self.TEST_USERNAME, 'password': self.TEST_PASSWORD })
        self.assertEqual(signup_response.status_code, 201)

        # Now login
        login_response = self.client.post('/api/login', json={
            'username': self.TEST_USERNAME,
            'password': self.TEST_PASSWORD
        })
        self.assertEqual(login_response.status_code, 200)
        data = login_response.get_json()
        self.assertEqual(data["message"], "Login successful!")
       


    def test_lInvalid(self):

        """Testing login fails with incorrect credentials
            
        This is a branch coverage
        Function under test :
            def login():
                if not verify_user(username, password):
                    return error("Invalid credentials")
                
        """

       
        
        login_response = self.client.post('/api/login', json={'username': 'wronguser', 'password': 'wrongpass' })
        self.assertEqual(login_response.status_code, 401)
        
        data = login_response.get_json()
        self.assertEqual(data["error"], "Invalid credentials")
        


    def test_interests(self):

        """Testing that user interests are saved correctly

        This is a statement coverage

         Function under test :
            def set_interests():
                if not valid_user(user_id):
                    return error("User not found")
                save_interests(user_id, interests)
                return success("Interests saved successfully")
        """

        
        # signing up first
        signup_response = self.client.post('/api/signup', json={ 'username': self.TEST_USERNAME, 'password': self.TEST_PASSWORD})
        self.assertEqual(signup_response.status_code, 201)
        user_id = signup_response.get_json().get("user_id")

        # showing the  interests to save it
        interests_response = self.client.post('/api/set_interests', json={'user_id': user_id, 'interests': [1, 2]})
        self.assertEqual(interests_response.status_code, 200)
        
        data = interests_response.get_json()
        self.assertEqual(data["message"], "Interests saved successfully")

       


    # --------------------------------------
    # INTEGRATION TESTS
    # --------------------------------------

    # I am testing if multiples API work together correctly, in here I am testing for sign up and login, and then sign up and interests
 
    def test_sigLog(self):
     
        """Integration test: sign-up -> login sequence"""

        # the signup
        signup_resp = self.client.post('/api/signup', json={ 'username': self.TEST_USERNAME,'password': self.TEST_PASSWORD})
        self.assertEqual(signup_resp.status_code, 201)

        # the login
        login_resp = self.client.post('/api/login', json={'username': self.TEST_USERNAME,'password': self.TEST_PASSWORD})
        self.assertEqual(login_resp.status_code, 200)
        data = login_resp.get_json()
        self.assertEqual(data["message"], "Login successful!")



   
    def test_sigInt(self):
        """Integration test: sign-up -> set interests"""
    

        # the sign up
        signup_resp = self.client.post('/api/signup', json={ 'username': self.TEST_USERNAME,  'password': self.TEST_PASSWORD})
        self.assertEqual(signup_resp.status_code, 201)
        user_id = signup_resp.get_json()["user_id"]

        # the interests
        interests_resp = self.client.post('/api/set_interests', json={ 'user_id': user_id, 'interests': [1, 2] })
        self.assertEqual(interests_resp.status_code, 200)
        data_interests = interests_resp.get_json()
        self.assertEqual(data_interests["message"], "Interests saved successfully")

        


if __name__ == '__main__':


    suite = unittest.TestSuite()

    # adding test cases in the order they appear in the class
    suite.addTest(SnL_Test("test_home"))
    suite.addTest(SnL_Test("test_sEmpty"))
    suite.addTest(SnL_Test("test_sValid"))
    suite.addTest(SnL_Test("test_sExistence"))
    suite.addTest(SnL_Test("test_lValid"))
    suite.addTest(SnL_Test("test_lInvalid"))
    suite.addTest(SnL_Test("test_interests"))
    suite.addTest(SnL_Test("test_sigLog"))
    suite.addTest(SnL_Test("test_sigInt"))

    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)

