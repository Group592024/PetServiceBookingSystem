describe('Pet Breed Edit Page', () => {
    beforeEach(() => {
        const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxOTE2MjM5MDIyfQ.N_ZJ0o3V9MxIZuGPmXJBLK9jn-kK3fXQjpwLBLc4d5A';

        cy.window().then((win) => {
            win.sessionStorage.setItem('token', validToken);
        });

        const breedId = 'test-breed-id';
        cy.intercept('GET', `**/api/PetBreed/${breedId}`, {
            statusCode: 200,
            body: {
                flag: true,
                data: {
                    petBreedId: breedId,
                    petBreedName: 'Golden Retriever',
                    petTypeId: 'type1',
                    petBreedDescription: 'A friendly and intelligent dog breed.',
                    petBreedImage: '/Images/golden-retriever.jpg',
                    isDelete: false
                }
            }
        }).as('getBreedDetails');

        cy.intercept('GET', '**/api/PetType/available', {
            statusCode: 200,
            body: {
                flag: true,
                data: [
                    { petType_ID: 'type1', petType_Name: 'Dog', isDelete: false },
                    { petType_ID: 'type2', petType_Name: 'Cat', isDelete: false },
                    { petType_ID: 'type3', petType_Name: 'Bird', isDelete: false }
                ]
            }
        }).as('getPetTypes');

        cy.intercept('GET', '**/api/PetType/type1', {
            statusCode: 200,
            body: {
                flag: true,
                data: {
                    petType_ID: 'type1',
                    petType_Name: 'Dog'
                }
            }
        }).as('getPetTypeDetails');

        cy.intercept('PUT', '**/api/PetBreed', {
            statusCode: 200,
            body: {
                flag: true,
                message: 'Pet Breed Updated Successfully!'
            }
        }).as('updatePetBreed');

        cy.visit(`http://localhost:3000/petBreed/edit/${breedId}`, {
            onBeforeLoad: (win) => {
                win.sessionStorage.setItem('token', validToken);
            }
        });

        cy.contains('Loading').should('not.exist');
    });

    it('should have responsive design', () => {
        cy.viewport('iphone-x');
        cy.contains('Edit Pet Breed').should('be.visible');

        cy.viewport('ipad-2');
        cy.contains('Edit Pet Breed').should('be.visible');

        cy.viewport(1280, 800);
        cy.contains('Edit Pet Breed').should('be.visible');
    });

    it('should handle network errors gracefully', () => {
        cy.wait(['@getBreedDetails', '@getPetTypes']);
        cy.intercept('PUT', '**/api/PetBreed', {
            forceNetworkError: true
        }).as('networkError');

        cy.get('input[value="Golden Retriever"]').clear().type('Network Error Test');

        cy.contains('button', 'Save Changes').click();
        cy.contains('Are you sure?').should('be.visible');
        cy.contains('button', 'Update').click();

        cy.wait('@networkError');
        cy.contains('Edit Pet Breed').scrollIntoView().should('be.visible');
        cy.contains('Failed To Update Pet Breed!', { timeout: 5000 }).should('be.visible');

        cy.url().should('include', '/petBreed/edit');
    });

    it('should display the edit pet breed form with pre-filled data', () => {
        cy.contains('h1', 'Edit Pet Breed').should('be.visible');

        cy.get('input[value="Golden Retriever"]').should('be.visible');
        cy.get('textarea').should('have.value', 'A friendly and intelligent dog breed.');

        cy.get('img[alt="Preview"]')
            .should('have.attr', 'src')
            .and('include', 'golden-retriever.jpg');

        cy.get('.MuiSelect-select').should('contain', 'Dog');

        cy.contains('div', 'Active')
            .should('have.class', 'bg-green-100')
            .should('have.class', 'text-green-700');
    });

    it('should navigate back when clicking the back button', () => {
        cy.get('button').first().click();
        cy.url().should('include', '/petBreed');
    });

    it('should navigate to pet breed list when clicking cancel button', () => {
        cy.contains('button', 'Cancel').click();
        cy.url().should('include', '/petBreed');
    });

    it('should show validation errors when submitting empty form', () => {
        cy.get('input[value="Golden Retriever"]').clear();
        cy.get('textarea').clear();

        cy.contains('button', 'Save Changes').click();

        cy.contains('Breed Name is required').scrollIntoView().should('be.visible');
        cy.contains('Description is required').should('be.visible');

        cy.get('@updatePetBreed.all').should('have.length', 0);
    });

    it('should upload a new image successfully', () => {
        cy.fixture('images/test-pet.jpg', 'base64').then(fileContent => {
            const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
            const testFileName = 'test-breed.jpg';

            cy.get('#fileInput').attachFile({
                fileContent: testFile,
                fileName: testFileName,
                mimeType: 'image/jpeg'
            });

            cy.get('img[alt="Preview"]').should('have.attr', 'src').and('not.include', 'golden-retriever.jpg');
        });
    });

    it('should reject non-image files', () => {
        cy.fixture('images/test-document.pdf', 'base64').then(fileContent => {
            const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'application/pdf');
            const testFileName = 'test-document.pdf';

            cy.window().then(win => {
                cy.stub(win, 'alert').as('alertStub');
            });

            cy.get('#fileInput').attachFile({
                fileContent: testFile,
                fileName: testFileName,
                mimeType: 'application/pdf'
            });

            cy.contains('.swal2-popup', 'Only accept image files!').should('be.visible');
        });
    });

    it('should update pet breed successfully with existing image', () => {
        cy.get('input[value="Golden Retriever"]').clear().type('Updated Golden Retriever');
        cy.get('textarea').clear().type('Updated description for Golden Retriever');

        cy.contains('button', 'Save Changes').click();
        cy.contains('Are you sure?').should('be.visible');
        cy.contains('button', 'Update').click();

        cy.wait('@updatePetBreed');

        cy.contains('Pet Breed Updated Successfully!').should('be.visible');

        cy.url().should('include', '/petBreed');
    });

    it('should update pet breed successfully with new image', () => {
        cy.get('input[value="Golden Retriever"]').clear().type('Updated Golden Retriever');

        cy.fixture('images/test-pet.jpg', 'base64').then(fileContent => {
            const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
            const testFileName = 'test-breed.jpg';

            cy.get('#fileInput').attachFile({
                fileContent: testFile,
                fileName: testFileName,
                mimeType: 'image/jpeg'
            });
            cy.contains('button', 'Save Changes').click();
            cy.contains('Are you sure?').should('be.visible');
            cy.contains('button', 'Update').click();

            cy.wait('@updatePetBreed');
        });
    });

    it('should change pet type successfully', () => {
        cy.get('.MuiSelect-select').click();
        cy.contains('Cat').click();

        cy.contains('button', 'Save Changes').click();
        cy.contains('Are you sure?').should('be.visible');
        cy.contains('button', 'Update').click();

        cy.wait('@updatePetBreed');
    });

    it('should toggle status between active and inactive', () => {
        cy.contains('div', 'Inactive').click();

        cy.contains('div', 'Active', { timeout: 5000 }).should('exist');

        cy.contains('button', 'Save Changes').click();
        cy.contains('Are you sure?').should('be.visible');
        cy.contains('button', 'Update').click();

        cy.wait('@updatePetBreed');

        cy.contains('div', 'Inactive', { timeout: 5000 }).should('exist');
    });

    it('should cancel update when clicking Cancel on confirmation dialog', () => {
        cy.get('input[value="Golden Retriever"]').clear().type('Canceled Update');

        cy.contains('button', 'Save Changes').click();
        cy.contains('Are you sure?').should('be.visible');
        cy.contains('button', 'Cancel').click({ force: true });
    });

    it('should handle duplicate pet breed name when updating pet breed', () => {
        cy.intercept('PUT', '**/api/PetBreed', {
            statusCode: 400,
            body: {
                flag: false,
                message: 'Breed name already exists'
            }
        }).as('updatePetBreedError');

        cy.get('input[value="Golden Retriever"]').clear().type('Existing Breed');

        cy.contains('button', 'Save Changes').click();
        cy.contains('Are you sure?').should('be.visible');
        cy.contains('button', 'Update').click();

        cy.wait('@updatePetBreedError');

        cy.contains('Breed name already exists').should('be.visible');
    });

    it('should handle responsive layout correctly', () => {
        cy.viewport('iphone-x');

        cy.get('.md\\:flex-row').should('exist');
        cy.get('.md\\:w-1\\/2').should('exist');

        cy.viewport('ipad-2');

        cy.get('.md\\:flex-row').should('exist');
        cy.get('.md\\:w-1\\/2').should('exist');

        cy.viewport('macbook-15');

        cy.get('.md\\:flex-row').should('exist');
        cy.get('.md\\:w-1\\/2').should('exist');
    });

    it('should handle image click to trigger file upload', () => {
        cy.get('#fileInput').then($input => {
            cy.spy($input[0], 'click').as('inputClick');
        });

        cy.get('img[alt="Preview"]').click();

        cy.get('@inputClick').should('have.been.called');
    });
});


