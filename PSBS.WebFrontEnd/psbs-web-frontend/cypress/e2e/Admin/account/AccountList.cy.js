
describe('Account List Page', () => {
    const validToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsIm5hbWUiOiJUZXN0IFVzZXIiLCJyb2xlIjoic3RhZmYiLCJpYXQiOjE2MDkxNTI4MDB9.dummySignature';

    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();

        cy.intercept('POST', '**/api/Account/Login', {
            statusCode: 200,
            body: { data: validToken },
        }).as('loginRequest');

        cy.intercept('GET', '**/api/token/validate', {
            statusCode: 200,
            body: { valid: true },
        }).as('tokenValidate');

        cy.intercept('GET', '**/api/Account/all', {
            statusCode: 200,
            body: {
                data: [
                    {
                        accountId: 'acc1',
                        accountName: 'John Doe',
                        accountEmail: 'john.doe@example.com',
                        accountPhoneNumber: '0123456789',
                        roleId: 'user',
                        createdAt: '2023-01-01T00:00:00',
                        updatedAt: '2023-01-05T00:00:00',
                        accountIsDeleted: false,
                    },
                    {
                        accountId: 'acc2',
                        accountName: 'Jane Smith',
                        accountEmail: 'jane.smith@example.com',
                        accountPhoneNumber: '0987654321',
                        roleId: 'user',
                        createdAt: '2023-02-01T00:00:00',
                        updatedAt: '2023-02-05T00:00:00',
                        accountIsDeleted: true,
                    },
                ],
            },
        }).as('getAccounts');

        cy.visit('http://localhost:3000/login');
        cy.get('#email', { timeout: 10000 }).should('be.visible').type('tuanla2678@gmail.com');
        cy.get('#password').type('123456');
        cy.get('button[type="submit"]').click();

        cy.wait('@loginRequest').then((interception) => {
            expect(interception.response.body).to.have.property('data');
            const token = interception.response.body.data;
            cy.window().then((win) => {
                win.sessionStorage.setItem('token', token);
            });
        });

        cy.url({ timeout: 10000 }).then((url) => {
            if (url.includes('/login')) {
                cy.visit('http://localhost:3000/account');
            }
        });

        cy.window().then((win) => {
            if (!win.localStorage.getItem('role')) {
                win.localStorage.setItem('role', 'staff');
            }
        });

        cy.wait('@getAccounts');
        cy.get('.MuiDataGrid-root', { timeout: 20000 }).should('exist');
    });

    it('should display account list correctly', () => {
        cy.contains('h2', 'Account List').should('be.visible');
        cy.contains('John Doe').should('be.visible');
        cy.contains('jane.smith@example.com').should('be.visible');
    });

    it('should open and close the create account modal', () => {
        cy.get('button').contains('New').should('be.visible').click();
        cy.get('.MuiDialog-root').should('be.visible');

        cy.get('button').contains('Cancel').click();
        cy.get('.MuiDialog-root').should('not.exist');
    });

    it('should validate email and phone fields in the create account modal', () => {
        cy.get('button').contains('New').click();
    
        cy.get('button').contains('Submit').click();
        cy.get('.swal2-popup')
            .should('contain', 'Please fill in all required fields');
        cy.get('.swal2-confirm').click();
    
        cy.get('input[data-cy="email-input"]')
            .clear({ force: true })
            .type('invalid-email');
        cy.get('input[data-cy="phone-input"]')
            .clear({ force: true })
            .type('0123456789'); 
    
        cy.get('button').contains('Submit').click();
        cy.get('.swal2-popup')
            .should('be.visible')
            .should('contain', 'valid email');
        cy.get('.swal2-confirm').click();
    
        cy.get('input[data-cy="email-input"]')
            .clear({ force: true })
            .type('user@example.com');
        cy.get('input[data-cy="phone-input"]')
            .clear({ force: true })
            .type('123');
    
        cy.get('button').contains('Submit').click();
        cy.get('.swal2-popup')
            .should('contain', 'Please enter a valid email address (e.g., username@gmail.com)');
        cy.get('.swal2-confirm').click();
    
        cy.get('.swal2-popup').should('not.exist');
    });
    



    it('should create a new account successfully', () => {
        cy.intercept('POST', '**/api/Account/addaccount', {
            statusCode: 200,
            body: { message: 'Account added successfully!' },
        }).as('addAccount');

        cy.get('button').contains('New').click();

        cy.get('[data-cy="email-input"]').clear({ force: true }).type('newuser@example.com');
        cy.get('[data-cy="phone-input"]').clear({ force: true }).type('0123456789');
        cy.get('button').contains('Submit').click();

        cy.wait('@addAccount');
        cy.get('.swal2-popup').should('contain.text', 'Account added successfully!');
    });

    it('should delete an account (soft delete) successfully', () => {
        cy.intercept('DELETE', '**/api/Account/delete/*', {
            statusCode: 200,
            body: { message: 'Account has been marked as deleted.' },
        }).as('deleteAccount');

        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');
        cy.get('.MuiDataGrid-row').first().within(() => {
            cy.get('button[aria-label="Delete"]').click();
        });

        cy.contains('Are you sure?').should('be.visible');
        cy.contains('Yes, delete it!').click();

        cy.wait('@deleteAccount');
        cy.get('.swal2-popup').should('contain.text', 'marked as deleted');
    });

    it('should handle delete error correctly', () => {
        cy.intercept('DELETE', '**/api/Account/delete/*', {
            statusCode: 400,
            body: { message: 'Failed to delete the account.' },
        }).as('deleteAccountError');

        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');
        cy.get('.MuiDataGrid-row').first().within(() => {
            cy.get('button[aria-label="Delete"]').click();
        });

        cy.contains('Are you sure?').should('be.visible');
        cy.contains('Yes, delete it!').click();

        cy.wait('@deleteAccountError');
        cy.get('.swal2-popup').should('contain.text', 'Failed to delete the account');
    });
});
