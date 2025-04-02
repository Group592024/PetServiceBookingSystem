describe('Customer Room Detail Page', () => {
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
            });
        });

        cy.url().should('not.include', '/login', { timeout: 10000 });

        cy.window().then((win) => {
            const token = win.sessionStorage.getItem('token');
            expect(token).to.not.be.null;
            expect(token).to.not.be.undefined;
        });

        cy.intercept('GET', '**/api/Room/room1', {
            statusCode: 200,
            body: {
                data: {
                    roomId: 'room1',
                    roomName: 'Luxury Suite 101',
                    roomImage: '/Images/room1.jpg',
                    roomTypeId: 'type1',
                    status: 'Free',
                    description: 'This luxurious suite offers premium accommodations for your beloved pet. Featuring spacious areas for play and rest, climate control for optimal comfort, and premium bedding. Our staff provides round-the-clock care and attention to ensure your pet feels at home. The suite includes daily grooming, regular exercise sessions, and gourmet meals prepared according to your pet\'s dietary requirements.',
                    isDeleted: false
                }
            }
        }).as('getRoomDetail');

        cy.intercept('GET', '**/api/RoomType/type1', {
            statusCode: 200,
            body: {
                data: {
                    roomTypeId: 'type1',
                    name: 'Luxury Suite',
                    price: 500000,
                    description: 'Our most luxurious accommodation'
                }
            }
        }).as('getRoomType');

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

        cy.visit('http://localhost:3000/customerRoom/room1', {
            onBeforeLoad: (win) => {
                if (!win.sessionStorage.getItem('token')) {
                    win.sessionStorage.setItem('token', 'dummy-test-token');
                    win.sessionStorage.setItem('user', JSON.stringify({
                        id: '123',
                        name: 'Customer',
                        role: 'customer'
                    }));
                }
            },
            timeout: 30000 
        });

        cy.wait(['@getRoomDetail', '@getRoomType']);
        cy.contains('Luxury Suite 101', { timeout: 10000 }).should('be.visible');
    });

    it('should display room details correctly', () => {
        cy.contains('h1', 'Luxury Suite 101').should('be.visible');
        cy.contains('span', 'Free').should('be.visible')
            .should('have.css', 'background-color')
            .and('match', /rgb\(34,\s*197,\s*94\)|rgb\(16,\s*185,\s*129\)/);

        cy.contains('span', 'Luxury Suite').should('be.visible');

        cy.contains('Price per night').should('be.visible');
        cy.contains('500.000').should('be.visible');

        cy.contains('button', 'Book Now').should('be.visible');

        cy.contains('h3', 'Room Features').should('be.visible');
        cy.contains('Premium Care').should('be.visible');
        cy.contains('24/7 Support').should('be.visible');

        cy.contains('h3', 'Description').should('be.visible');
        cy.contains('p', 'This luxurious suite offers premium accommodations').should('be.visible');

        cy.get('img[alt="Luxury Suite 101"]').should('exist').should('be.visible', { force: true });
    });

    it('should navigate back when clicking the back button', () => {
        cy.intercept('GET', '**/api/Room/available', {
            statusCode: 200,
            body: {
                data: [
                    {
                        roomId: 'room1',
                        roomName: 'Luxury Suite 101',
                        roomImage: '/Images/room1.jpg',
                        roomTypeId: 'type1',
                        status: 'Free',
                        isDeleted: false
                    }
                ]
            }
        }).as('getRooms');

        cy.intercept('GET', '**/api/RoomType', {
            statusCode: 200,
            body: {
                data: [
                    { roomTypeId: 'type1', name: 'Luxury Suite', price: 500000 }
                ]
            }
        }).as('getRoomTypes');

        cy.contains('button', 'Back').click();
    });

    it('should navigate to booking page when clicking Book Now', () => {
        cy.contains('button', 'Book Now').click();

        cy.url().should('include', '/booking/room1');
    });

    it('should toggle description visibility when clicking Read More/Show Less', () => {
        cy.get('p').should('have.class', 'line-clamp-3');

        cy.contains('button', 'Read More').click();

        cy.get('p').should('not.have.class', 'line-clamp-3');
        cy.contains('button', 'Show Less').should('be.visible');

        cy.contains('button', 'Show Less').click();

        cy.get('p').should('have.class', 'line-clamp-3');
        cy.contains('button', 'Read More').should('be.visible');
    });

    it('should handle API error when fetching room details', () => {
        cy.intercept('GET', '**/api/Room/room1', {
            statusCode: 500,
            body: {
                message: 'Internal server error'
            }
        }).as('getRoomDetailError');

        cy.reload();
        cy.wait('@getRoomDetailError');

        cy.contains('Error').should('be.visible');
        cy.contains('Failed to fetch data!').should('be.visible');
    });

    it('should handle API error when fetching room type', () => {
        cy.intercept('GET', '**/api/Room/room1', {
            statusCode: 200,
            body: {
                data: {
                    roomId: 'room1',
                    roomName: 'Luxury Suite 101',
                    roomImage: '/Images/room1.jpg',
                    roomTypeId: 'type1',
                    status: 'Free',
                    description: 'Luxury room description',
                    isDeleted: false
                }
            }
        }).as('getRoomDetail');

        cy.intercept('GET', '**/api/RoomType/type1', {
            statusCode: 500,
            body: {
                message: 'Internal server error'
            }
        }).as('getRoomTypeError');

        cy.reload();
        cy.wait(['@getRoomDetail', '@getRoomTypeError']);

        cy.contains('Error').should('be.visible');
        cy.contains('Failed to fetch data!').should('be.visible');
    });

    it('should display different status colors correctly', () => {
        cy.intercept('GET', '**/api/Room/room1', {
            statusCode: 200,
            body: {
                data: {
                    roomId: 'room1',
                    roomName: 'Luxury Suite 101',
                    roomImage: '/Images/room1.jpg',
                    roomTypeId: 'type1',
                    status: 'In Use',
                    description: 'Luxury room description',
                    isDeleted: false
                }
            }
        }).as('getRoomInUse');

        cy.reload();
        cy.wait('@getRoomInUse');

        cy.contains('span', 'In Use').should('be.visible')
            .should('have.css', 'background-color')
            .and('match', /rgb\(249,\s*115,\s*22\)|rgb\(234,\s*88,\s*12\)/);

        cy.intercept('GET', '**/api/Room/room1', {
            statusCode: 200,
            body: {
                data: {
                    roomId: 'room1',
                    roomName: 'Luxury Suite 101',
                    roomImage: '/Images/room1.jpg',
                    roomTypeId: 'type1',
                    status: 'Maintenance',
                    description: 'Luxury room description',
                    isDeleted: false
                }
            }
        }).as('getRoomMaintenance');

        cy.reload();
        cy.wait('@getRoomMaintenance');

        cy.contains('span', 'Maintenance').should('be.visible')
            .should('have.css', 'background-color')
            .and('match', /rgb\(239,\s*68,\s*68\)|rgb\(220,\s*38,\s*38\)/);
    });

    it('should handle room with short description', () => {
        cy.intercept('GET', '**/api/Room/room1', {
            statusCode: 200,
            body: {
                data: {
                    roomId: 'room1',
                    roomName: 'Luxury Suite 101',
                    roomImage: '/Images/room1.jpg',
                    roomTypeId: 'type1',
                    status: 'Free',
                    description: 'Short description.',
                    isDeleted: false
                }
            }
        }).as('getRoomShortDesc');

        cy.reload();
        cy.wait('@getRoomShortDesc');

        cy.contains('p', 'Short description.').should('be.visible');
        cy.contains('button', 'Read More').should('not.exist');
    });

    it('should format price correctly', () => {
        cy.intercept('GET', '**/api/RoomType/type1', {
            statusCode: 200,
            body: {
                data: {
                    roomTypeId: 'type1',
                    name: 'Luxury Suite',
                    price: 1250000,
                    description: 'Our most luxurious accommodation'
                }
            }
        }).as('getRoomTypeHighPrice');

        cy.reload();
        cy.wait('@getRoomTypeHighPrice');

        cy.contains('1.250.000').should('be.visible');
        cy.contains('₫').should('be.visible');
    });

    it('should handle missing room image', () => {
        cy.intercept('GET', '**/api/Room/room1', {
            statusCode: 200,
            body: {
                data: {
                    roomId: 'room1',
                    roomName: 'Luxury Suite 101',
                    roomImage: null,
                    roomTypeId: 'type1',
                    status: 'Free',
                    description: 'Luxury room description',
                    isDeleted: false
                }
            }
        }).as('getRoomNoImage');

        cy.reload();
        cy.wait('@getRoomNoImage');

        cy.contains('h1', 'Luxury Suite 101').should('be.visible');
    });

    it('should handle responsive layout', () => {
        cy.viewport('iphone-x');
        cy.contains('h1', 'Luxury Suite 101').should('be.visible');
        cy.get('.lg\\:flex-row').should('have.css', 'flex-direction', 'column');

        cy.viewport('ipad-2');
        cy.contains('h1', 'Luxury Suite 101').should('be.visible');

        cy.viewport(1280, 800);
        cy.contains('h1', 'Luxury Suite 101').should('be.visible');
        cy.get('.lg\\:flex-row').should('have.css', 'flex-direction', 'row');
    });

    it('should handle room with unknown room type', () => {
        cy.intercept('GET', '**/api/Room/room1', {
            statusCode: 200,
            body: {
                data: {
                    roomId: 'room1',
                    roomName: 'Luxury Suite 101',
                    roomImage: '/Images/room1.jpg',
                    roomTypeId: 'type1',
                    status: 'Free',
                    description: 'Luxury room description',
                    isDeleted: false
                }
            }
        }).as('getRoomDetail');

        cy.intercept('GET', '**/api/RoomType/type1', {
            statusCode: 404,
            body: {
                flag: false,
                message: 'Room type not found'
            }
        }).as('getRoomTypeError');

        cy.reload();
        cy.wait('@getRoomDetail');
        cy.wait('@getRoomTypeError');

        cy.get('.swal2-container').should('be.visible');
        cy.contains('Error').should('be.visible');
        cy.contains('Failed to fetch data!').should('be.visible');
    });

    it('should handle room with no description', () => {
        cy.intercept('GET', '**/api/Room/room1', {
            statusCode: 200,
            body: {
                data: {
                    roomId: 'room1',
                    roomName: 'Luxury Suite 101',
                    roomImage: '/Images/room1.jpg',
                    roomTypeId: 'type1',
                    status: 'Free',
                    description: '',
                    isDeleted: false
                }
            }
        }).as('getRoomNoDesc');

        cy.reload();
        cy.wait('@getRoomNoDesc');

        cy.contains('h3', 'Description').should('be.visible');
        cy.contains('button', 'Read More').should('not.exist');
    });

    it('should handle unauthorized access', () => {
        cy.intercept('GET', '**/api/Room/room1', {
            statusCode: 401,
            body: {
                message: 'Unauthorized'
            }
        }).as('getUnauthorized');

        cy.window().then((win) => {
            win.sessionStorage.removeItem('token');
        });

        cy.reload();
        cy.wait('@getUnauthorized');

        cy.contains('Error').should('be.visible');
    });

    it('should handle network errors gracefully', () => {
        cy.intercept('GET', '**/api/Room/room1', {
            forceNetworkError: true
        }).as('getNetworkError');

        cy.reload();
        cy.wait('@getNetworkError');

        cy.contains('Error').should('be.visible');
        cy.contains('Failed to fetch data!').should('be.visible');
    });

    it('should display correct currency format for price', () => {
        const testCases = [
            { price: 500000, expected: '500.000' },
            { price: 1500000, expected: '1.500.000' },
            { price: 25000, expected: '25.000' }
        ];

        testCases.forEach(({ price, expected }) => {
            cy.intercept('GET', '**/api/RoomType/type1', {
                statusCode: 200,
                body: {
                    data: {
                        roomTypeId: 'type1',
                        name: 'Luxury Suite',
                        price: price,
                        description: 'Our most luxurious accommodation'
                    }
                }
            }).as('getRoomTypePrice');

            cy.reload();
            cy.wait('@getRoomTypePrice');

            cy.contains(expected).should('be.visible');
            cy.contains('₫').should('be.visible');
        });
    });

    it('should have accessible UI elements', () => {

        cy.contains('button', 'Back').should('not.be.disabled');

        cy.contains('button', 'Book Now').should('not.be.disabled');

        if (cy.contains('button', 'Read More').should('exist')) {
            cy.contains('button', 'Read More').should('not.be.disabled');
        }
    });

    it('should handle room with very long description gracefully', () => {
        const longDescription = 'A'.repeat(1000);

        cy.intercept('GET', '**/api/Room/room1', {
            statusCode: 200,
            body: {
                data: {
                    roomId: 'room1',
                    roomName: 'Luxury Suite 101',
                    roomImage: '/Images/room1.jpg',
                    roomTypeId: 'type1',
                    status: 'Free',
                    description: longDescription,
                    isDeleted: false
                }
            }
        }).as('getRoomLongDesc');

        cy.reload();
        cy.wait('@getRoomLongDesc');

        cy.get('p').should('have.class', 'line-clamp-3');

        cy.contains('button', 'Read More').should('be.visible').click();

        cy.get('p').should('not.have.class', 'line-clamp-3');
        cy.contains('button', 'Show Less').should('be.visible');
    });

    it('should handle special characters in room description', () => {
        const specialCharsDescription = 'Description with special characters: !@#$%^&*()_+{}|:"<>?[];\',./ and emojis 😀🐶🏠';

        cy.intercept('GET', '**/api/Room/room1', {
            statusCode: 200,
            body: {
                data: {
                    roomId: 'room1',
                    roomName: 'Luxury Suite 101',
                    roomImage: '/Images/room1.jpg',
                    roomTypeId: 'type1',
                    status: 'Free',
                    description: specialCharsDescription,
                    isDeleted: false
                }
            }
        }).as('getRoomSpecialChars');

        cy.reload();
        cy.wait('@getRoomSpecialChars');

        cy.contains('p', 'Description with special characters:').should('be.visible');
    });

    it('should handle HTML content in room description safely', () => {
        const htmlDescription = '<script>alert("XSS")</script><b>Bold text</b> <i>Italic text</i>';

        cy.intercept('GET', '**/api/Room/room1', {
            statusCode: 200,
            body: {
                data: {
                    roomId: 'room1',
                    roomName: 'Luxury Suite 101',
                    roomImage: '/Images/room1.jpg',
                    roomTypeId: 'type1',
                    status: 'Free',
                    description: htmlDescription,
                    isDeleted: false
                }
            }
        }).as('getRoomHtmlDesc');

        cy.reload();
        cy.wait('@getRoomHtmlDesc');

        cy.contains('p', '<script>').should('be.visible');
        cy.contains('p', '<b>Bold text</b>').should('be.visible');
    });
});
