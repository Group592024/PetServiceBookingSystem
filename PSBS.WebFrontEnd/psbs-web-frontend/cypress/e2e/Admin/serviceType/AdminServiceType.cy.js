describe('Service Type List Page', () => {
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

        cy.intercept('GET', '**/api/ServiceType', {
            statusCode: 200,
            body: {
                flag: true,
                message: "Service types retrieved successfully",
                data: [
                    {
                        serviceTypeId: "1",
                        typeName: "Grooming",
                        description: "Pet grooming services",
                        isDeleted: false,
                        createAt: "2023-05-15T10:30:00Z",
                        updateAt: "2023-05-15T10:30:00Z"
                    },
                    {
                        serviceTypeId: "2",
                        typeName: "Veterinary",
                        description: "Medical services for pets",
                        isDeleted: true,
                        createAt: "2023-05-10T09:15:00Z",
                        updateAt: "2023-05-12T14:20:00Z"
                    }
                ]
            }
        }).as('getServiceTypes');

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

        cy.visit('http://localhost:3000/settings/servicetypes', {
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
        cy.contains('Service Types').should('be.visible');

        cy.viewport('ipad-2');
        cy.contains('Service Types').should('be.visible');

        cy.viewport(1280, 800);
        cy.contains('Service Types').should('be.visible');
    });

    it('should display the service type list correctly', () => {
        cy.wait('@getServiceTypes');

        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

        cy.contains('.datatableTitle', 'Service Types').should('be.visible');
        cy.contains('button', 'NEW').should('be.visible');

        cy.get('.MuiDataGrid-row', { timeout: 10000 }).should('have.length.greaterThan', 0);

        cy.get('.MuiDataGrid-cell[data-field="typeName"]').should(($cells) => {
            const texts = $cells.map((_, cell) => Cypress.$(cell).text()).get();
            expect(texts).to.include('Grooming');
            expect(texts).to.include('Veterinary');
        });

        cy.get('.MuiDataGrid-cell[data-field="isDeleted"]').each(($el) => {
            const text = $el.text().trim();
            cy.wrap($el).should('have.css', 'color').then((color) => {
                if (text === 'Active') {
                    expect(color).to.match(/rgba?\(0,\s*(\d{1,3}),\s*0(,\s*(\d+.\d+))?\)/);
                }
            });
        });

        cy.get('.MuiDataGrid-cell[data-field="createAt"]').should('exist');
        cy.get('.MuiDataGrid-cell[data-field="updateAt"]').should('exist');
    });

    it('should open the add service type modal when clicking NEW button', () => {
        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

        cy.contains('button', 'NEW').click();
        cy.contains('Service Types').should('be.visible');
        cy.get('input[name="typeName"]').should('be.visible');
        cy.get('input[name="description"]').should('be.visible');
        cy.contains('button', 'Submit').should('be.visible');
        cy.contains('button', 'Close').should('be.visible');
    });

    it('should validate form fields when adding a new service type', () => {
        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

        cy.contains('button', 'NEW').click();
        cy.contains('button', 'Submit').click();

        cy.contains('Service Type Name is required').should('be.visible');
        cy.contains('Description is required').should('be.visible');

        cy.get('input[name="typeName"]').type('Test Service');
        cy.contains('button', 'Submit').click();
        cy.contains('Description is required').should('be.visible');
    });

    it('should successfully add a new service type', () => {
        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

        cy.intercept('POST', '**/api/ServiceType', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Service type added successfully',
                data: {
                    serviceTypeId: 'type3',
                    typeName: 'Training',
                    description: 'Pet training services',
                    isDeleted: false,
                    createAt: new Date().toISOString(),
                    updateAt: new Date().toISOString()
                }
            }
        }).as('addServiceType');

        cy.contains('button', 'NEW').click();
        cy.get('input[name="typeName"]').type('Training');
        cy.get('input[name="description"]').type('Pet training services');
        cy.contains('button', 'Submit').click();

        cy.wait('@addServiceType');
        cy.contains('Success!').should('be.visible');
        cy.contains('Service type added successfully').should('be.visible');
        cy.contains('Training').should('be.visible');
    });

    it('should show error when adding a duplicate service type', () => {
        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

        cy.intercept('POST', '**/api/ServiceType', {
            statusCode: 400,
            body: {
                flag: false,
                message: 'Service type name already exists'
            }
        }).as('addDuplicateServiceType');

        cy.contains('button', 'NEW').click();
        cy.get('input[name="typeName"]').type('Training');
        cy.get('input[name="description"]').type('Duplicate service type');
        cy.contains('button', 'Submit').click();

        cy.wait('@addDuplicateServiceType');

        cy.contains('Error!').should('be.visible');
        cy.contains('Service type name already exists').should('be.visible');
    });

    it('should open the info modal when clicking info button', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.wait(500);

        cy.get('.MuiDataGrid-row').first().find('button').eq(0).scrollIntoView().should('be.visible').click({ force: true });

        cy.contains('Service Types').should('be.visible');
        cy.get('input[name="typeName"]').should('have.attr', 'readonly');
        cy.get('input[name="description"]').should('have.attr', 'readonly');
        cy.contains('button', 'Submit').should('not.exist');
        cy.contains('button', 'Close').should('be.visible');
    });

    it('should open the edit modal when clicking edit button', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.get('.MuiDataGrid-row').first().find('button').eq(1).click({ force: true });

        cy.contains('Service Types').should('be.visible');
        cy.get('input[name="typeName"]').should('not.have.attr', 'readonly');
        cy.get('input[name="description"]').should('not.have.attr', 'readonly');
        cy.contains('button', 'Submit').should('be.visible');
        cy.contains('button', 'Close').should('be.visible');
    });

    it('should successfully update a service type', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('PUT', '**/api/ServiceType', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Service type updated successfully',
                data: {
                    serviceTypeId: '1',
                    typeName: 'Updated Grooming',
                    description: 'Updated description',
                    isDeleted: false,
                    createAt: "2023-05-15T10:30:00Z",
                    updateAt: new Date().toISOString()
                }
            }
        }).as('updateServiceType');

        cy.get('.MuiDataGrid-row').first().find('button').eq(1).click({ force: true });

        cy.get('input[name="typeName"]').clear().type('Updated Grooming');
        cy.get('input[name="description"]').clear().type('Updated description');
        cy.contains('button', 'Submit').click();

        cy.contains('Confirm Changes').should('be.visible');
        cy.contains('button', 'Save Changes').click();

        cy.wait('@updateServiceType');
        cy.contains('Success!').should('be.visible');
        cy.contains('Service type updated successfully').should('be.visible');
    });

    it('should successfully update the status of a service type', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('PUT', '**/api/ServiceType', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Service type status updated successfully',
                data: {
                    serviceTypeId: 'service1',
                    name: 'Room Cleaning',
                    description: 'Daily room cleaning service',
                    price: 20.00,
                    isDeleted: true
                }
            }
        }).as('updateServiceTypeStatus');

        cy.get('.MuiDataGrid-row').first().find('button').eq(1).click({ force: true });
        cy.get('#mui-component-select-isDeleted').click();
        cy.get('ul[role="listbox"] li').contains('Inactive').click();

        cy.contains('button', 'Submit').click();

        cy.contains('Confirm Changes').should('be.visible');
        cy.contains('button', 'Save Changes').click();

        cy.wait('@updateServiceTypeStatus');

        cy.contains('Success!').should('be.visible');
        cy.contains('Service type status updated successfully').should('be.visible');
    });

    it('should show error when updating a service type with a duplicate name', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('PUT', '**/api/ServiceType', {
            statusCode: 400,
            body: {
                flag: false,
                message: 'Service type name already exists'
            }
        }).as('updateDuplicateServiceType');

        cy.get('.MuiDataGrid-row').first().find('button').eq(1).click({ force: true });

        cy.get('input[name="typeName"]').clear().type('Training');
        cy.get('input[name="description"]').clear().type('Trying to update to a duplicate name');
        cy.contains('button', 'Submit').click();

        cy.contains('Confirm Changes').should('be.visible');
        cy.contains('button', 'Save Changes').click();

        cy.wait('@updateDuplicateServiceType');

        cy.contains('Error!').should('be.visible');
        cy.contains('Service type name already exists').should('be.visible');
    });

    it('should handle form validation when editing a service type', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.get('.MuiDataGrid-row').first().find('button').eq(1).click({ force: true });

        cy.get('input[name="typeName"]').clear();
        cy.get('input[name="description"]').clear();
        cy.contains('button', 'Submit').click();

        cy.contains('Service Type Name is required').should('be.visible');
        cy.contains('Description is required').should('be.visible');
    });

    it('should show confirmation dialog when clicking delete button for soft-deleted a service type', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('DELETE', '**/api/ServiceType/*', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Service type has been deleted.',
                data: {
                    serviceTypeId: '1',
                    typeName: 'Grooming',
                    description: 'Pet grooming services',
                    isDeleted: true,
                    createAt: "2023-05-15T10:30:00Z",
                    updateAt: new Date().toISOString()
                }
            }
        }).as('deleteServiceType');

        cy.get('.MuiDataGrid-row').first().find('button').eq(2).click({ force: true });

        cy.contains('Are you sure?').should('be.visible');
        cy.contains('Do you want to delete this item?').should('be.visible');

        cy.contains('button', 'Yes, delete it!').click();

        cy.wait('@deleteServiceType', { timeout: 10000 });

        cy.contains('Success!').should('be.visible');
        cy.contains('Item has been deleted successfully.').should('be.visible');
    });

    it('should show confirmation dialog when clicking delete button for hard-deleted service type', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('DELETE', '**/api/ServiceType/*', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Service type has been deleted.',
            }
        }).as('deleteServiceType');

        cy.get('.MuiDataGrid-row').eq(1).find('button').eq(2).click({ force: true });

        cy.contains('Are you sure?').should('be.visible');
        cy.contains('Do you want to delete this item?').should('be.visible');

        cy.contains('button', 'Yes, delete it!').click();

        cy.wait('@deleteServiceType', { timeout: 10000 });

        cy.contains('Success!').should('be.visible');
        cy.contains('Item has been deleted successfully.').should('be.visible');
        cy.get('.MuiDataGrid-root').should('not.contain', 'Veterinary');
    });

    it('should handle delete error correctly', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('DELETE', '**/api/ServiceType/*', {
            statusCode: 400,
            body: {
                flag: false,
                message: 'Cannot delete this service type because it is associated with existing services.'
            }
        }).as('deleteServiceTypeError');

        cy.get('.MuiDataGrid-row').first().find('button').eq(2).click({ force: true });

        cy.contains('button', 'Yes, delete it!').click();

        cy.wait('@deleteServiceTypeError', { timeout: 10000 });

        cy.contains('Error!').should('be.visible');
    });
});
