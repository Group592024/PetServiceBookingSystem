describe('Customer - Camera Streaming Page', () => {
    const validCameraCode = 'CAM001';
    const invalidCameraCode = 'INVALID_CAM';

    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();

        cy.intercept('POST', '**/api/Account/Login').as('loginRequest');

        cy.visit('http://localhost:3000/login');
        cy.get('#email').type('tuan0@gmail.com');
        cy.get('#password').type('1234567');
        cy.get('button[type="submit"]').click();

        cy.wait('@loginRequest').then((interception) => {
            const token = interception.response.body.data;

            cy.window().then((win) => {
                win.sessionStorage.setItem('token', token);
                win.sessionStorage.setItem('accountId', 'customer-123');
            });

            // Đưa visit vào trong wait để đảm bảo token đã được set
            cy.visit('http://localhost:3000/camera', {
                onBeforeLoad: (win) => {
                    win.sessionStorage.setItem('token', token);
                    win.sessionStorage.setItem('accountId', 'customer-123');
                }
            });
        });


        cy.intercept('GET', '**/api/token/validate', {
            statusCode: 200,
            body: { valid: true },
        }).as('validateToken');

        cy.visit('http://localhost:3000/camera', {
            onBeforeLoad: (win) => {
                win.sessionStorage.setItem('token', 'dummy-test-token');
                win.sessionStorage.setItem('accountId', 'customer-123');
            },
        });

        cy.wait('@validateToken');
    });

    it('should show error if no camera code is entered', () => {
        cy.contains('button', 'Xem').click();
        cy.contains('Please enter the camera code').should('be.visible');
    });

    it('should show stream player when valid camera code is entered', () => {
        cy.intercept('GET', `**/api/Camera/stream/${validCameraCode}*`, {
            statusCode: 200,
            body: {
                streamUrl: 'http://example.com/stream.m3u8',
            },
        }).as('getCameraStream');

        cy.get('input[type="text"]').type(validCameraCode);
        cy.contains('button', 'Xem').click();

        cy.get('.animate-spin').should('exist');
        cy.wait('@getCameraStream');

        cy.get('video').should('exist');
    });

    it('should show error if camera code is invalid', () => {
        cy.intercept('GET', `**/api/Camera/stream/${invalidCameraCode}*`, {
            statusCode: 404,
            body: {
                message: 'Camera not found',
            },
        }).as('getInvalidStream');

        cy.get('input[type="text"]').type(invalidCameraCode);
        cy.contains('button', 'Xem').click();
        cy.wait('@getInvalidStream');

        cy.contains('Camera not found. Please check the camera code.').should('be.visible');
    });

    it('should show deleted camera error', () => {
        cy.intercept('GET', '**/api/Camera/stream/**', {
            statusCode: 400,
            body: { message: 'Camera is deleted' },
        }).as('deletedCamera');

        cy.get('input[type="text"]').type('CAM_DELETED');
        cy.contains('button', 'Xem').click();
        cy.wait('@deletedCamera');

        cy.contains('Camera is deleted. Please contact the administrator.').should('be.visible');
    });

    it('should show address not found error', () => {
        cy.intercept('GET', '**/api/Camera/stream/**', {
            statusCode: 400,
            body: { message: 'Camera address not found' },
        }).as('addressNotFound');

        cy.get('input[type="text"]').type('CAM_UNKNOWN');
        cy.contains('button', 'Xem').click();
        cy.wait('@addressNotFound');

        cy.contains('Camera address not found.').should('be.visible');
    });

    it('should handle unexpected error gracefully', () => {
        cy.intercept('GET', '**/api/Camera/stream/**', {
            statusCode: 500,
            body: 'Internal Server Error',
        }).as('unexpectedError');

        cy.get('input[type="text"]').type('ANY');
        cy.contains('button', 'Xem').click();
        cy.wait('@unexpectedError');

        cy.contains('Internal Server Error').should('be.visible');
    });

    it('should redirect if user is not of role "user"', () => {
        // Simulate a token with "staff" role
        const fakeStaffToken = [
            btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })),
            btoa(JSON.stringify({ id: '1', role: 'staff' })),
            'signature'
        ].join('.');

        cy.visit('http://localhost:3000/camera', {
            onBeforeLoad: (win) => {
                win.sessionStorage.setItem('token', fakeStaffToken);
            },
        });

        cy.url().should('include', '/unauthorized');
    });
});
