describe('Profile Page', () => {
    const accountId = '12345';
    const validToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsIm5hbWUiOiJUZXN0IFVzZXIiLCJyb2xlIjoidXNlciIsImlhdCI6MTYwOTE1MjgwMH0.dummySignature';

    beforeEach(() => {
        cy.window().then((win) => {
            win.sessionStorage.setItem('token', validToken);
        });

        cy.intercept('GET', `**/api/Account?AccountId=${accountId}`, {
            statusCode: 200,
            body: {
                accountName: 'TestUser',
                accountEmail: 'testuser@example.com',
                accountPhoneNumber: '0123456789',
                accountGender: 'male',
                accountDob: '1990-01-01T00:00:00',
                accountAddress: '123 ABC Street',
                roleId: 'user',
                accountLoyaltyPoint: 2000,
                accountImage: 'testuser.png',
            },
        }).as('getAccount');

        cy.intercept('GET', `**/api/Account/loadImage?filename=testuser.png`, {
            statusCode: 200,
            body: {
                flag: true,
                data: {
                    fileContents: 'base64ImageData',
                    contentType: 'image/png',
                },
            },
        }).as('getImage');

        cy.visit(`http://localhost:3000/profile/${accountId}`, {
            onBeforeLoad: (win) => {
                win.sessionStorage.setItem('token', validToken);
            },
        });

        cy.wait('@getAccount');
        cy.wait('@getImage');
    });
    it('should display account information and profile image when image is available', () => {
        const accountData = {
          accountName: 'TestUser',
          accountEmail: 'testuser@example.com',
          accountPhoneNumber: '0123456789',
          accountGender: 'male',
          accountDob: '1990-01-01T00:00:00',
          accountAddress: '123 ABC Street',
          roleId: 'user',
          accountLoyaltyPoint: 2000,
          accountImage: 'testuser.png',
        };
        cy.intercept('GET', `**/api/Account?AccountId=${accountId}`, {
          statusCode: 200,
          body: accountData,
        }).as('getAccount');
        cy.intercept('GET', `**/api/Account/loadImage?filename=${accountData.accountImage}`, {
          statusCode: 200,
          body: {
            flag: true,
            data: {
              fileContents: 'iVBORw0KGgoAAAANSUhEUgAAAAUA…', 
              contentType: 'image/png',
            },
          },
        }).as('getImage');
        cy.visit(`http://localhost:3000/profile/${accountId}`, {
          onBeforeLoad(win) {
            win.sessionStorage.setItem('token', validToken);
          },
        });
        cy.wait('@getAccount');
        cy.wait('@getImage');
        cy.contains('Profile').should('be.visible');
        cy.get('input#accountName').should('have.value', accountData.accountName);
        cy.get('input#email').should('have.value', accountData.accountEmail);
        cy.get('input#birthday').should('have.value', '01/01/1990');
        cy.get('input#phone').should('have.value', accountData.accountPhoneNumber);
        cy.get('input#address').should('have.value', accountData.accountAddress);
        cy.get('input#loyaltyPoints').should('have.value', '2,000');
        cy.get('input[type="radio"][value="male"]').should('be.checked');
        cy.get('input[type="radio"][value="female"]').should('not.be.checked');
        cy.get('img[alt="Profile Preview"]')
          .should('have.attr', 'src')
          .and('match', /^data:image\/png;base64,/);
      });
      
    it('should display default SVG when account image is not available', () => {
        cy.intercept('GET', `**/api/Account?AccountId=${accountId}`, {
            statusCode: 200,
            body: {
                accountName: 'TestUser',
                accountEmail: 'testuser@example.com',
                accountPhoneNumber: '0123456789',
                accountGender: 'male',
                accountDob: '1990-01-01T00:00:00',
                accountAddress: '123 ABC Street',
                accountLoyaltyPoint: 2000,
                accountImage: 'testuser.png',
            },
        }).as('getAccountNoImage');

        cy.visit(`http://localhost:3000/profile/${accountId}`);
        cy.wait('@getAccountNoImage');
        cy.contains('TestUser').should('be.visible');
        cy.get('svg').should('be.visible');
    });

    it('should have functional navigation buttons', () => {
        cy.get('a[href="/editprofile/12345"]').contains('Edit').should('exist');
        cy.get('a[href="/changepassword/12345"]').contains('Change Password').should('exist');
    });
});
