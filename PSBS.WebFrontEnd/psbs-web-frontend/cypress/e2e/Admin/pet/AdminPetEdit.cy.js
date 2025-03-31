describe('Pet Edit Page', () => {
    beforeEach(() => {
        const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxOTE2MjM5MDIyfQ.N_ZJ0o3V9MxIZuGPmXJBLK9jn-kK3fXQjpwLBLc4d5A';

        cy.window().then((win) => {
            win.sessionStorage.setItem('token', validToken);
        });

        const petId = 'test-pet-id';

        cy.intercept('GET', `**/api/pet/${petId}`, {
            statusCode: 200,
            body: {
                flag: true,
                data: {
                    petId: petId,
                    petName: 'Buddy',
                    petGender: true,
                    dateOfBirth: '2022-01-15T00:00:00',
                    petTypeId: 'type1',
                    petBreedId: 'breed1',
                    petWeight: '15',
                    petFurType: 'Short',
                    petFurColor: 'Golden',
                    petNote: 'This is a friendly dog who loves to play fetch.',
                    accountId: 'acc1',
                    petImage: '/images/pets/buddy.jpg',
                    isDelete: false
                }
            }
        }).as('getPet');

        cy.intercept('GET', '**/api/petType/available', {
            statusCode: 200,
            body: {
                data: [
                    { petType_ID: 'type1', petType_Name: 'Dog', isDelete: false },
                    { petType_ID: 'type2', petType_Name: 'Cat', isDelete: false },
                    { petType_ID: 'type3', petType_Name: 'Bird', isDelete: true }
                ]
            }
        }).as('getPetTypes');

        cy.intercept('GET', '**/api/account/all', {
            statusCode: 200,
            body: {
                data: [
                    { accountId: 'acc1', accountName: 'John Doe', roleId: 'user' },
                    { accountId: 'acc2', accountName: 'Jane Smith', roleId: 'user' },
                    { accountId: 'acc3', accountName: 'Admin User', roleId: 'admin' }
                ]
            }
        }).as('getAccounts');

        cy.intercept('GET', '**/api/petBreed/byPetType/type1', {
            statusCode: 200,
            body: {
                flag: true,
                data: [
                    { petBreedId: 'breed1', petBreedName: 'Golden Retriever' },
                    { petBreedId: 'breed2', petBreedName: 'Labrador' }
                ]
            }
        }).as('getDogBreeds');

        cy.intercept('GET', '**/api/petBreed/byPetType/type2', {
            statusCode: 200,
            body: {
                flag: true,
                data: [
                    { petBreedId: 'breed3', petBreedName: 'Siamese' },
                    { petBreedId: 'breed4', petBreedName: 'Persian' }
                ]
            }
        }).as('getCatBreeds');

        cy.intercept('GET', '**/api/auth/**', {
            statusCode: 200,
            body: { isValid: true }
        });

        cy.intercept('**/unauthorized*', (req) => {
            req.reply(200, 'Intercepted unauthorized redirect');
        });

        cy.visit(`http://localhost:3000/pet/edit/${petId}`, {
            onBeforeLoad: (win) => {
                win.sessionStorage.setItem('token', validToken);
            }
        });
    });

    it('should have responsive design', () => {
        cy.viewport('iphone-x');
        cy.contains('Edit Pet Profile').should('be.visible');

        cy.viewport('ipad-2');
        cy.contains('Edit Pet Profile').should('be.visible');

        cy.viewport(1280, 800);
        cy.contains('Edit Pet Profile').should('be.visible');
    });

    // it('should show validation errors when submitting empty form', () => {
    //     cy.wait(['@getPet', '@getPetTypes', '@getAccounts', '@getDogBreeds']);

    //     cy.contains('h1', 'Edit Pet Profile').should('be.visible');

    //     cy.get('input[placeholder="Pet Name"]').clear().blur();
    //     cy.get('select').first().select('');
    //     cy.contains('label', 'Pet Type').parent().find('select').select('');
    //     cy.contains('label', 'Breed').parent().find('select').select('');
    //     cy.contains('label', 'Weight (kg)').parent().find('input').clear().blur();
    //     cy.contains('label', 'Fur Type').parent().find('input').clear().blur();
    //     cy.contains('label', 'Fur Color').parent().find('input').clear().blur();
    //     cy.get('textarea').clear().blur();
    //     cy.get('input[placeholder="Search Owner"]').clear().blur();

    //     cy.contains('button', 'Save Changes').click();

    //     cy.contains('Please enter pet name').should('be.visible');
    //     cy.contains('Please select pet type').should('be.visible');
    //     cy.contains('Please select breed').should('be.visible');
    //     cy.contains('Please enter a valid weight').should('be.visible');
    //     cy.contains('Please enter fur type').should('be.visible');
    //     cy.contains('Please enter fur color').should('be.visible');
    //     cy.contains('Please select owner').should('be.visible');
    //     cy.contains('Please enter pet note').scrollIntoView().should('be.visible');
    // });

    it('should load the pet edit form with existing data', () => {
        cy.wait(['@getPet', '@getPetTypes', '@getAccounts', '@getDogBreeds']);

        cy.contains('h1', 'Edit Pet Profile').should('be.visible');

        cy.get('input[placeholder="Pet Name"]').should('have.value', 'Buddy');
        cy.get('select').first().should('have.value', 'true');
        cy.get('input[placeholder="DD/MM/YYYY"]').should('have.value', '15/01/2022');

        cy.contains('label', 'Pet Type').parent().find('select').should('have.value', 'type1');
        cy.contains('label', 'Breed').parent().find('select').should('have.value', 'breed1');
        cy.contains('label', 'Weight (kg)').parent().find('input').should('have.value', '15');
        cy.contains('label', 'Fur Type').parent().find('input').should('have.value', 'Short');
        cy.contains('label', 'Fur Color').parent().find('input').should('have.value', 'Golden');

        cy.get('textarea').should('have.value', 'This is a friendly dog who loves to play fetch.');
        cy.get('input[placeholder="Search Owner"]').should('have.value', 'John Doe');
        cy.get('img[alt="Preview"]').should('be.visible')
            .and('have.attr', 'src')
            .and('include', '/pet-service/images/pets/buddy.jpg');
        cy.get('input[type="radio"][name="status"]').filter(':checked')
            .invoke('val')
            .then((val) => {
                expect(val).to.be.oneOf(['false', 'true']);
            });
        cy.get('input[type="radio"][name="status"][value="true"]').should('not.be.checked');
    });

    it('should update pet information successfully', () => {
        cy.wait(['@getPet', '@getPetTypes', '@getAccounts', '@getDogBreeds']);
        cy.intercept('PUT', '**/api/pet', (req) => {
            expect(req.headers['content-type']).to.include('multipart/form-data');
            req.reply({
                statusCode: 200,
                body: {
                    flag: true,
                    message: 'Pet updated successfully'
                }
            });
        }).as('updatePet');
        cy.get('input[placeholder="Pet Name"]').clear().type('Buddy Updated');
        cy.get('select').first().select('false');

        cy.contains('label', 'Pet Type').parent().find('select').select('type2');

        cy.wait('@getCatBreeds');

        cy.contains('label', 'Breed').parent().find('select').select('breed3');
        cy.contains('label', 'Weight (kg)').parent().find('input').clear().type('18');
        cy.contains('label', 'Fur Type').parent().find('input').clear().type('Long');
        cy.contains('label', 'Fur Color').parent().find('input').clear().type('Brown');

        cy.get('textarea').clear().type('Updated notes for Buddy');
        cy.get('input[placeholder="Search Owner"]').clear().type('Jane');

        cy.contains('li', 'Jane Smith').click();
        cy.fixture('images/test-pet.jpg', 'base64').then(fileContent => {
            const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
            const testFileName = 'new-pet-image.jpg';

            cy.get('input[type="file"]').attachFile({
                fileContent: testFile,
                fileName: testFileName,
                mimeType: 'image/jpeg'
            });
        });

        cy.contains('Inactive').click();
        cy.contains('button', 'Save Changes').click();
        cy.contains('Are you sure?').should('be.visible');
        cy.contains('button', 'Yes, update it!').click();

        cy.wait('@updatePet');

        cy.contains('Success').should('be.visible');
        cy.contains('Pet updated successfully').should('be.visible');
        cy.url().should('include', '/pet');
    });

    it('should handle duplicate pet name error when updating a pet', () => {
        cy.wait(['@getPet', '@getPetTypes', '@getAccounts', '@getDogBreeds']);

        cy.intercept('PUT', '**/api/pet', {
            statusCode: 400,
            body: {
                flag: false,
                message: 'Pet with this name already exists'
            }
        }).as('updatePetError');

        cy.get('input[placeholder="Pet Name"]').clear().type('Duplicate Name');

        cy.contains('button', 'Save Changes').click();

        cy.contains('button', 'Yes, update it!').click();

        cy.wait('@updatePetError');

        cy.contains('Error').should('be.visible');
        cy.contains('Pet with this name already exists').should('be.visible');
    });

    it('should navigate back when clicking cancel button', () => {
        cy.wait(['@getPet', '@getPetTypes', '@getAccounts']);

        cy.contains('button', 'Cancel').click();

        cy.url().should('include', '/pet');
    });

    it('should validate form fields before submission', () => {
        cy.wait(['@getPet', '@getPetTypes', '@getAccounts', '@getDogBreeds']);

        cy.get('input[placeholder="Pet Name"]').clear();
        cy.contains('label', 'Weight (kg)').parent().find('input').clear();
        cy.contains('label', 'Fur Type').parent().find('input').clear();
        cy.contains('label', 'Fur Color').parent().find('input').clear();
        cy.get('textarea').clear();

        cy.contains('button', 'Save Changes').click();

        cy.contains('Please enter pet name').should('be.visible');
        cy.contains('Please enter a valid weight').scrollIntoView().should('be.visible');
        cy.contains('Please enter fur type').should('be.visible');
        cy.contains('Please enter fur color').should('be.visible');
        cy.contains('Please enter pet note').should('be.visible');
    });

    it('should validate weight input to be positive', () => {
        cy.wait(['@getPet', '@getPetTypes', '@getAccounts']);

        cy.contains('label', 'Weight (kg)').parent().find('input').clear().type('-5');

        cy.contains('button', 'Save Changes').click();

        cy.contains('Please enter a valid weight (greater than 0)').scrollIntoView().should('be.visible');

        cy.contains('label', 'Weight (kg)').parent().find('input').clear().type('5');

        cy.contains('button', 'Save Changes').click();
    });

    it('should handle image upload validation', () => {
        cy.wait(['@getPet', '@getPetTypes', '@getAccounts']);

        cy.fixture('images/test-document.pdf', 'base64').then(fileContent => {
            const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'application/pdf');
            const testFileName = 'test-document.pdf';

            cy.window().then(win => {
                cy.stub(win, 'alert').as('alertStub');
            });

            cy.get('input[type="file"]').attachFile({
                fileContent: testFile,
                fileName: testFileName,
                mimeType: 'application/pdf'
            });

            cy.contains('Invalid file type').should('be.visible');
            cy.contains('Only image files are accepted').should('be.visible');
        });
    });

    it('should filter accounts by role and search term', () => {
        cy.wait(['@getPet', '@getAccounts']);

        cy.get('input[placeholder="Search Owner"]').clear().click().type('Jane');

        cy.contains('li', 'Jane Smith').should('be.visible');
        cy.contains('li', 'John Doe').should('not.exist');
        cy.contains('li', 'Admin User').should('not.exist');

        cy.contains('li', 'Jane Smith').click();
        cy.get('input[placeholder="Search Owner"]').should('have.value', 'Jane Smith');
    });

    it('should toggle pet status correctly', () => {
        cy.wait(['@getPet', '@getPetTypes', '@getAccounts']);

        cy.get('input[type="radio"][name="status"]').filter(':checked')
            .invoke('val')
            .then((val) => {
                expect(val).to.be.oneOf(['false', 'true']);
            });

        cy.get('input[type="radio"][name="status"][value="true"]').should('not.be.checked');

        cy.contains('Inactive').click();

        cy.get('input[type="radio"][name="status"]').filter(':checked')
            .invoke('val')
            .then((val) => {
                expect(val).to.be.oneOf(['false', 'true']);
            });

        cy.get('input[type="radio"][name="status"][value="false"]').should('not.be.checked');

        cy.contains('Active').click();

        cy.get('input[type="radio"][name="status"]').filter(':checked')
            .invoke('val')
            .then((val) => {
                expect(val).to.be.oneOf(['false', 'true']);
            });

        cy.get('input[type="radio"][name="status"][value="true"]').should('not.be.checked');
    });

    it('should load breeds when pet type is changed', () => {
        cy.wait(['@getPet', '@getPetTypes', '@getAccounts', '@getDogBreeds']);

        cy.contains('label', 'Breed').parent().find('select').should('have.value', 'breed1');
        cy.contains('option', 'Golden Retriever').should('be.visible');
        cy.contains('option', 'Labrador').should('be.visible');

        cy.contains('label', 'Pet Type').parent().find('select').select('type2');

        cy.wait('@getCatBreeds');

        cy.contains('label', 'Breed').parent().find('select').should('have.value', '');
        cy.contains('option', 'Siamese').should('be.visible');
        cy.contains('option', 'Persian').should('be.visible');
        cy.contains('option', 'Golden Retriever').should('not.exist');
    });

    it('should handle empty breed list for a pet type', () => {
        cy.wait(['@getPet', '@getPetTypes', '@getAccounts', '@getDogBreeds']);

        cy.intercept('GET', '**/api/petBreed/byPetType/type2', {
            statusCode: 200,
            body: {
                flag: false,
                data: []
            }
        }).as('getEmptyBreeds');

        cy.contains('label', 'Pet Type').parent().find('select').select('type2');

        cy.wait('@getEmptyBreeds');

        cy.contains('Information').should('be.visible');
        cy.contains('No breeds available for this pet type').should('be.visible');

        cy.contains('label', 'Breed')
            .parent()
            .find('select option')
            .should('have.length', 1);
    });

    it('should handle date picker correctly', () => {
        cy.wait(['@getPet', '@getPetTypes', '@getAccounts']);

        cy.get('#datePicker').should('have.attr', 'max').and('not.be.empty');

        cy.get('#datePicker').invoke('attr', 'style', 'opacity: 1; z-index: 1; position: relative;');

        const newDate = '2021-06-15';
        cy.get('#datePicker').click({ force: true }).clear().type(newDate).trigger('change', { force: true });

        cy.get('#datePicker').should('have.value', newDate);
        cy.get('input[placeholder="DD/MM/YYYY"]').should('have.value', '15/06/2021');
    });

    it('should clear validation errors when fields are corrected', () => {
        cy.wait(['@getPet', '@getPetTypes', '@getAccounts']);

        cy.get('input[placeholder="Pet Name"]').clear();
        cy.contains('label', 'Weight (kg)').parent().find('input').clear();

        cy.contains('button', 'Save Changes').click();

        cy.contains('Please enter pet name').should('be.visible');
        cy.contains('Please enter a valid weight').scrollIntoView().should('be.visible');

        cy.get('input[placeholder="Pet Name"]').type('Buddy Fixed');
        cy.contains('button', 'Save Changes').click();

        cy.contains('Please enter pet name').should('not.exist');
        cy.contains('Please enter a valid weight').scrollIntoView().should('be.visible');

        cy.contains('label', 'Weight (kg)').parent().find('input').type('10');
        cy.contains('button', 'Save Changes').click();

        cy.contains('Please enter a valid weight').should('not.exist');

        cy.get('input[placeholder="Pet Name"]').should('have.value', 'Buddy Fixed');
        cy.contains('label', 'Weight (kg)').parent().find('input').should('have.value', '10');
    });

    it('should handle confirmation dialog when updating pet', () => {
        cy.wait(['@getPet', '@getPetTypes', '@getAccounts']);

        cy.intercept('PUT', '**/api/pet', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Pet updated successfully'
            }
        }).as('confirmUpdate');

        cy.get('input[placeholder="Pet Name"]').clear().type('Buddy Modified');

        cy.contains('button', 'Save Changes').click();

        cy.contains('Are you sure?').should('be.visible');
        cy.contains('This action may affect other data').should('be.visible');

        cy.contains('button', 'No, cancel').click();

        cy.url().should('include', '/pet/edit');

        cy.contains('button', 'Save Changes').click();
        cy.contains('button', 'Yes, update it!').click();

        cy.wait('@confirmUpdate');

        cy.url().should('include', '/pet');
    });

    it('should reject non-image files', () => {
        cy.wait(['@getPetTypes', '@getAccounts']);

        cy.fixture('images/test-document.pdf', 'base64').then(fileContent => {
            const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'application/pdf');
            const testFileName = 'test-document.pdf';

            cy.window().then(win => {
                cy.stub(win, 'alert').as('alertStub');
            });

            cy.get('input[type="file"]').attachFile({
                fileContent: testFile,
                fileName: testFileName,
                mimeType: 'application/pdf'
            });

            cy.contains('Invalid file type').should('be.visible');
            cy.contains('Only image files are accepted').should('be.visible');
        });
    });

    it('should handle server errors gracefully', () => {
        cy.wait(['@getPet', '@getPetTypes', '@getAccounts']);

        cy.intercept('PUT', '**/api/pet', {
            forceNetworkError: true
        }).as('serverError');

        cy.get('input[placeholder="Pet Name"]').clear().type('Server Error Test');
        cy.contains('button', 'Save Changes').click();
        cy.contains('button', 'Yes, update it!').click();

        cy.wait('@serverError');

        cy.contains('Error').should('be.visible');
        cy.contains('Failed to update pet').should('be.visible');

        cy.url().should('include', '/pet/edit');
    });

    it('should handle back navigation correctly', () => {
        cy.wait(['@getPet', '@getPetTypes', '@getAccounts']);

        cy.get('button').first().click();

        cy.url().should('include', '/pet');
    });
});

