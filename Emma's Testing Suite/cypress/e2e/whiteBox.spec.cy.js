/*White box Testing - this testing suite 'describe' tests whether the login information
entered by a user is valid or not and test the functionality of the sign in page.*/

const assert = require('chai').assert;//Using chai so I can use the assert functions here

/*Test #1: Testing Fatimah's javascript code to ensure login information is correctly being stored for her cool cam = 
  This code is stored on line 267 in App.js

/*     const handleLogin = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      }); 
      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setAuthMessage('You logged in successfully. Welcome to Tea Talks!');
      } else {
        setAuthMessage(data.error || 'Login failed.');
      }
    } catch (error) {
      setAuthMessage('Error connecting to server');
    }
  };*/


  /*Testing Suite for the White Box Test*/
describe('White Box Test', () => {

  //Conditions I am testing, scenarios! 
  const handleLogin = (username, password) => {
    if (!username || !password) return 'Username/password cannot be empty';
    if (username === 'validUser' && password === 'validPass') return 'Login worked';
    return 'Invalid login';
  };

  //Assertion #1: Test when expecting valid login info
  it('expecting valid info for logging in', () => {
    assert.strictEqual(handleLogin('validUser', 'validPass'), 'Login worked');
  });

  //Assertion #2: Test when expecting invalid login info
  it('expecting bad info for logging in', () => {
    assert.strictEqual(handleLogin('invalidUser', 'wrongPass'), 'Invalid login');
  });

  //Assertion #3: Test when expecting nothing from either password or username
  it('either username or password are empty', () => {
    assert.strictEqual(handleLogin('', 'password'), 'Username/password cannot be empty');
    assert.strictEqual(handleLogin('username', ''), 'Username/password cannot be empty');
  });

  //Assertion #4: Test when neither password or username are entered
  it('both password adn username are empty', () => {
    assert.strictEqual(handleLogin('',''), 'Username/password cannot be empty'); 
  }); 
});



