import 'cypress-file-upload';

describe('Edit Profile Page', () => {
    const accountId = '12345';
    const validToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJpZCI6IjEyMyIsIm5hbWUiOiJBZG1pbiBVc2VyIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjA5MTUyODAwfQ.' +
        'dummySignatureAdmin';

    beforeEach(() => {
        cy.intercept('GET', `**/api/Account?AccountId=${accountId}`, {
            statusCode: 200,
            body: {
                accountName: 'TestAdmin',
                accountEmail: 'admin@example.com',
                accountPhoneNumber: '0123456789',
                accountGender: 'male',
                accountDob: '1990-01-01T00:00:00',
                accountAddress: '123 ABC Street',
                roleId: 'admin',
                accountImage: 'admin.png',
                accountIsDeleted: false,
            },
        }).as('getAccount');

        cy.intercept('GET', `**/api/Account/loadImage?filename=admin.png`, {
            statusCode: 200,
            body: {
                flag: true,
                data: {
                    fileContents: 'base64ImageData',
                    contentType: 'image/png',
                },
            },
        }).as('getImage');

        cy.visit(`http://localhost:3000/editprofile/${accountId}`, {
            onBeforeLoad: (win) => {
                win.sessionStorage.setItem('token', validToken);
            },
        });

        cy.wait('@getAccount');
        cy.wait('@getImage');
    });

    it('should display account data correctly', () => {
        cy.contains('Edit Profile').should('be.visible');
        cy.get('input#name').should('have.value', 'TestAdmin');
        cy.get('input#email').should('have.value', 'admin@example.com');
        cy.get('input#phone').should('have.value', '0123456789');
        cy.get('input#address').should('have.value', '123 ABC Street');
        cy.get('select#role').should('have.value', 'admin');
        cy.get('input[type="radio"][value="male"]').should('be.checked');
        cy.get('img[alt="Profile Preview"]').should('exist');
        cy.get('select#isDelete').should('have.value', 'false');
    });

    it('should show validation errors when required fields are empty or invalid', () => {
        cy.get('input#name').clear();
        cy.get('input#phone').clear();
        cy.get('input#address').clear();
        cy.contains('button', 'Save').click();
        cy.contains('Name is required').should('exist');
        cy.contains('Phone number is required').should('exist');
        cy.contains('Address is required').should('exist');

        cy.contains('Birthday')
            .parent()
            .find('input')
            .clear()
            .type('01/01/3000{enter}');
        cy.contains('button', 'Save').click();
        cy.contains('Birthday cannot be in the future').should('exist');
    });

    it('should successfully update the profile with status change', () => {
        cy.intercept('PUT', `**/api/Account`, {
            statusCode: 200,
            body: { flag: true },
        }).as('updateProfile');

        cy.get('input#name').clear().type('Updated Admin');
        cy.get('input#phone').clear().type('0987654321');
        cy.get('input#address').clear().type('456 XYZ Avenue');
        cy.get('input[type="file"]').attachFile('images/test-pet.jpg');
        cy.contains('button', 'Save').click();

       
    });

    it('should show error when API returns an error during update', () => {
        cy.intercept('PUT', `**/api/Account`, {
            statusCode: 400,
            body: { message: 'Failed to update profile' },
        }).as('updateProfileError');

        cy.get('input#name').clear().type('Updated Admin');
        cy.get('input#phone').clear().type('0987654321');
        cy.get('input#address').clear().type('456 XYZ Avenue');
        cy.get('select#isDelete').select('Banned');
        cy.contains('button', 'Save').click();

        cy.wait('@updateProfileError');
        cy.contains('Failed to update profile').should('be.visible');
        cy.url().should('include', `/editprofile/${accountId}`);
    });

    it('should navigate back when clicking the Back button', () => {
        cy.contains('button', 'Back').click();
        cy.url().should('not.include', `/editprofile/${accountId}`);
    });
});