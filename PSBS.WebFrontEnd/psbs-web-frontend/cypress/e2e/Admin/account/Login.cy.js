describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
  });

  it('should display the login form', () => {
    cy.get('input#email').should('be.visible');
    cy.get('input#password').should('be.visible');
    cy.contains('Sign In').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show validation error for empty fields', () => {
    cy.get('input#email').invoke('removeAttr', 'required');
    cy.get('input#password').invoke('removeAttr', 'required');
    cy.get('button[type="submit"]').click({ force: true });
    cy.get('.swal2-popup', { timeout: 5000 }).should('contain.text', 'Email and password cannot be empty');
  });


  it('should show validation error for invalid email', () => {
    cy.get('input#email').invoke('removeAttr', 'required');
    cy.get('input#email').invoke('removeAttr', 'type');
    cy.get('input#password').invoke('removeAttr', 'required');
    cy.get('input#email').clear().type('invalid-email');
    cy.get('input#password').clear().type('123456');
    cy.get('form').submit();
    cy.wait(1000);
    cy.contains('Please enter a valid email address', { timeout: 5000 }).should('be.visible');

  });




  it('should show validation error for short password', () => {
    cy.get('input#email').clear().type('test@example.com');
    cy.get('input#password').clear().type('123'); 
    cy.get('button[type="submit"]').click();
    cy.get('.swal2-popup').should('contain.text', 'Password must be at least 6 characters');
  });

  it('should login successfully and navigate to the correct page', () => {
    const dummyPayload = {
      AccountId: "testAccountId",
      AccountIsDeleted: "False",
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "user"
    };
    const base64Payload = btoa(JSON.stringify(dummyPayload));
    const token = `header.${base64Payload}.signature`;

    cy.intercept('POST', '**/api/Account/Login', (req) => {
      req.reply({
        statusCode: 200,
        body: { flag: true, data: token }
      });
    }).as('loginRequest');

    cy.get('input#email').clear().type('test@example.com');
    cy.get('input#password').clear().type('123456');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest', { timeout: 15000 }).then((interception) => {
      expect(interception.response.body).to.have.property('data', token);
    });

    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('token')).to.equal(token);
      expect(win.sessionStorage.getItem('accountId')).to.equal('testAccountId');
    });

    cy.url().should('not.include', '/login');
  });

  it('should show error popup when login fails', () => {
    cy.intercept('POST', '**/api/Account/Login', (req) => {
      req.reply({
        statusCode: 400,
        body: { flag: false, message: "Invalid credentials" }
      });
    }).as('failedLogin');

    cy.get('input#email').clear().type('wrong@example.com');
    cy.get('input#password').clear().type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@failedLogin', { timeout: 15000 });
    cy.get('.swal2-popup').should('contain.text', 'Login Failed');
    cy.get('.swal2-popup').should('contain.text', 'Invalid credentials');
  });

  it('should show error popup if account is deleted', () => {
    const dummyPayload = {
      AccountId: "deletedAccount",
      AccountIsDeleted: "True",
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "user"
    };
    const base64Payload = btoa(JSON.stringify(dummyPayload));
    const token = `header.${base64Payload}.signature`;

    cy.intercept('POST', '**/api/Account/Login', (req) => {
      req.reply({
        statusCode: 200,
        body: { flag: true, data: token }
      });
    }).as('deletedLogin');

    cy.get('input#email').clear().type('deleted@example.com');
    cy.get('input#password').clear().type('123456');
    cy.get('button[type="submit"]').click();

    cy.wait('@deletedLogin', { timeout: 15000 });
    cy.get('.swal2-popup').should('contain.text', 'Account Deleted');
    cy.get('.swal2-popup').should('contain.text', 'Your account has been deleted. Please contact support.');
  });
});
