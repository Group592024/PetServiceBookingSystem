describe('Customer Redeem History', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();

        cy.intercept('POST', '**/api/Account/Login').as('loginRequest');

        cy.visit('http://localhost:3000/login');
        cy.get('#email', { timeout: 10000 }).should('be.visible');
        cy.get('#email').type('abc@gmail.com');
        cy.get('#password').type('123456789');
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

        cy.intercept('GET', 'http://localhost:5050/redeemhistory/*', {
            statusCode: 200,
            body: {
                flag: true,
                data: [
                    {
                        redeemHistoryId: '1',
                        giftId: '101',
                        accountId: 'customer-123',
                        redeemPoint: 500,
                        redeemDate: '2023-07-15T10:30:00',
                        redeemStatusId: '1509e4e6-e1ec-42a4-9301-05131dd498e4' // Redeemed
                    },
                    {
                        redeemHistoryId: '2',
                        giftId: '102',
                        accountId: 'customer-123',
                        redeemPoint: 750,
                        redeemDate: '2023-07-10T14:45:00',
                        redeemStatusId: '33b84495-c2a6-4b3e-98ca-f13d9c150946' // Picked up
                    },
                    {
                        redeemHistoryId: '3',
                        giftId: '103',
                        accountId: 'customer-123',
                        redeemPoint: 300,
                        redeemDate: '2023-07-05T09:15:00',
                        redeemStatusId: '6a565faf-d31e-4ec7-ad20-433f34e3d7a9' // Cancelled
                    }
                ]
            }
        }).as('getRedeemHistory');

        cy.intercept('GET', 'http://localhost:5050/Gifts/detail/101', {
            statusCode: 200,
            body: {
                flag: true,
                data: {
                    giftId: '101',
                    giftName: 'Premium Pet Food',
                    giftCode: 'FOOD123',
                    giftPoint: 500,
                    giftImage: '/images/gifts/pet-food.jpg',
                    isDelete: false
                }
            }
        }).as('getGiftDetail101');

        cy.intercept('GET', 'http://localhost:5050/Gifts/detail/102', {
            statusCode: 200,
            body: {
                flag: true,
                data: {
                    giftId: '102',
                    giftName: 'Pet Grooming Service',
                    giftCode: 'GROOM456',
                    giftPoint: 750,
                    giftImage: '/images/gifts/grooming.jpg',
                    isDelete: false
                }
            }
        }).as('getGiftDetail102');

        cy.intercept('GET', 'http://localhost:5050/Gifts/detail/103', {
            statusCode: 200,
            body: {
                flag: true,
                data: {
                    giftId: '103',
                    giftName: 'Pet Toy Bundle',
                    giftCode: 'TOY789',
                    giftPoint: 300,
                    giftImage: '/images/gifts/toys.jpg',
                    isDelete: false
                }
            }
        }).as('getGiftDetail103');

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

        cy.visit('http://localhost:3000/customer/redeemHistory', {
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

        cy.wait(['@getRedeemHistory', '@getGiftDetail101', '@getGiftDetail102', '@getGiftDetail103'], { timeout: 15000 });
    });

    it('should display the DataGrid with correct columns', () => {
        cy.get('.MuiDataGrid-columnHeaders').should('be.visible');
        cy.contains('No.').should('be.visible');
        cy.contains('Gift Name').should('be.visible');
        cy.contains('Gift Code').should('be.visible');
        cy.contains('Gift Point').should('be.visible');
        cy.contains('Redeem Date').should('be.visible');
        cy.contains('Status').should('be.visible');
        cy.contains('Actions').should('be.visible');
    });

    it('should display redemption history data correctly', () => {
        cy.contains('Premium Pet Food').should('be.visible');
        cy.contains('FOOD123').should('be.visible');
        cy.contains('500').should('be.visible');
        cy.contains('15/07/2023').should('be.visible');
        cy.contains('Redeemed').should('be.visible');

        cy.contains('Pet Grooming Service').should('be.visible');
        cy.contains('GROOM456').should('be.visible');
        cy.contains('750').should('be.visible');
        cy.contains('10/07/2023').should('be.visible');
        cy.contains('Picked up').should('be.visible');

        cy.contains('Pet Toy Bundle').should('be.visible');
        cy.contains('TOY789').should('be.visible');
        cy.contains('300').should('be.visible');
        cy.contains('05/07/2023').should('be.visible');
        cy.contains('Cancelled').should('be.visible');
    });

    it('should only show cancel button for redeemed items', () => {
        cy.get('.MuiDataGrid-row')
            .first()
            .find('[data-testid="CancelIcon"]')
            .should('exist');

        cy.get('.MuiDataGrid-row')
            .eq(1)
            .contains('No actions')
            .should('be.visible');

        cy.get('.MuiDataGrid-row')
            .eq(2)
            .contains('No actions')
            .should('be.visible');
    });

    it('should show confirmation dialog when clicking cancel button', () => {
        cy.get('.MuiDataGrid-row')
            .first()
            .find('[data-testid="CancelIcon"]')
            .click();

        cy.contains('Are you sure?').should('be.visible');
        cy.contains("You won't be able to revert this!").should('be.visible');
        cy.contains('button', 'Yes, cancel it!').should('be.visible');
        cy.contains('button', 'Cancel').should('be.visible');
    });

    it('should cancel redemption successfully', () => {
        cy.intercept('PUT', '**/api/Account/refundPoint*', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Points refunded successfully'
            }
        }).as('refundPoints');

        cy.intercept('GET', 'http://localhost:5050/redeemhistory/*', {
            statusCode: 200,
            body: {
                flag: true,
                data: [
                    {
                        redeemHistoryId: '1',
                        giftId: '101',
                        accountId: 'customer-123',
                        redeemPoint: 500,
                        redeemDate: '2023-07-15T10:30:00',
                        redeemStatusId: '6a565faf-d31e-4ec7-ad20-433f34e3d7a9' // Now Cancelled
                    },
                    {
                        redeemHistoryId: '2',
                        giftId: '102',
                        accountId: 'customer-123',
                        redeemPoint: 750,
                        redeemDate: '2023-07-10T14:45:00',
                        redeemStatusId: '33b84495-c2a6-4b3e-98ca-f13d9c150946' // Picked up
                    },
                    {
                        redeemHistoryId: '3',
                        giftId: '103',
                        accountId: 'customer-123',
                        redeemPoint: 300,
                        redeemDate: '2023-07-05T09:15:00',
                        redeemStatusId: '6a565faf-d31e-4ec7-ad20-433f34e3d7a9' // Cancelled
                    }
                ]
            }
        }).as('getUpdatedRedeemHistory');

        cy.get('.MuiDataGrid-row')
            .first()
            .find('[data-testid="CancelIcon"]')
            .click();

        cy.contains('button', 'Yes, cancel it!').click();

        cy.wait('@refundPoints', { timeout: 10000 });
        cy.wait('@getUpdatedRedeemHistory', { timeout: 10000 });

        cy.contains('Cancelled!').should('be.visible');
        cy.contains('Your redemption has been cancelled.').should('be.visible');

        cy.get('.MuiDataGrid-row')
            .first()
            .contains('Cancelled')
            .should('be.visible');
    });

    it('should handle cancellation error correctly', () => {
        cy.intercept('PUT', '**/api/Account/refundPoint*', {
            statusCode: 400,
            body: {
                flag: false,
                message: 'Failed to refund points'
            }
        }).as('refundPointsError');

        cy.get('.MuiDataGrid-row')
            .first()
            .find('[data-testid="CancelIcon"]')
            .click();

        cy.contains('button', 'Yes, cancel it!').click();

        cy.wait('@refundPointsError', { timeout: 10000 });

        cy.contains('Error!').should('be.visible');
        cy.contains('Failed to cancel redemption.').should('be.visible');
    });

    it('should handle API error when fetching redemption history', () => {
        cy.intercept('GET', 'http://localhost:5050/redeemhistory/*', {
            statusCode: 400,
            body: {
                flag: false,
                message: 'Failed to fetch redemption history'
            }
        }).as('getRedeemHistoryError');

        cy.reload();

        cy.wait('@getRedeemHistoryError', { timeout: 10000 });

        cy.contains('Oops...').should('be.visible');
        cy.contains('Failed to load redemption history!').should('be.visible');
    });

    it('should have responsive design', () => {
        cy.viewport('iphone-x');
        cy.contains('Your Redemption History').should('be.visible');
        cy.get('.MuiDataGrid-root').should('be.visible');

        cy.viewport('ipad-2');
        cy.contains('Your Redemption History').should('be.visible');
        cy.get('.MuiDataGrid-root').should('be.visible');

        cy.viewport(1280, 800);
        cy.contains('Your Redemption History').should('be.visible');
        cy.get('.MuiDataGrid-root').should('be.visible');
    });

    it('should format dates correctly', () => {
        cy.contains('15/07/2023').should('be.visible');
        cy.contains('10/07/2023').should('be.visible');
        cy.contains('05/07/2023').should('be.visible');
    });

    it('should handle empty redemption history', () => {
        cy.intercept('GET', 'http://localhost:5050/redeemhistory/*', {
            statusCode: 200,
            body: {
                flag: true,
                data: []
            }
        }).as('getEmptyRedeemHistory');

        cy.reload();
        cy.wait('@getEmptyRedeemHistory', { timeout: 10000 });

        cy.get('.MuiDataGrid-overlay').should('be.visible');
        cy.contains('No rows').should('be.visible');
    });

    it('should handle network errors gracefully', () => {
        cy.intercept('GET', 'http://localhost:5050/redeemhistory/*', {
            forceNetworkError: true
        }).as('networkError');

        cy.reload();

        cy.contains('Oops...').should('be.visible');
        cy.contains('Failed to load redemption history!').should('be.visible');
    });

    it('should handle gift detail API errors gracefully', () => {
        cy.intercept('GET', 'http://localhost:5050/redeemhistory/*', {
            statusCode: 200,
            body: {
                flag: true,
                data: [
                    {
                        redeemHistoryId: '1',
                        giftId: '101',
                        accountId: 'customer-123',
                        redeemPoint: 500,
                        redeemDate: '2023-07-15T10:30:00',
                        redeemStatusId: '1509e4e6-e1ec-42a4-9301-05131dd498e4' // Redeemed
                    }
                ]
            }
        }).as('getRedeemHistorySingle');

        cy.intercept('GET', 'http://localhost:5050/Gifts/detail/101', {
            statusCode: 404,
            body: {
                flag: false,
                message: 'Gift not found'
            }
        }).as('getGiftDetailError');

        cy.reload();
        cy.wait(['@getRedeemHistorySingle', '@getGiftDetailError'], { timeout: 10000 });

        cy.contains('Failed to load redemption history!').should('be.visible');
    });

    it('should handle large datasets efficiently', () => {
        const largeDataset = Array.from({ length: 50 }, (_, i) => ({
            redeemHistoryId: `${i + 1}`,
            giftId: '101',
            accountId: 'customer-123',
            redeemPoint: 500,
            redeemDate: '2023-07-15T10:30:00',
            redeemStatusId: '1509e4e6-e1ec-42a4-9301-05131dd498e4'
        }));

        cy.intercept('GET', 'http://localhost:5050/redeemhistory/*', {
            statusCode: 200,
            body: {
                flag: true,
                data: largeDataset
            }
        }).as('getLargeRedeemHistory');

        cy.reload();
        cy.wait('@getLargeRedeemHistory', { timeout: 10000 });

        cy.get('.MuiTablePagination-displayedRows').should('contain', '1–5 of 50');

        cy.get('button[aria-label="Go to next page"]').click();

        cy.get('.MuiTablePagination-displayedRows').should('contain', '6–10 of 50');
    });
});

