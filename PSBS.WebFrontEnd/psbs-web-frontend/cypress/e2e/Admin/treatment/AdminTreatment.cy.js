describe('Treatment List Page', () => {
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
            });
        });

        cy.url().should('not.include', '/login', { timeout: 10000 });

        cy.window().then((win) => {
            const token = win.sessionStorage.getItem('token');
            expect(token).to.not.be.null;
            expect(token).to.not.be.undefined;
        });

        cy.intercept('GET', '**/api/Treatment', {
            statusCode: 200,
            body: {
                flag: true,
                message: "Treatments retrieved successfully",
                data: [
                    {
                        treatmentId: "1",
                        treatmentName: "Vaccination",
                        isDeleted: false
                    },
                    {
                        treatmentId: "2",
                        treatmentName: "Surgery",
                        isDeleted: true
                    },
                    {
                        treatmentId: "3",
                        treatmentName: "Dental Cleaning",
                        isDeleted: false
                    }
                ]
            }
        }).as('getTreatments');

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

        cy.visit('http://localhost:3000/settings/treatments', {
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
        cy.contains('Treatment List').should('be.visible');

        cy.viewport('ipad-2');
        cy.contains('Treatment List').should('be.visible');

        cy.viewport(1280, 800);
        cy.contains('Treatment List').should('be.visible');
    });

    it('should display the treatment list correctly', () => {
        cy.wait('@getTreatments');

        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

        cy.contains('.datatableTitle', 'Treatment List').should('be.visible');
        cy.contains('button', 'NEW').should('be.visible');

        cy.get('.MuiDataGrid-row', { timeout: 10000 }).should('have.length.greaterThan', 0);

        cy.get('.MuiDataGrid-cell[data-field="treatmentName"]').should(($cells) => {
            const texts = $cells.map((_, cell) => Cypress.$(cell).text()).get();
            expect(texts).to.include('Vaccination');
            expect(texts).to.include('Surgery');
            expect(texts).to.include('Dental Cleaning');
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

    it('should open the add treatment modal when clicking NEW button', () => {
        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

        cy.contains('button', 'NEW').click();
        cy.contains('Treatment').should('be.visible');
        cy.get('input[name="treatmentName"]').should('be.visible');
        cy.contains('button', 'Submit').should('be.visible');
        cy.contains('button', 'Close').should('be.visible');
    });

    it('should validate form fields when adding a new treatment', () => {
        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

        cy.contains('button', 'NEW').click();
        cy.contains('button', 'Submit').click();

        cy.contains('Treatment Name is required').should('be.visible');
    });

    it('should successfully add a new treatment', () => {
        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

        cy.intercept('POST', '**/api/Treatment', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Treatment added successfully',
                data: {
                    treatmentId: '4',
                    treatmentName: 'Physical Therapy',
                    isDeleted: false
                }
            }
        }).as('addTreatment');

        cy.contains('button', 'NEW').click();
        cy.get('input[name="treatmentName"]').type('Physical Therapy');
        cy.contains('button', 'Submit').click();

        cy.wait('@addTreatment');
        cy.contains('Success!').should('be.visible');
        cy.contains('Treatment added successfully').should('be.visible');
    });

    it('should show error when adding a treatment with a duplicate name', () => {
        cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

        cy.intercept('POST', '**/api/Treatment', {
            statusCode: 400,
            body: {
                flag: false,
                message: 'Treatment name already exists'
            }
        }).as('addDuplicateTreatment');

        cy.contains('button', 'NEW').click();
        cy.get('input[name="treatmentName"]').type('Physical Therapy');
        cy.contains('button', 'Submit').click();

        cy.wait('@addDuplicateTreatment');

        cy.contains('Error!').should('be.visible');
        cy.contains('Treatment name already exists').should('be.visible');
    });

    it('should open the info modal when clicking info button', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.wait(500);

        cy.get('.MuiDataGrid-row').first().find('button').eq(0).scrollIntoView().should('be.visible').click({ force: true });

        cy.contains('Treatment').should('be.visible');
        cy.get('input[name="treatmentName"]').should('have.attr', 'readonly');
        cy.contains('button', 'Submit').should('not.exist');
        cy.contains('button', 'Close').should('be.visible');
    });

    it('should open the edit modal when clicking edit button', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.get('.MuiDataGrid-row').first().find('button').eq(1).click({ force: true });

        cy.contains('Treatment').should('be.visible');
        cy.get('input[name="treatmentName"]').should('not.have.attr', 'readonly');
        cy.contains('button', 'Submit').should('be.visible');
        cy.contains('button', 'Close').should('be.visible');
    });

    it('should successfully update a treatment', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('PUT', '**/api/Treatment', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Treatment updated successfully',
                data: {
                    treatmentId: '1',
                    treatmentName: 'Updated Vaccination',
                    isDeleted: false
                }
            }
        }).as('updateTreatment');

        cy.get('.MuiDataGrid-row').first().find('button').eq(1).click({ force: true });

        cy.get('input[name="treatmentName"]').clear().type('Updated Vaccination');
        cy.contains('button', 'Submit').click();

        cy.contains('Update').should('be.visible');
        cy.contains('button', 'Update').click();

        cy.wait('@updateTreatment');
        cy.contains('Success!').should('be.visible');
        cy.contains('Treatment updated successfully').should('be.visible');
    });

    it('should show error when updating a treatment with a duplicate name', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('PUT', '**/api/Treatment', {
            statusCode: 400,
            body: {
                flag: false,
                message: 'Treatment name already exists'
            }
        }).as('updateDuplicateTreatment');

        cy.get('.MuiDataGrid-row').first().find('button').eq(1).click({ force: true });

        cy.get('input[name="treatmentName"]').clear().type('Physical Therapy');
        cy.contains('button', 'Submit').click();

        cy.contains('Update').should('be.visible');
        cy.contains('button', 'Update').click();

        cy.wait('@updateDuplicateTreatment');

        cy.contains('Error!').should('be.visible');
        cy.contains('Treatment name already exists').should('be.visible');
    });

    it('should toggle treatment status when updating', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('PUT', '**/api/Treatment', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Treatment status updated successfully',
                data: {
                    treatmentId: '1',
                    treatmentName: 'Vaccination',
                    isDeleted: true
                }
            }
        }).as('updateTreatmentStatus');

        cy.get('.MuiDataGrid-row').first().find('button').eq(1).click({ force: true });
        cy.get('#mui-component-select-isDeleted').click();
        cy.get('ul[role="listbox"] li').contains('Inactive').click();

        cy.contains('button', 'Submit').click();

        cy.contains('Are you sure?').should('be.visible');
        cy.contains('button', 'Update').click();

        cy.wait('@updateTreatmentStatus');
        cy.contains('Success!').should('be.visible');
    });

    it('should handle form validation when editing a treatment', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.get('.MuiDataGrid-row').first().find('button').eq(1).click({ force: true });

        cy.get('input[name="treatmentName"]').clear();
        cy.contains('button', 'Submit').click();

        cy.contains('Name is required').should('be.visible');
    });

    it('should show confirmation dialog when clicking delete button for soft-deleted a treatment', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('DELETE', '**/api/Treatment/*', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Treatment has been deleted.',
                data: {
                    treatmentId: '1',
                    treatmentName: 'Vaccination',
                    isDeleted: true
                }
            }
        }).as('deleteTreatment');

        cy.get('.MuiDataGrid-row').first().find('button').eq(2).click({ force: true });

        cy.contains('Are you sure?').should('be.visible');
        cy.contains('Do you want to delete this item?').should('be.visible');

        cy.contains('button', 'Yes, delete it!').click();

        cy.wait('@deleteTreatment', { timeout: 10000 });

        cy.contains('Deleted!').should('be.visible');
        cy.contains('Item has been deleted successfully.').should('be.visible');
    });

    it('should show confirmation dialog when clicking delete button for hard-deleted a treatment', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('DELETE', '**/api/Treatment/*', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Treatment has been deleted.',
            }
        }).as('deleteTreatment');

        cy.get('.MuiDataGrid-row').eq(1).find('button').eq(2).click({ force: true });

        cy.contains('Are you sure?').should('be.visible');
        cy.contains('Do you want to delete this item?').should('be.visible');

        cy.contains('button', 'Yes, delete it!').click();

        cy.wait('@deleteTreatment', { timeout: 10000 });

        cy.contains('Deleted!').should('be.visible');
        cy.contains('Item has been deleted successfully.').should('be.visible');
        cy.get('.MuiDataGrid-root').should('not.contain', 'Surgery');
    });

    it('should handle delete error correctly', () => {
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('right', { ensureScrollable: false });

        cy.intercept('DELETE', '**/api/Treatment/*', {
            statusCode: 400,
            body: {
                flag: false,
                message: 'Cannot delete this treatment because it is associated with existing medicines.'
            }
        }).as('deleteTreatmentError');

        cy.get('.MuiDataGrid-row').first().find('button').eq(2).click({ force: true });

        cy.contains('button', 'Yes, delete it!').click();

        cy.wait('@deleteTreatmentError', { timeout: 10000 });

        cy.contains('Cannot delete this treatment because it is associated with existing medicines.').should('be.visible');
    });
});
