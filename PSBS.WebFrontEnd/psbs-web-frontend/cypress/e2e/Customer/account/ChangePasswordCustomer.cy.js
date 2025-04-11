/// <reference types="cypress" />

describe('Change Password Customer Page', () => {
    const ACCOUNT_ID = '597618bc-b68e-48cb-8cfb-e698ae1dd4d6';
    const LOGIN_URL = 'http://localhost:3000/login';
    const CHANGE_PW_URL = `http://localhost:3000/changepasswordcustomer/${ACCOUNT_ID}`;
  
    const imageStub = {
      flag: true,
      data: {
        fileContents: Cypress.Buffer.from('fake-image-bytes').toString('base64'),
        contentType: 'image/jpeg',
      },
    };
  
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
  
      cy.intercept('POST', '**/api/Account/Login').as('loginRequest');
  
      cy.visit(LOGIN_URL);
      cy.get('#email').type('tuan0@gmail.com');
      cy.get('#password').type('1234567');
      cy.get('button[type="submit"]').click();
  
      cy.wait('@loginRequest').then(({ response }) => {
        expect(response.statusCode).to.equal(200);
        const token = response.body.data;
        cy.window().then((win) => {
          win.sessionStorage.setItem('token', token);
          win.sessionStorage.setItem('accountId', ACCOUNT_ID);
          win.localStorage.setItem('accountName', 'John Doe');
        });
      });
  
      cy.intercept('GET', `**/api/Account?AccountId=${ACCOUNT_ID}`, {
        statusCode: 200,
        body: { accountName: 'John Doe', accountImage: 'test-pet.jpg' },
      }).as('getAccount');
  
      cy.intercept('GET', `**/api/Account/loadImage?filename=test-pet.jpg`, {
        statusCode: 200,
        body: imageStub,
      }).as('loadImage');
  
      cy.visit(CHANGE_PW_URL);
    });
  
    it('displays user avatar and name', () => {
      cy.wait(['@getAccount', '@loadImage']);
      cy.get('img[alt="Profile"]').should('be.visible');
      cy.contains('John Doe').should('be.visible');
    });
  
    it('validates required fields and mismatched passwords', () => {
        cy.contains('button', 'Change Password').click();
      
        cy.contains('All fields are required.').should('be.visible');
      
        cy.get('input[placeholder="Enter your current password"]').type('oldpass');
        cy.get('input[placeholder="Enter your new password"]').type('newpass');
        cy.get('input[placeholder="Confirm your new password"]').type('wrongconfirm');
      
        cy.contains('button', 'Change Password').click();
      
        cy.contains('New password and confirm password do not match.').should('be.visible');
      });
      
      it('validates minimum password length', () => {
        cy.get('input[placeholder="Enter your current password"]').type('oldpass');
        cy.get('input[placeholder="Enter your new password"]').type('123');
        cy.get('input[placeholder="Confirm your new password"]').type('123');
      
        cy.contains('button', 'Change Password').click();
      
        cy.contains('New password must be at least 6 characters long.').should('be.visible');
      });
      
  
    it('submits password change successfully', () => {
      cy.intercept('PUT', '**/api/Account/ChangePassword*', {
        statusCode: 200,
      }).as('changePassword');
  
      cy.get('input[placeholder="Enter your current password"]').type('oldpass123');
      cy.get('input[placeholder="Enter your new password"]').type('newpass123');
      cy.get('input[placeholder="Confirm your new password"]').type('newpass123');
  
      cy.contains('button', 'Change Password').click();

      cy.wait('@changePassword');
      cy.contains('Password changed successfully!').should('be.visible');
    });
  
    it('navigates back when clicking Cancel button', () => {
      cy.contains('button', 'Cancel').click();
      cy.url().should('not.include', '/changepasswordcustomer');
    });
  });
  