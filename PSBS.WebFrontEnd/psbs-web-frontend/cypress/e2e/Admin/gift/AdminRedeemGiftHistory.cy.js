describe('Admin Redeem History', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();

        cy.intercept('POST', '**/api/Account/Login').as('loginRequest');

        cy.visit('http://localhost:3000/login');
        cy.get('#email', { timeout: 10000 }).should('be.visible');
        cy.get('#email').type('se.rn.a.vill.ar.es@gmail.com');
        cy.get('#password').type('minh1234');
        cy.get('button[type="submit"]').click();

        cy.wait('@loginRequest', { timeout: 15000 }).then((interception) => {
            expect(interception.response.body).to.have.property('data');
            const token = interception.response.body.data;
            expect(token).to.be.a('string');
            cy.window().then((win) => {
                win.sessionStorage.setItem('token', token);
                win.sessionStorage.setItem('accountId', 'admin-123');
                win.sessionStorage.setItem('role', 'admin');
            });
        });

        cy.url().should('not.include', '/login', { timeout: 10000 });

        cy.intercept('GET', 'http://localhost:5050/redeemhistory/All', {
            statusCode: 200,
            body: {
                flag: true,
                data: [
                    {
                        redeemHistoryId: '1',
                        giftId: '101',
                        accountId: 'user-1',
                        redeemPoint: 500,
                        redeemDate: '2023-07-15T10:30:00',
                        redeemStatusId: '1509e4e6-e1ec-42a4-9301-05131dd498e4',
                        redeemStatusName: 'Redeemed'
                    },
                    {
                        redeemHistoryId: '2',
                        giftId: '102',
                        accountId: 'user-2',
                        redeemPoint: 750,
                        redeemDate: '2023-07-10T14:45:00',
                        redeemStatusId: '33b84495-c2a6-4b3e-98ca-f13d9c150946',
                        redeemStatusName: 'Picked up'
                    },
                    {
                        redeemHistoryId: '3',
                        giftId: '103',
                        accountId: 'user-3',
                        redeemPoint: 300,
                        redeemDate: '2023-07-05T09:15:00',
                        redeemStatusId: '6a565faf-d31e-4ec7-ad20-433f34e3d7a9',
                        redeemStatusName: 'Cancelled'
                    }
                ]
            }
        }).as('getRedeemHistory');

        cy.intercept('GET', 'http://localhost:5050/redeemhistory/statuses', {
            statusCode: 200,
            body: {
                flag: true,
                data: [
                    {
                        reddeemStautsId: '1509e4e6-e1ec-42a4-9301-05131dd498e4',
                        redeemName: 'Redeemed'
                    },
                    {
                        reddeemStautsId: '33b84495-c2a6-4b3e-98ca-f13d9c150946',
                        redeemName: 'Picked up'
                    },
                    {
                        reddeemStautsId: '6a565faf-d31e-4ec7-ad20-433f34e3d7a9',
                        redeemName: 'Cancelled'
                    }
                ]
            }
        }).as('getRedeemStatuses');

        cy.intercept('GET', 'http://localhost:5050/api/Account?AccountId=user-1', {
            statusCode: 200,
            body: {
                accountId: 'user-1',
                accountName: 'John Doe',
                email: 'john@example.com'
            }
        }).as('getAccount1');

        cy.intercept('GET', 'http://localhost:5050/api/Account?AccountId=user-2', {
            statusCode: 200,
            body: {
                accountId: 'user-2',
                accountName: 'Jane Smith',
                email: 'jane@example.com'
            }
        }).as('getAccount2');

        cy.intercept('GET', 'http://localhost:5050/api/Account?AccountId=user-3', {
            statusCode: 200,
            body: {
                accountId: 'user-3',
                accountName: 'Bob Johnson',
                email: 'bob@example.com'
            }
        }).as('getAccount3');

        cy.intercept('GET', 'http://localhost:5050/Gifts/101', {
            statusCode: 200,
            body: {
                flag: true,
                data: {
                    giftId: '101',
                    giftName: 'Premium Pet Food',
                    giftPoint: 500
                }
            }
        }).as('getGift1');

        cy.intercept('GET', 'http://localhost:5050/Gifts/102', {
            statusCode: 200,
            body: {
                flag: true,
                data: {
                    giftId: '102',
                    giftName: 'Pet Grooming Service',
                    giftPoint: 750
                }
            }
        }).as('getGift2');

        cy.intercept('GET', 'http://localhost:5050/Gifts/103', {
            statusCode: 200,
            body: {
                flag: true,
                data: {
                    giftId: '103',
                    giftName: 'Pet Toy Bundle',
                    giftPoint: 300
                }
            }
        }).as('getGift3');

        cy.intercept('GET', '**/api/token/validate', {
            statusCode: 200,
            body: {
                valid: true
            }
        }).as('tokenValidate');

        cy.visit('http://localhost:3000/redeemHistory', {
            onBeforeLoad: (win) => {
                if (!win.sessionStorage.getItem('token')) {
                    win.sessionStorage.setItem('token', 'dummy-admin-token');
                    win.sessionStorage.setItem('accountId', 'admin-123');
                    win.sessionStorage.setItem('role', 'admin');
                }
            },
            timeout: 30000
        });

        cy.wait(['@getRedeemHistory', '@getRedeemStatuses'], { timeout: 15000 });
    });

    it('should display the DataGrid with correct columns', () => {
        cy.get('.MuiDataGrid-columnHeaders').should('be.visible');
        cy.contains('No.').should('be.visible');
        cy.contains('Customer Name').should('be.visible');
        cy.contains('Gift Name').should('be.visible');
        cy.contains('Points Used').should('be.visible');
        cy.contains('Redeem Date').should('be.visible');
        cy.contains('Status').should('be.visible');
        cy.contains('Actions').should('be.visible');
    });

    it('should display redemption history data correctly', () => {
        cy.contains('John Doe').should('be.visible');
        cy.contains('Jane Smith').should('be.visible');
        cy.contains('Bob Johnson').should('be.visible');

        // Check gift names
        cy.contains('Premium Pet Food').should('be.visible');
        cy.contains('Pet Grooming Service').should('be.visible');
        cy.contains('Pet Toy Bundle').should('be.visible');

        // Check points
        cy.contains('500').should('be.visible');
        cy.contains('750').should('be.visible');
        cy.contains('300').should('be.visible');

        // Check dates
        cy.contains('15/07/2023').should('be.visible');
        cy.contains('10/07/2023').should('be.visible');
        cy.contains('05/07/2023').should('be.visible');

        // Check statuses
        cy.contains('Redeemed').should('be.visible');
        cy.contains('Picked up').should('be.visible');
        cy.contains('Cancelled').should('be.visible');
    });

    it('should open status update modal when clicking edit button', () => {
        cy.get('[aria-label="edit"]').first().click();

        cy.contains('Update Redeem Status').should('be.visible');
        cy.get('#status-select').should('be.visible');
    });

    it('should display all status options in the dropdown', () => {
        cy.get('[aria-label="edit"]').first().click();

        cy.get('#status-select').click();

        cy.contains('Redeemed').should('be.visible');
        cy.contains('Picked up').should('be.visible');
        cy.contains('Cancelled').should('be.visible');
    });

    it('should close modal when clicking cancel button', () => {
        cy.get('[aria-label="edit"]').first().click();

        cy.contains('button', 'Cancel').click();

        cy.contains('Update Redeem Status').should('not.exist');
    });

    it('should update status successfully', () => {
        cy.intercept('PUT', 'http://localhost:5050/redeemhistory/*/status/*', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Status updated successfully'
            }
        }).as('updateStatus');

        cy.get('[aria-label="edit"]').first().click();

        cy.get('#status-select').click();
        cy.contains('Picked up').click({ force: true });

        cy.contains('button', 'Update').click({ force: true });

        cy.wait('@updateStatus', { timeout: 10000 });

        cy.contains('Success').should('be.visible');
        cy.contains('Status updated successfully').should('be.visible');

        cy.contains('Update Redeem Status').should('not.exist');
    });

    it('should handle update status error', () => {
        cy.intercept('PUT', 'http://localhost:5050/redeemhistory/*/status/*', {
            statusCode: 400,
            body: {
                flag: false,
                message: 'Failed to update status'
            }
        }).as('updateStatusError');

        cy.get('[aria-label="edit"]').first().click();

        cy.get('#status-select').click();
        cy.contains('Picked up').click({ force: true });

        cy.contains('button', 'Update').click({ force: true });

        // Wait for update API call
        cy.wait('@updateStatusError', { timeout: 10000 });

        // Check error message
        cy.contains('Error').should('be.visible');
        cy.contains('Failed to update status').should('be.visible');
    });

    it('should handle API error when fetching redemption history', () => {
        cy.intercept('GET', 'http://localhost:5050/redeemhistory/All', {
            statusCode: 500,
            body: {
                flag: false,
                message: 'Internal server error'
            }
        }).as('getRedeemHistoryError');

        cy.reload();

        cy.wait('@getRedeemHistoryError', { timeout: 10000 });

        cy.contains('Error').should('be.visible');
        cy.contains('Failed to load redemption history').should('be.visible');
    });

    it('should handle API error when fetching redeem statuses', () => {
        cy.intercept('GET', 'http://localhost:5050/redeemhistory/statuses', {
            statusCode: 500,
            body: {
                flag: false,
                message: 'Internal server error'
            }
        }).as('getRedeemStatusesError');

        cy.reload();

        cy.wait('@getRedeemStatusesError', { timeout: 10000 });

        cy.get('[aria-label="edit"]').first().click();

        cy.get('#status-select').click();
        cy.get('.MuiMenuItem-root').should('not.exist');
    });

    it('should handle API error when fetching account details', () => {
        cy.intercept('GET', 'http://localhost:5050/api/Account?AccountId=user-1', {
            statusCode: 404,
            body: {
                flag: false,
                message: 'Account not found'
            }
        }).as('getAccountError');

        cy.reload();

        cy.wait('@getRedeemHistory', { timeout: 10000 });

        cy.contains('Unable to load').should('be.visible');
    });

    it('should handle API error when fetching gift details', () => {
        cy.intercept('GET', 'http://localhost:5050/Gifts/101', {
            statusCode: 404,
            body: {
                flag: false,
                message: 'Gift not found'
            }
        }).as('getGiftError');

        cy.reload();

        cy.wait('@getRedeemHistory', { timeout: 10000 });

        cy.contains('Unable to load').should('be.visible');
    });

    it('should format dates correctly', () => {
        cy.contains('15/07/2023').should('be.visible');
        cy.contains('10/07/2023').should('be.visible');
        cy.contains('05/07/2023').should('be.visible');
    });

    it('should handle empty redemption history', () => {
        cy.intercept('GET', 'http://localhost:5050/redeemhistory/All', {
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

    it('should handle large datasets efficiently', () => {
        const largeDataset = Array.from({ length: 50 }, (_, i) => ({
            redeemHistoryId: `${i + 1}`,
            giftId: '101',
            accountId: 'user-1',
            redeemPoint: 500,
            redeemDate: '2023-07-15T10:30:00',
            redeemStatusId: '1509e4e6-e1ec-42a4-9301-05131dd498e4',
            redeemStatusName: 'Redeemed'
        }));

        cy.intercept('GET', 'http://localhost:5050/redeemhistory/All', {
            statusCode: 200,
            body: {
                flag: true,
                data: largeDataset
            }
        }).as('getLargeRedeemHistory');

        cy.intercept('GET', 'http://localhost:5050/api/Account?AccountId=user-1', {
            statusCode: 200,
            body: {
                accountId: 'user-1',
                accountName: 'John Doe',
                email: 'john@example.com'
            }
        }).as('getAccount1');

        cy.intercept('GET', 'http://localhost:5050/Gifts/101', {
            statusCode: 200,
            body: {
                flag: true,
                data: {
                    giftId: '101',
                    giftName: 'Premium Pet Food',
                    giftPoint: 500
                }
            }
        }).as('getGift1');
    });

    it('should validate modal form before submission', () => {
        cy.get('[aria-label="edit"]').first().click();

        cy.contains('button', 'Update').click({ force: true });

        // cy.get('.swal2-container').should('not.exist');
        cy.contains('Failed to update status').should('be.visible');
    });

    it('should handle network errors gracefully when updating status', () => {
        cy.intercept('PUT', 'http://localhost:5050/redeemhistory/*/status/*', {
            forceNetworkError: true
        }).as('networkError');

        cy.get('[aria-label="edit"]').first().click();

        cy.get('#status-select').click();
        cy.contains('Picked up').click({ force: true });

        cy.contains('button', 'Update').click({ force: true });

        cy.wait('@networkError', { timeout: 10000 });

        cy.contains('Error').should('be.visible');
        cy.contains('Failed to update status').should('be.visible');
    });

    it('should refresh data after successful status update', () => {
        cy.intercept('PUT', 'http://localhost:5050/redeemhistory/*/status/*', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Status updated successfully'
            }
        }).as('updateStatus');

        const updatedHistory = [
            {
                redeemHistoryId: '1',
                giftId: '101',
                accountId: 'user-1',
                redeemPoint: 500,
                redeemDate: '2023-07-15T10:30:00',
                redeemStatusId: '33b84495-c2a6-4b3e-98ca-f13d9c150946',
                redeemStatusName: 'Picked up'
            },
            {
                redeemHistoryId: '2',
                giftId: '102',
                accountId: 'user-2',
                redeemPoint: 750,
                redeemDate: '2023-07-10T14:45:00',
                redeemStatusId: '33b84495-c2a6-4b3e-98ca-f13d9c150946',
                redeemStatusName: 'Picked up'
            },
            {
                redeemHistoryId: '3',
                giftId: '103',
                accountId: 'user-3',
                redeemPoint: 300,
                redeemDate: '2023-07-05T09:15:00',
                redeemStatusId: '6a565faf-d31e-4ec7-ad20-433f34e3d7a9',
                redeemStatusName: 'Cancelled'
            }
        ];

        cy.intercept('GET', 'http://localhost:5050/redeemhistory/All', {
            statusCode: 200,
            body: {
                flag: true,
                data: updatedHistory
            }
        }).as('getUpdatedRedeemHistory');

        cy.get('[aria-label="edit"]').first().click();

        cy.get('#status-select').click();
        cy.contains('Picked up').click({ force: true });

        cy.contains('button', 'Update').click({ force: true });

        cy.wait('@updateStatus', { timeout: 10000 });
        cy.wait('@getUpdatedRedeemHistory', { timeout: 10000 });

        cy.get('.MuiDataGrid-row')
            .first()
            .contains('Picked up')
            .should('be.visible');
    });

    it('should have responsive design', () => {
        cy.viewport('iphone-x');
        cy.contains('Gift Redemption History').should('be.visible');

        cy.viewport('ipad-2');
        cy.contains('Gift Redemption History').should('be.visible');

        cy.viewport(1280, 800);
        cy.contains('Gift Redemption History').should('be.visible');
    });
});
