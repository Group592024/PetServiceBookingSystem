describe('Change Password Page', () => {
    const accountId = '12345';
    const validToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsIm5hbWUiOiJUZXN0IFVzZXIiLCJyb2xlIjoic3RhZmYiLCJpYXQiOjE2MDkxNTI4MDB9.dummySignature';



    beforeEach(() => {
        cy.window().then((win) => {
            win.sessionStorage.setItem('token', validToken);
        });
        cy.intercept('GET', `**/api/Account?AccountId=${accountId}`, {
            statusCode: 200,
            body: {
                accountName: 'TestUser',
                accountImage: null, 
            },
        }).as('getAccount');

        cy.visit(`http://localhost:3000/changepassword/${accountId}`, {
            onBeforeLoad: (win) => {
                win.sessionStorage.setItem('token', validToken);
            }
        });
        cy.wait('@getAccount');
    });

    it('should display account information and placeholder image when no image is available', () => {
        cy.contains('TestUser').should('be.visible');
        cy.get('svg').should('be.visible');
    });

    it('should show error when required fields are empty', () => {
        cy.get('form').should('exist');
        cy.contains('button', 'Change Password').click();
        cy.contains('All fields are required.').should('be.visible');
    });


    it('should show error when new password is shorter than 6 characters', () => {
        cy.get('input[placeholder="Enter current password"]').type('oldpass');
        cy.get('input[placeholder="Enter new password"]').type('123');
        cy.get('input[placeholder="Confirm new password"]').type('123');
        cy.contains('button', 'Change Password').click();
        cy.contains('New password must be at least 6 characters long.').should('be.visible');
    });

    it('should show error when new password and confirm password do not match', () => {
        cy.get('input[placeholder="Enter current password"]').type('oldpass');
        cy.get('input[placeholder="Enter new password"]').type('newpassword');
        cy.get('input[placeholder="Confirm new password"]').type('differentpassword');
        cy.contains('button', 'Change Password').click();
        cy.contains('New password and confirm password do not match.').should('be.visible');
    });

    it('should successfully change the password', () => {
        cy.intercept('PUT', `**/api/Account/ChangePassword${accountId}`, {
            statusCode: 200,
            body: { message: 'Password changed successfully!' },
        }).as('changePassword');
        cy.get('input[placeholder="Enter current password"]').type('oldpass');
        cy.get('input[placeholder="Enter new password"]').type('newpassword');
        cy.get('input[placeholder="Confirm new password"]').type('newpassword');
        cy.contains('button', 'Change Password').click();
        cy.wait('@changePassword');
        cy.contains('Password changed successfully!').should('be.visible');
        cy.contains('button', 'OK').click();
        cy.get('input[placeholder="Enter current password"]').should('have.value', '');
        cy.get('input[placeholder="Enter new password"]').should('have.value', '');
        cy.get('input[placeholder="Confirm new password"]').should('have.value', '');
    });


    it('should show error when API returns an error', () => {
        cy.intercept('PUT', `**/api/Account/ChangePassword${accountId}`, {
            statusCode: 400,
            body: { message: 'Failed to change password' },
        }).as('changePasswordError');
        cy.get('input[placeholder="Enter current password"]').type('oldpass');
        cy.get('input[placeholder="Enter new password"]').type('newpassword');
        cy.get('input[placeholder="Confirm new password"]').type('newpassword');
        cy.contains('button', 'Change Password').click();
        cy.wait('@changePasswordError');
        cy.contains('Failed to change password').should('be.visible');
        cy.contains('button', 'OK').click();
    });

    it('should navigate back when clicking the Back button', () => {
        const currentUrl = `http://localhost:3000/changepassword/12345`;
        cy.visit(currentUrl);
        cy.contains('button', 'Back').should('exist').click();
        cy.url().should('not.eq', currentUrl);
      });
      

});
