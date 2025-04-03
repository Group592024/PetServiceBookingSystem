describe('Room Type List Page', () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();

        cy.intercept('POST', '**/api/Account/Login').as('loginRequest');

        cy.visit('http://localhost:3000/login');
        cy.get('#email', { timeout: 10000 }).should('be.visible');
        cy.get('#email').type('admin@gmail.com');
        cy.get('#password').type('08046428');
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

        cy.intercept('GET', '**/api/RoomType', {
            statusCode: 200,
            body: {
                flag: true,
                message: "Room types retrieved successfully",
                data: [
                    { roomTypeId: "1", name: "Standard", price: 50, description: "Basic room", isDeleted: false },
                    { roomTypeId: "2", name: "Deluxe", price: 100, description: "Premium room", isDeleted: true }
                ]
            }
        }).as('getRoomTypes');

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
        cy.visit('http://localhost:3000/settings/roomtypes', {
            onBeforeLoad: (win) => {
                if (!win.sessionStorage.getItem('token')) {
                    win.sessionStorage.setItem('token', 'dummy-test-token');
                    win.sessionStorage.setItem('user', JSON.stringify({
                        id: '123',
                        name: 'Admin',
                        role: 'admin'
                    }));
                }
            },
            timeout: 30000
        });

        cy.get('.MuiDataGrid-root', { timeout: 20000 }).should('exist');
    });

    it('should have responsive design', () => {
        cy.viewport('iphone-x');
        cy.contains('Room Types').should('be.visible');

        cy.viewport('ipad-2');
        cy.contains('Room Types').should('be.visible');

        cy.viewport(1280, 800);
        cy.contains('Room Types').should('be.visible');
    });

    it('should display the room type list correctly', () => {
        cy.wait('@getRoomTypes');

        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

        cy.contains('.datatableTitle', 'Room Types').should('be.visible');
        cy.contains('button', 'NEW').should('be.visible');

        cy.get('.MuiDataGrid-row', { timeout: 10000 }).should('have.length.greaterThan', 0);

        cy.get('.MuiDataGrid-cell[data-field="name"]').should(($cells) => {
            const texts = $cells.map((_, cell) => Cypress.$(cell).text()).get();
            expect(texts).to.include('Standard');
            expect(texts).to.include('Deluxe');
        });

        cy.get('.MuiDataGrid-cell[data-field="price"]').should(($cells) => {
            const texts = $cells.map((_, cell) => Cypress.$(cell).text()).get();
            expect(texts).to.include('50');
            expect(texts).to.include('100');
        });

        cy.get('.MuiDataGrid-cell[data-field="description"]').should(($cells) => {
            const texts = $cells.map((_, cell) => Cypress.$(cell).text()).get();
            expect(texts).to.include('Basic room');
            expect(texts).to.include('Premium room');
        });

        cy.get('.MuiDataGrid-cell[data-field="isDeleted"]').each(($el) => {
            const text = $el.text().trim();
            cy.wrap($el).should('have.css', 'color').then((color) => {
                if (text === 'Active') {
                    expect(color).to.match(/rgba?\(0,\s*(\d{1,3}),\s*0(,\s*(\d+.\d+))?\)/);
                }
            });
        });
    });

    it('should open the add room type modal when clicking NEW button', () => {
        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

        cy.contains('button', 'NEW').click();
        cy.contains('Room Types').should('be.visible');
        cy.get('input[name="name"]').should('be.visible');
        cy.get('input[name="price"]').should('be.visible');
        cy.get('input[name="description"]').should('be.visible');
        cy.contains('button', 'Submit').should('be.visible');
        cy.contains('button', 'Close').should('be.visible');
    });

    it('should validate form fields when adding a new room type', () => {
        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

        cy.contains('button', 'NEW').click();
        cy.contains('button', 'Submit').click();

        cy.contains('Room type name is required').should('be.visible');
        cy.contains('Price must be a valid number').should('be.visible');

        cy.get('input[name="name"]').type('Test Room');
        cy.get('input[name="price"]').type('-50');
        cy.contains('button', 'Submit').click();
        cy.contains('Price must be a valid number').should('be.visible');
    });

    it('should successfully add a new room type', () => {
        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

        cy.intercept('POST', '**/api/RoomType', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Room type added successfully',
                data: {
                    roomTypeId: 'type3',
                    name: 'Premium Suite',
                    description: 'Luxury suite with all amenities',
                    price: 150.00,
                    isDeleted: false
                }
            }
        }).as('addRoomType');

        cy.contains('button', 'NEW').click();
        cy.get('input[name="name"]').type('Premium Suite');
        cy.get('input[name="price"]').type('150');
        cy.get('input[name="description"]').type('Luxury suite with all amenities');
        cy.contains('button', 'Submit').click();

        cy.wait('@addRoomType');
        cy.contains('Success!').should('be.visible');
        cy.contains('Room type added successfully').should('be.visible');
        cy.contains('Premium Suite').should('be.visible');
    });

    it('should show error when adding a duplicate room type', () => {
        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

        cy.intercept('POST', '**/api/RoomType', {
            statusCode: 400,
            body: {
                flag: false,
                message: 'Room type name already exists'
            }
        }).as('addDuplicateRoomType');

        cy.contains('button', 'NEW').click();
        cy.get('input[name="name"]').type('Premium Suite');
        cy.get('input[name="price"]').type('200');
        cy.get('input[name="description"]').type('Another luxury suite');
        cy.contains('button', 'Submit').click();

        cy.wait('@addDuplicateRoomType');

        cy.contains('Error!').should('be.visible');
        cy.contains('Room type name already exists').should('be.visible');
    });

    it('should open the info modal when clicking info button', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.wait(500);

        cy.get('.MuiDataGrid-row').first().find('button').eq(0).scrollIntoView().should('be.visible').click({ force: true });

        cy.contains('Room Types').should('be.visible');
        cy.get('input[name="name"]').should('have.attr', 'readonly');
        cy.get('input[name="price"]').should('have.attr', 'readonly');
        cy.get('input[name="description"]').should('have.attr', 'readonly');
        cy.contains('button', 'Submit').should('not.exist');
        cy.contains('button', 'Close').should('be.visible');
    });

    it('should open the edit modal when clicking edit button', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.get('.MuiDataGrid-row').first().find('button').eq(1).click({ force: true });

        cy.contains('Room Types').should('be.visible');
        cy.get('input[name="name"]').should('not.have.attr', 'readonly');
        cy.get('input[name="price"]').should('not.have.attr', 'readonly');
        cy.get('input[name="description"]').should('not.have.attr', 'readonly');
        cy.contains('button', 'Submit').should('be.visible');
        cy.contains('button', 'Close').should('be.visible');
    });

    it('should successfully update a room type', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('PUT', '**/api/RoomType', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Room type updated successfully',
                data: {
                    roomTypeId: 'type1',
                    name: 'Updated Standard Room',
                    description: 'Updated description',
                    price: 60.00,
                    isDeleted: false
                }
            }
        }).as('updateRoomType');

        cy.get('.MuiDataGrid-row').first().find('button').eq(1).click({ force: true });

        cy.get('input[name="name"]').clear().type('Updated Standard Room');
        cy.get('input[name="price"]').clear().type('60');
        cy.get('input[name="description"]').clear().type('Updated description');
        cy.contains('button', 'Submit').click();

        cy.contains('Are you sure?').should('be.visible');
        cy.contains('button', 'Update').click();

        cy.wait('@updateRoomType');
        cy.contains('Success!').should('be.visible');
        cy.contains('Room type updated successfully').should('be.visible');
    });

    it('should successfully update the status of a room type', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('PUT', '**/api/RoomType', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Room type status updated successfully',
                data: {
                    roomTypeId: 'type1',
                    name: 'Standard Room',
                    description: 'Standard room description',
                    price: 50.00,
                    isDeleted: true
                }
            }
        }).as('updateRoomTypeStatus');

        cy.get('.MuiDataGrid-row').first().find('button').eq(1).click({ force: true });
        cy.get('#mui-component-select-isDeleted').click();
        cy.get('ul[role="listbox"] li').contains('Inactive').click();

        cy.contains('button', 'Submit').click();

        cy.contains('Are you sure?').should('be.visible');
        cy.contains('button', 'Update').click();

        cy.wait('@updateRoomTypeStatus');

        cy.contains('Success!').should('be.visible');
        cy.contains('Room type status updated successfully').should('be.visible');
    });

    it('should show error when updating a room type to a duplicate name', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('PUT', '**/api/RoomType', {
            statusCode: 400,
            body: {
                flag: false,
                message: 'Room type name already exists'
            }
        }).as('updateDuplicateRoomType');

        cy.get('.MuiDataGrid-row').first().find('button').eq(1).click({ force: true });

        cy.get('input[name="name"]').clear().type('Premium Suite');
        cy.get('input[name="price"]').clear().type('80');
        cy.get('input[name="description"]').clear().type('Updated but duplicate name');
        cy.contains('button', 'Submit').click();

        cy.contains('Are you sure?').should('be.visible');
        cy.contains('button', 'Update').click();

        cy.wait('@updateDuplicateRoomType');

        cy.contains('Error!').should('be.visible');
        cy.contains('Room type name already exists').should('be.visible');
    });

    it('should handle form validation when editing a room type', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.get('.MuiDataGrid-row').first().find('button').eq(1).click({ force: true });

        cy.get('input[name="name"]').clear();
        cy.get('input[name="price"]').clear().type('-10');
        cy.contains('button', 'Submit').click();

        cy.contains('Room type name is required').should('be.visible');
        cy.contains('Price must be a valid number').should('be.visible');
    });

    it('should show confirmation dialog when clicking delete button for soft-deleted a room type', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('DELETE', '**/api/RoomType/*', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Room type has been deleted.',
                data: {
                    roomTypeId: 'type1',
                    name: 'Standard Room',
                    description: 'Basic room with standard amenities',
                    price: 50.00,
                    isDeleted: true
                }
            }
        }).as('deleteRoomType');

        cy.get('.MuiDataGrid-row').first().find('button').eq(2).click({ force: true });

        cy.contains('Are you sure?').should('be.visible');
        cy.contains('Do you want to delete this item?').should('be.visible');

        cy.contains('button', 'Yes, delete it!').click();

        cy.wait('@deleteRoomType', { timeout: 10000 });

        cy.contains('Deleted!').should('be.visible');
        cy.contains('Item has been deleted successfully.').should('be.visible');
    });

    it('should show confirmation dialog when clicking delete button for hard-deleted room type', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('DELETE', '**/api/RoomType/*', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Room type has been deleted.',
            }
        }).as('deleteRoomType');

        cy.get('.MuiDataGrid-row').first().find('button').eq(2).click({ force: true });

        cy.contains('Are you sure?').should('be.visible');
        cy.contains('Do you want to delete this item?').should('be.visible');

        cy.contains('button', 'Yes, delete it!').click();

        cy.wait('@deleteRoomType', { timeout: 10000 });

        cy.contains('Deleted!').should('be.visible');
        cy.contains('Item has been deleted successfully.').should('be.visible');

        cy.get('.MuiDataGrid-root').within(() => {
            cy.contains('Standard Room').should('not.exist');
        });
    });

    it('should handle delete error correctly', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('DELETE', '**/api/RoomType/*', {
            statusCode: 400,
            body: {
                flag: false,
                message: 'Cannot delete this room type because it is associated with existing rooms.'
            }
        }).as('deleteRoomTypeError');

        cy.get('.MuiDataGrid-row').first().find('button').eq(2).click({ force: true });

        cy.contains('button', 'Yes, delete it!').click();

        cy.wait('@deleteRoomTypeError', { timeout: 10000 });

        cy.contains('Error!').should('be.visible');
    });
});
