describe('Pet Creation Page', () => {
    beforeEach(() => {
        const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxOTE2MjM5MDIyfQ.N_ZJ0o3V9MxIZuGPmXJBLK9jn-kK3fXQjpwLBLc4d5A';

        cy.window().then((win) => {
            win.sessionStorage.setItem('token', validToken);
        });

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

        cy.visit('http://localhost:3000/pet/add', {
            onBeforeLoad: (win) => {
                win.sessionStorage.setItem('token', validToken);
            }
        });
    });

    it('should have responsive design', () => {
        cy.viewport('iphone-x');
        cy.contains('Create New Pet').should('be.visible');

        cy.viewport('ipad-2');
        cy.contains('Create New Pet').should('be.visible');

        cy.viewport(1280, 800);
        cy.contains('Create New Pet').should('be.visible');
    });

    it('should load the pet creation form correctly', () => {
        cy.wait(['@getPetTypes', '@getAccounts']);

        cy.contains('h1', 'Create New Pet').should('be.visible');

        cy.contains('Click to upload pet photo').should('be.visible');
        cy.get('input[type="file"]').should('exist');
        cy.get('input[placeholder="Pet Name"]').should('be.visible');
        cy.get('select').first().should('contain', 'Male').and('contain', 'Female');

        cy.contains('label', 'Pet Type').should('be.visible');
        cy.contains('label', 'Breed').should('be.visible');
        cy.contains('label', 'Weight (kg)').should('be.visible');
        cy.contains('label', 'Fur Type').should('be.visible');
        cy.contains('label', 'Fur Color').should('be.visible');
        cy.contains('label', 'Notes').scrollIntoView().should('be.visible');

        cy.contains('button', 'Cancel').should('be.visible');
        cy.contains('button', 'Create Pet').should('be.visible');
    });

    it('should filter out deleted pet types', () => {
        cy.wait('@getPetTypes');

        cy.get('select').should('exist');

        cy.contains('label', 'Pet Type').parent().find('select').select('Dog');

        cy.contains('option', 'Dog').should('be.visible');
        cy.contains('option', 'Cat').should('be.visible');
        cy.contains('option', 'Bird').should('not.exist');
    });

    it('should load breeds when pet type is selected', () => {
        cy.wait('@getPetTypes');

        cy.contains('label', 'Pet Type').parent().find('select').should('exist');

        cy.contains('label', 'Pet Type').parent().find('select').select('Dog');

        cy.wait('@getDogBreeds');

        cy.contains('label', 'Breed').parent().find('select').should('exist');
        cy.contains('label', 'Breed').parent().find('select').select('Golden Retriever');
        cy.contains('option', 'Golden Retriever').should('be.visible');
        cy.contains('option', 'Labrador').should('be.visible');

        cy.contains('label', 'Pet Type').parent().find('select').select('Cat');

        cy.wait('@getCatBreeds');

        cy.contains('label', 'Breed').parent().find('select').should('exist');
        cy.contains('label', 'Breed').parent().find('select').select('Siamese');
        cy.contains('option', 'Siamese').should('be.visible');
        cy.contains('option', 'Persian').should('be.visible');
    });

    it('should filter accounts by role and search term', () => {
        cy.wait(['@getAccounts']);

        cy.get('input[placeholder="Search Owner"]').click().type('John');

        cy.contains('li', 'John Doe').should('be.visible');
        cy.contains('li', 'Jane Smith').should('not.exist');
        cy.contains('li', 'Admin User').should('not.exist');

        cy.get('input[placeholder="Search Owner"]').clear().type('Jane');
        cy.contains('li', 'Jane Smith').should('be.visible');
        cy.contains('li', 'John Doe').should('not.exist');

        cy.contains('li', 'Jane Smith').click();
        cy.get('input[placeholder="Search Owner"]').should('have.value', 'Jane Smith');
    });

    it('should show validation errors when submitting empty form', () => {
        cy.wait(['@getPetTypes', '@getAccounts']);

        cy.contains('button', 'Create Pet').click();

        cy.contains('Please select a pet image').should('be.visible');
        cy.contains('Please enter pet name').should('be.visible');
        cy.contains('Please select date of birth').should('be.visible');
        cy.contains('Please select pet type').scrollIntoView().should('be.visible');
        cy.contains('Please select pet breed').should('be.visible');
        cy.contains('Please enter a valid weight').should('be.visible');
        cy.contains('Please enter fur type').should('be.visible');
        cy.contains('Please enter fur color').should('be.visible');
        cy.contains('Please select owner').should('be.visible');
        cy.contains('Please enter pet note').scrollIntoView().should('be.visible');
    });

    it('should handle image upload correctly', () => {
        cy.wait(['@getPetTypes', '@getAccounts']);

        cy.fixture('images/test-pet.jpg', { encoding: 'base64' })
            .then(fileContent => {
                const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
                const testFileName = 'test-pet.jpg';

                cy.get('input[type="file"]').attachFile({
                    fileContent: testFile,
                    fileName: testFileName,
                    mimeType: 'image/jpeg'
                });

                cy.get('img[alt="Preview"]').should('be.visible');
            });
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

    it('should successfully create a pet when form is valid', () => {
        cy.wait(['@getPetTypes', '@getAccounts']);

        cy.intercept('POST', '**/api/pet', (req) => {
            console.log('Request:', req);

            req.reply({
                statusCode: 200,
                body: {
                    flag: true,
                    message: 'Pet created successfully'
                }
            });
        }).as('createPet');

        cy.fixture('images/test-pet.jpg', 'base64').then(fileContent => {
            const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
            const testFileName = 'test-pet.jpg';

            cy.get('input[type="file"]').attachFile({
                fileContent: testFile,
                fileName: testFileName,
                mimeType: 'image/jpeg'
            });
        });

        cy.get('input[placeholder="Pet Name"]').type('Buddy');
        cy.get('select').first().select('true');

        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const formattedDate = oneYearAgo.toISOString().split('T')[0];

        cy.get('#datePicker').click({ force: true });

        cy.get('#datePicker')
            .invoke('attr', 'style', 'opacity: 1; z-index: 1; position: relative;')
            .type(formattedDate)
            .trigger('change', { force: true });

        cy.get('#datePicker').should('have.value', formattedDate);

        cy.contains('label', 'Pet Type').parent().find('select').select('type1');
        cy.wait('@getDogBreeds');
        cy.contains('label', 'Breed').parent().find('select').select('breed1');

        cy.contains('label', 'Weight (kg)').parent().find('input').type('15');
        cy.contains('label', 'Fur Type').parent().find('input').type('Short');
        cy.contains('label', 'Fur Color').parent().find('input').type('Golden');
        cy.get('textarea').type('This is a friendly dog who loves to play fetch.');

        cy.get('input[placeholder="Search Owner"]').type('John Doe');
        cy.contains('li', 'John Doe').click();

        cy.contains('button', 'Create Pet').click({ force: true });

        cy.wait('@createPet').then(interception => {
            expect(interception.request.headers['content-type']).to.include('multipart/form-data');

            expect(interception.request.url).to.include('/api/pet');
            expect(interception.request.method).to.equal('POST');
        });

        cy.contains('Success!').should('be.visible');
        cy.contains('Pet created successfully').should('be.visible');

        cy.url().should('include', '/pet');
    });

    it('should handle duplicate pet name error when creating a pet', () => {
        cy.wait(['@getPetTypes', '@getAccounts']);

        cy.intercept('POST', '**/api/pet', {
            statusCode: 400,
            body: {
                flag: false,
                message: 'Pet with this name already exists'
            }
        }).as('createPetError');

        cy.fixture('images/test-pet.jpg', 'base64').then(fileContent => {
            const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
            const testFileName = 'test-pet.jpg';

            cy.get('input[type="file"]').attachFile({
                fileContent: testFile,
                fileName: testFileName,
                mimeType: 'image/jpeg'
            });
        });

        cy.get('input[placeholder="Pet Name"]').type('Buddy');
        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const formattedDate = oneYearAgo.toISOString().split('T')[0];

        cy.get('#datePicker').click({ force: true });

        cy.get('#datePicker')
            .invoke('attr', 'style', 'opacity: 1; z-index: 1; position: relative;')
            .type(formattedDate)
            .trigger('change', { force: true });

        cy.get('#datePicker').should('have.value', formattedDate);
        cy.contains('label', 'Pet Type').parent().find('select').select('type1');
        cy.wait('@getDogBreeds');
        cy.contains('label', 'Breed').parent().find('select').select('breed1');
        cy.contains('label', 'Weight (kg)').parent().find('input').type('15');
        cy.contains('label', 'Fur Type').parent().find('input').type('Short');
        cy.contains('label', 'Fur Color').parent().find('input').type('Golden');
        cy.get('textarea').type('Test note');
        cy.get('input[placeholder="Search Owner"]').type('John Doe');
        cy.contains('li', 'John Doe').click();

        cy.contains('button', 'Create Pet').click();

        cy.wait('@createPetError');

        cy.contains('Error').should('be.visible');
        cy.contains('Pet with this name already exists').should('be.visible');
    });

    it('should navigate back when clicking cancel button', () => {
        cy.wait(['@getPetTypes', '@getAccounts']);

        cy.contains('button', 'Cancel').click();

        cy.url().should('include', '/pet');
    });

    it('should handle empty breed list for a pet type', () => {
        cy.wait(['@getPetTypes']);

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

    it('should validate owner selection from dropdown', () => {
        cy.wait(['@getAccounts']);

        cy.get('input[placeholder="Search Owner"]').type('Non-existent Owner');
        cy.contains('No owners found').should('be.visible');

        cy.get('body').click();

        cy.contains('Please select a valid owner from the list').should('be.visible');

        cy.get('input[placeholder="Search Owner"]').clear().type('John Doe');
        cy.contains('li', 'John Doe').click();

        cy.contains('Please select a valid owner from the list').should('not.exist');
    });

    it('should validate weight input to be positive', () => {
        cy.wait(['@getPetTypes', '@getAccounts']);

        cy.contains('label', 'Weight (kg)').parent().find('input').type('-5');

        cy.contains('button', 'Create Pet').click();

        cy.contains('Please enter a valid weight (greater than 0)').should('be.visible');

        cy.contains('label', 'Weight (kg)').parent().find('input').clear().type('5');

        cy.contains('Please enter a valid weight (greater than 0)').should('not.exist');
    });

    it('should handle date picker correctly', () => {
        cy.wait(['@getPetTypes', '@getAccounts']);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

        cy.get('#datePicker').should('have.attr', 'max').and('not.be.empty');

        cy.get('#datePicker').invoke('attr', 'style', 'opacity: 1; z-index: 1; position: relative;');

        const pastDate = '2020-01-15';
        cy.get('#datePicker').click({ force: true }).clear().type(pastDate).trigger('change', { force: true });

        cy.get('#datePicker').should('have.value', pastDate);
        cy.get('input[placeholder="DD/MM/YYYY"]').should('have.value', '15/01/2020');
    });

    it('should clear validation errors when fields are corrected', () => {
        cy.wait(['@getPetTypes', '@getAccounts']);

        cy.contains('button', 'Create Pet').click();

        cy.contains('Please enter pet name').should('be.visible');

        cy.get('input[placeholder="Pet Name"]').type('Buddy');

        cy.contains('Please enter pet name').should('not.exist');

        cy.contains('Please select a pet image').should('be.visible');
    });

    it('should handle network errors when fetching data', () => {
        cy.reload();

        cy.intercept('GET', '**/api/petType/available', {
            forceNetworkError: true
        }).as('networkError');

        cy.window().then((win) => {
            cy.spy(win.console, 'log').as('consoleLog');
        });

        cy.wait('@networkError');

        cy.get('@consoleLog').should('be.calledWith', Cypress.sinon.match(/Error fetching pet types/));

        cy.contains('h1', 'Create New Pet').should('be.visible');
    });
});
