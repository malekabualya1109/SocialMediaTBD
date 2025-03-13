/*Black Unit Test #1 */
/*I used the Cypress FrameWork to test my code here */
/*To understand how to correctly write javascript for the cypress framework, I used this
video as a reference = https://www.youtube.com/watch?v=u8vMu7viCm8 */ 
/*Additionally, I had difficulty configuring the 'npm test' on my local machine for some reason;
originally I wanted to use Mocha or Jes as my testing framework, but I kept running into 
a strange err. So, I found the next best thing = Cypress :) */

/*Code testing = (this code is stored in App.js on line 199)

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const toggleDropdown = () => {
   setIsDropdownVisible(!isDropdownVisible);
  };
 */


describe('Dropdown Visibility Test',()=> {
  /*Localhost 3000 is the port I was running the react app on, beforeEach
  helps set up the environment on Cypress*/
  beforeEach(() => {
    cy.visit('http://localhost:3000'); //Using cy extension to use "get" for Cypress framework.
  });

   //Test #1: Check if the dropdown visibility toggles when clicked.
  it('toggle correctly when being clicked', ()=>{
    //assert = setting menu should not exist yet on the app
    cy.get('.setting-menu').should('not.exist');
    //mock click the setting title
    cy.get('.setting').click();
    //the mock click then should drop down the setting menu
    cy.get('.setting-menu').then(($el)=>{
      assert.isTrue($el.is(':visible'),'menu appears');
    });
    cy.get('.setting').click();
  });

  //Test #2: Check that dropdown items are there correctly
  it('display the menu items', () =>{
    cy.get('.setting-menu').should('not.exist');
    cy.get('.setting').click();
    //assert that the nav bar has no length (meaning no menu items)
    cy.get('.setting-menu').then(($el)=>{
      assert.isTrue($el.length> 0,'drop down menu vanishes after clicky click');
    });
    cy.get('.setting-menu li').first().then(($li)=>{ //li is referring to the html tag
      assert.equal($li.text().trim(), 'Change Password','first menu item');
    });
    cy.get('.setting-menu li').last().then(($li) =>{ 
      assert.equal($li.text().trim(), 'Update Username', 'last menu item');
    });
  });

   //Test #3: Makin sure the drop down setting menu has the right num of items
  //Should be length 2: Update Username and Change Password
  it('displays just two elements in the menu', ()=> {
    cy.get('.setting').click();
    //Ensure menu length is now full length (2)
    cy.get('.setting-menu li').then(($items) => {
      assert.equal($items.length,2, 'menu has 2 items');
    });
  });
});

