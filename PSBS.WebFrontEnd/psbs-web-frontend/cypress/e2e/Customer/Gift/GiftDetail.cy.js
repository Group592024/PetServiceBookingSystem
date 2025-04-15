describe('Customer Gift Detail', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();

        cy.intercept('POST', '**/api/Account/Login').as('loginRequest');

        cy.visit('http://localhost:3000/login');
        cy.get('#email', { timeout: 10000 }).should('be.visible');
        cy.get('#email').type('tranthibich@gmail.com');
        cy.get('#password').type('bich2024');
        cy.get('button[type="submit"]').click();

        cy.wait('@loginRequest', { timeout: 15000 }).then((interception) => {
            expect(interception.response.body).to.have.property('data');
            const token = interception.response.body.data;
            expect(token).to.be.a('string');
            cy.window().then((win) => {
                win.sessionStorage.setItem('token', token);
                win.sessionStorage.setItem('accountId', 'customer-123');
            });
        });

        cy.url().should('not.include', '/login', { timeout: 10000 });

        cy.window().then((win) => {
            const token = win.sessionStorage.getItem('token');
            expect(token).to.not.be.null;
            expect(token).to.not.be.undefined;
        });

        cy.intercept('GET', 'http://localhost:5050/Gifts/detail/*', {
            statusCode: 200,
            body: {
                flag: true,
                data: {
                    giftId: '1',
                    giftName: 'Premium Pet Food',
                    giftDescription: 'High-quality premium pet food for your beloved pet.',
                    giftPoint: 500,
                    giftImage: '/images/gifts/pet-food.jpg',
                    isDelete: false
                }
            }
        }).as('getGiftDetail');

        cy.intercept('GET', '**/api/token/validate', {
            statusCode: 200,
            body: {
                valid: true
            }
        }).as('tokenValidate');

        cy.intercept('**/unauthorized*', (req) => {
            req.reply(200, 'Intercepted unauthorized redirect');
            cy.log('Intercepted redirect to /unauthorized');
        }).as('unauthorizedRedirect');

        cy.visit('http://localhost:3000/customer/gifts/detail/1', {
            onBeforeLoad: (win) => {
                if (!win.sessionStorage.getItem('token')) {
                    win.sessionStorage.setItem('token', 'dummy-test-token');
                    win.sessionStorage.setItem('accountId', 'customer-123');
                    win.sessionStorage.setItem('user', JSON.stringify({
                        id: 'customer-123',
                        name: 'Customer User',
                        role: 'user'
                    }));
                }
            },
            timeout: 30000
        });

        cy.wait('@getGiftDetail', { timeout: 10000 });
    });

    it('should display gift details correctly', () => {
        cy.contains('Premium Pet Food').should('be.visible');
        cy.contains('High-quality premium pet food for your beloved pet.').should('be.visible');
        cy.contains('500').should('be.visible');
        cy.contains('points').should('be.visible');
        cy.get('img[alt="Premium Pet Food"]').should('be.visible');
        cy.contains('button', 'Redeem Gift').should('be.visible');
        cy.contains('button', 'Back to List').should('be.visible');
    });

    it('should navigate back to gift list when clicking Back to List button', () => {
        cy.contains('button', 'Back to List').click();
        cy.url().should('include', '3000');
    });

    it('should show confirmation dialog when clicking Redeem Gift button', () => {
        cy.contains('button', 'Redeem Gift').click();
        cy.contains('Confirm Redemption').should('be.visible');
        cy.contains('Are you sure you want to use 500 points to redeem this gift?').should('be.visible');
        cy.contains('button', 'Yes, Redeem').should('be.visible');
        cy.contains('button', 'Cancel').should('be.visible');
    });

    it('should cancel redemption when clicking Cancel button', () => {
        cy.contains('button', 'Redeem Gift').click();
        cy.contains('button', 'Cancel').click();
        cy.contains('Confirm Redemption').should('not.exist');
    });

    it('should successfully redeem gift when having enough points', () => {
        cy.intercept('POST', '**/api/Account/redeem-points/*', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Gift redeemed successfully! Your points have been deducted.'
            }
        }).as('redeemGift');

        cy.contains('button', 'Redeem Gift').click();
        cy.contains('button', 'Yes, Redeem').click();

        cy.wait('@redeemGift', { timeout: 10000 });

        cy.contains('Success').should('be.visible');
        cy.contains('Gift redeemed successfully! Your points have been deducted.').should('be.visible');
        cy.contains('button', 'OK').click();

        cy.url().should('include', '/customer/gifts');
    });

    it('should show error when not having enough points', () => {
        cy.intercept('POST', '**/api/Account/redeem-points/*', {
            statusCode: 200,
            body: {
                flag: false,
                message: 'You do not have enough points to redeem this gift.'
            }
        }).as('redeemGiftFailed');

        cy.contains('button', 'Redeem Gift').click();
        cy.contains('button', 'Yes, Redeem').click();

        cy.wait('@redeemGiftFailed', { timeout: 10000 });

        cy.contains('Points Check Failed').should('be.visible');
        cy.contains('You do not have enough points to redeem this gift.').should('be.visible');
    });

    it('should handle server error during redemption', () => {
        cy.intercept('POST', '**/api/Account/redeem-points/*', {
            statusCode: 500,
            body: {
                title: 'Server Error',
                message: 'An unexpected error occurred while processing your request.'
            }
        }).as('redeemGiftError');

        cy.contains('button', 'Redeem Gift').click();
        cy.contains('button', 'Yes, Redeem').click();

        cy.wait('@redeemGiftError', { timeout: 10000 });

        cy.contains('Server Error').should('be.visible');
        cy.contains('An unexpected error occurred while processing your request.').should('be.visible');
    });

    it('should handle API error when fetching gift details', () => {
        cy.intercept('GET', 'http://localhost:5050/Gifts/detail/*', {
            statusCode: 400,
            body: {
                flag: false,
                message: 'Failed to fetch gift details.'
            }
        }).as('getGiftDetailError');

        cy.reload();
        cy.wait('@getGiftDetailError');

        cy.contains('Error').should('be.visible');
        cy.contains('An error occurred while fetching gift details.').should('be.visible');
    });

    it('should have responsive design for gift detail page', () => {
        cy.viewport('iphone-x');
        cy.contains('Premium Pet Food').should('be.visible');
        cy.get('.flex.flex-col.md\\:flex-row').should('exist');

        cy.viewport('ipad-2');
        cy.contains('Premium Pet Food').should('be.visible');

        cy.viewport(1280, 800);
        cy.contains('Premium Pet Food').should('be.visible');
    });
});
