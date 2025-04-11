describe('Customer Profile Page (via real login)', () => {
    const ACCOUNT_ID = '597618bc-b68e-48cb-8cfb-e698ae1dd4d6';
    const PROFILE_URL = `http://localhost:3000/profilecustomer/${ACCOUNT_ID}`;
  
    const accountData = {
      accountId: ACCOUNT_ID,
      accountName: 'John Doe',
      accountEmail: 'john.doe@example.com',
      accountDob: '1990-05-15T00:00:00Z',
      accountGender: 'male',
      accountPhoneNumber: '0123456789',
      accountAddress: '123 Main St, Hometown',
      accountLoyaltyPoint: 2500,
      accountImage: 'john-doe.jpg',
    };
  
    const imageStub = {
      flag: true,
      data: {
        fileContents: Cypress.Buffer.from('fake-image-bytes').toString('base64'),
        contentType: 'image/png'
      }
    };
  
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
  
      cy.intercept('POST', '**/api/Account/Login').as('loginRequest');
  
      cy.visit('http://localhost:3000/login');
      cy.get('#email').should('be.visible').type('tuan0@gmail.com');
      cy.get('#password').type('1234567');
      cy.get('button[type="submit"]').click();
  
      cy.wait('@loginRequest').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        const token = interception.response.body.data;
        expect(token).to.be.a('string');
        cy.window().then(win => {
          win.sessionStorage.setItem('token', token);
          win.sessionStorage.setItem('accountId', ACCOUNT_ID);
        });
      });
  
      cy.url().should('not.include', '/login');
  
      cy.intercept(
        'GET',
        `**/api/Account?AccountId=${ACCOUNT_ID}`,
        req => req.reply({ statusCode: 200, body: accountData, delay: 300 })
      ).as('getAccount');
  
      cy.intercept(
        'GET',
        `**/api/Account/loadImage?filename=${accountData.accountImage}`,
        req => req.reply({ statusCode: 200, body: imageStub, delay: 100 })
      ).as('loadImage');
  
      cy.visit(PROFILE_URL);
    });
  
    it('displays loading then profile info', () => {
      cy.contains('Loading...').should('be.visible');
      cy.wait(['@getAccount', '@loadImage']);
      cy.contains('Loading...').should('not.exist');
      cy.contains('Profile').should('be.visible');
    });
  
    it('renders all profile fields correctly', () => {
      cy.wait(['@getAccount', '@loadImage']);
  
      cy.get('img[alt="Profile Preview"]').should('be.visible');
      cy.get('#accountName').should('have.value', accountData.accountName);
      cy.get('#email').should('have.value', accountData.accountEmail);
      cy.get('#birthday').should('have.value', '15/05/1990');
      cy.get('input[name="gender"][value="male"]').should('be.checked');
      cy.get('#phone').should('have.value', accountData.accountPhoneNumber);
      cy.get('#address').should('have.value', accountData.accountAddress);
      cy.get('#loyaltyPoints').should('have.value', '2,500');
    });
  
    it('is responsive across viewports', () => {
      cy.wait(['@getAccount', '@loadImage']);
      ['iphone-x', 'ipad-2'].forEach(device => {
        cy.viewport(device);
        cy.contains('Profile').should('be.visible');
      });
      cy.viewport(1280, 800);
      cy.contains('Profile').should('be.visible');
    });
  
    it('navigates to Edit Profile and Change Password', () => {
      cy.wait(['@getAccount', '@loadImage']);
  
      cy.contains('button', 'Edit').click();
      cy.url().should('include', `/editprofilecustomer/${ACCOUNT_ID}`);
  
      cy.go('back');
      cy.wait(['@getAccount', '@loadImage']);
  
      cy.contains('button', 'Change Password').click();
      cy.url().should('include', `/changepasswordcustomer/${ACCOUNT_ID}`);
    });
  
    it('shows placeholder if no profile image', () => {
      cy.intercept(
        'GET',
        `**/api/Account?AccountId=${ACCOUNT_ID}`,
        { statusCode: 200, body: { ...accountData, accountName: 'Jane Doe', accountImage: null, accountDob: null, accountPhoneNumber:'', accountAddress:'', accountLoyaltyPoint:0 } }
      ).as('getNoImage');
  
      cy.visit(PROFILE_URL);
      cy.wait('@getNoImage');
  
      cy.get('img[alt="Profile Preview"]').should('not.exist');
      cy.get('svg').should('exist');
      cy.contains('Jane Doe').should('be.visible');
    });
  
    it('remains in loading state on API error', () => {
      cy.intercept(
        'GET',
        `**/api/Account?AccountId=${ACCOUNT_ID}`,
        { statusCode: 500, body: { message: 'Server error' } }
      ).as('getError');
  
      cy.visit(PROFILE_URL);
      cy.wait('@getError');
      cy.contains('Loading...').should('be.visible');
    });
  });
  