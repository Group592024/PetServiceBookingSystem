describe('Pet Breed Create Page', () => {
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

    cy.intercept('POST', '**/api/PetBreed', {
      statusCode: 200,
      body: {
        flag: true,
        message: 'Pet Breed Added Successfully!'
      }
    }).as('createPetBreed');

    cy.visit('http://localhost:3000/petBreed/add', {
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

    cy.wait('@getPetTypes');
  });

  it('should have responsive design', () => {
    cy.viewport('iphone-x');
    cy.contains('Create New Breed').should('be.visible');

    cy.viewport('ipad-2');
    cy.contains('Create New Breed').should('be.visible');

    cy.viewport(1280, 800);
    cy.contains('Create New Breed').should('be.visible');
  });

  it('should display the create pet breed form correctly', () => {
    cy.contains('h1', 'Create New Breed').should('be.visible');

    cy.contains('label', 'Breed Name').should('be.visible');
    cy.contains('label', 'Pet Type').should('be.visible');
    cy.contains('label', 'Description').should('be.visible');

    cy.get('img[alt="Preview"]').scrollIntoView().should('be.visible');
    cy.contains('Click to upload or change image').should('be.visible');

    cy.contains('button', 'Cancel').scrollIntoView().should('be.visible');
    cy.contains('button', 'Create Breed').should('be.visible');
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
    cy.contains('button', 'Create Breed').click();

    cy.contains('Breed Name is required').scrollIntoView().should('be.visible');
    cy.contains('Type is required').should('be.visible');
    cy.contains('Description is required').should('be.visible');

    cy.contains('label', 'Breed Name').parent().find('input').type('Shiba Inu');
    cy.get('.MuiSelect-select').click();
    cy.contains('Dog').click();
    cy.contains('label', 'Description').parent().find('textarea').first().type('Japanese Dog.');

    cy.contains('button', 'Create Breed').click();
    cy.contains('Pet Breed Image is required').should('be.visible');
  });

  it('should upload an image successfully', () => {
    cy.fixture('images/test-pet.jpg', 'base64').then(fileContent => {
      const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
      const testFileName = 'test-breed.jpg';

      cy.get('#inputFile').attachFile({
        fileContent: testFile,
        fileName: testFileName,
        mimeType: 'image/jpeg'
      });

      cy.get('img[alt="Preview"]')
        .should('have.attr', 'src')
        .and('not.include', 'sampleUploadImage.jpg');
    });
  });

  it('should reject non-image files', () => {
    cy.fixture('images/test-document.pdf', 'base64').then(fileContent => {
      const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'application/pdf');
      const testFileName = 'test-document.pdf';

      cy.window().then(win => {
        cy.stub(win, 'alert').as('alertStub');
      });

      cy.get('#inputFile').attachFile({
        fileContent: testFile,
        fileName: testFileName,
        mimeType: 'application/pdf'
      });

      cy.contains('.swal2-popup', 'Only accept image files!').should('be.visible');
    });
  });

  it('should create a pet breed successfully', () => {
    cy.intercept('POST', '**/api/PetBreed', (req) => {
      console.log('Request:', req);
      req.reply({
        statusCode: 200,
        body: {
          flag: true,
          message: 'Pet Breed created successfully'
        }
      });
    }).as('createPetBreed');

    cy.get('input[placeholder="Enter breed name"]').type('Golden Retriever');

    cy.get('.MuiSelect-select').click();
    cy.contains('Dog').click();

    cy.get('textarea[placeholder="Enter breed description..."]').type('A friendly and intelligent dog breed that is great with families.');

    cy.fixture('images/test-pet.jpg', 'base64').then((fileContent) => {
      const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
      const testFileName = 'test-breed.jpg';

      cy.get('#inputFile').attachFile({
        fileContent: testFile,
        fileName: testFileName,
        mimeType: 'image/jpeg',
      });
    });

    cy.contains('button', 'Create Breed').click();

    cy.wait('@createPetBreed');

    cy.contains('Pet Breed Added Successfully!').should('be.visible');
    cy.url().should('include', '/petBreed');
  });

  it('should handle duplicate pet breed name when creating pet breed', () => {
    cy.intercept('POST', '**/api/PetBreed', {
      statusCode: 400,
      body: {
        flag: false,
        message: 'Breed name already exists'
      }
    }).as('createPetBreedError');

    cy.get('input[placeholder="Enter breed name"]').type('Existing Breed');
    cy.get('.MuiSelect-select').click();
    cy.contains('Cat').click();
    cy.get('textarea[placeholder="Enter breed description..."]').type('This breed already exists in the database.');

    cy.fixture('images/test-pet.jpg', 'base64').then(fileContent => {
      const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
      const testFileName = 'test-breed.jpg';

      cy.get('#inputFile').attachFile({
        fileContent: testFile,
        fileName: testFileName,
        mimeType: 'image/jpeg'
      });

      cy.contains('button', 'Create Breed').click();

      cy.wait('@createPetBreedError');

      cy.contains('Breed name already exists').should('be.visible');

      cy.url().should('include', '/petBreed/add');
    });
  });

  it('should handle clicking on the image to trigger file upload', () => {
    cy.get('#inputFile').then($input => {
      cy.spy($input[0], 'click').as('inputClick');
    });

    cy.get('img[alt="Preview"]').click();

    cy.get('@inputClick').should('have.been.called');
  });
});

