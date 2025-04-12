describe('Edit Profile Customer Page', () => {
    const ACCOUNT_ID = '597618bc-b68e-48cb-8cfb-e698ae1dd4d6';
    const LOGIN_URL = 'http://localhost:3000/login';
    const EDIT_URL = `http://localhost:3000/editprofilecustomer/${ACCOUNT_ID}`;

    const accountData = {
        accountId: ACCOUNT_ID,
        accountName: 'John Doe',
        accountEmail: 'john.doe@example.com',
        accountDob: '1990-05-15T00:00:00Z',
        accountGender: 'male',
        accountPhoneNumber: '0923456789',
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

        cy.visit(LOGIN_URL);
        cy.get('#email').should('be.visible').type('tuan0@gmail.com');
        cy.get('#password').type('1234567');
        cy.get('button[type="submit"]').click();

        cy.wait('@loginRequest').then(({ response }) => {
            expect(response.statusCode).to.equal(200);
            const token = response.body.data;
            expect(token).to.be.a('string');
            cy.window().then(win => {
                win.sessionStorage.setItem('token', token);
                win.sessionStorage.setItem('accountId', ACCOUNT_ID);
            });
        });

        cy.intercept('GET', `**/api/Account?AccountId=${ACCOUNT_ID}`, req => {
            req.reply({ statusCode: 200, body: accountData, delay: 200 });
        }).as('getAccount');

        cy.intercept('GET', `**/api/Account/loadImage?filename=${accountData.accountImage}`, req => {
            req.reply({ statusCode: 200, body: imageStub, delay: 100 });
        }).as('loadImage');

        cy.intercept('PUT', '**/api/Account', {
            statusCode: 200,
            body: { flag: true, message: 'Profile updated successfully!' }
        }).as('putAccount');

        cy.visit(EDIT_URL);
    });

    it('pre-fills the form after load', () => {
        cy.wait(['@getAccount', '@loadImage']);
        cy.get('#name').should('have.value', accountData.accountName);
        cy.get('#email')
          .should('have.value', accountData.accountEmail)
          .and('be.disabled');
        cy.contains('label', 'Date of Birth')
          .parent()
          .find('input')
          .should('have.value', '15/05/1990');
        cy.contains('span', 'Male')
          .closest('div.flex-1')
          .should('have.class', 'bg-blue-50');
        cy.get('#phone').should('have.value', accountData.accountPhoneNumber);
        cy.get('#address').should('have.value', accountData.accountAddress);
        cy.get('img[alt="Profile Preview"]')
          .should('be.visible')
          .and('have.attr', 'src')
          .and('match', /^data:image\/png;base64,/);
    });

    it('validates required fields', () => {
        cy.wait(['@getAccount', '@loadImage']);

        cy.get('#name').clear();
        cy.contains('button', 'Save').click();
        cy.contains('Name is required').should('be.visible');

        cy.get('#name').type('John Doe');
        cy.get('#address').clear();
        cy.contains('Address is required').should('be.visible');



        cy.intercept('GET', `**/api/Account?AccountId=${ACCOUNT_ID}`, {
            statusCode: 200,
            body: { ...accountData, accountDob: null }
        }).as('getNoDob');
        cy.visit(EDIT_URL);
        cy.wait('@getNoDob');
        cy.contains('button', 'Save').click();
        cy.contains('Birthday is required').should('be.visible');
    });

    it('uploads a new image and shows preview', () => {
        cy.wait(['@getAccount', '@loadImage']);

        cy.get('#imageUpload').attachFile('images/test-pet.jpg');

        cy.get('img[alt="Profile Preview"]')
            .should('be.visible')
            .and(($img) => {
                expect($img.attr('src')).to.match(/^(blob:|data:)/);
            });
    });


    it('submits the form successfully', () => {
        cy.wait(['@getAccount', '@loadImage']);
        cy.get('#address').clear().type('456 New Ave');
        cy.get('.text-red-500').should('not.exist');
        cy.contains('button', 'Save').click({ force: true });
        cy.wait('@putAccount').then(({ request }) => {
            const body = request.body;
            expect(body).to.contain('AccountTempDTO.AccountAddress');
            expect(body).to.contain('456 New Ave');
        });
    });

    it('navigates back when clicking Back', () => {
        cy.visit('http://localhost:3000/customer/services', {
            onBeforeLoad(win) {
                win.sessionStorage.setItem('token', sessionStorage.getItem('token'));
                win.sessionStorage.setItem('accountId', ACCOUNT_ID);
            }
        });
        cy.visit(EDIT_URL);
        cy.wait(['@getAccount', '@loadImage']);

        cy.contains('button', 'Cancel').click();
        cy.url().should('include', '/customer/services');
    });
});
