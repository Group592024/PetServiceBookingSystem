describe('Customer Pet Create Page', () => {
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
        win.sessionStorage.setItem('accountId', 'customer-123');
      });
    });

    cy.url().should('not.include', '/login', { timeout: 10000 });

    cy.intercept('GET', '**/api/petType/available', {
      statusCode: 200,
      body: {
        flag: true,
        data: [
          { petType_ID: 'type1', petType_Name: 'Dog', isDelete: false },
          { petType_ID: 'type2', petType_Name: 'Cat', isDelete: false },
          { petType_ID: 'type3', petType_Name: 'Bird', isDelete: true }
        ]
      }
    }).as('getPetTypes');

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
          { petBreedId: 'breed3', petBreedName: 'Persian' },
          { petBreedId: 'breed4', petBreedName: 'Siamese' }
        ]
      }
    }).as('getCatBreeds');

    cy.intercept('POST', '**/api/pet', {
      statusCode: 200,
      body: {
        flag: true,
        message: 'Pet created successfully'
      }
    }).as('createPet');

    cy.visit('http://localhost:3000/customer/pet/add', {
      onBeforeLoad: (win) => {
        if (!win.sessionStorage.getItem('token')) {
          win.sessionStorage.setItem('token', 'dummy-test-token');
          win.sessionStorage.setItem('accountId', 'customer-123');
        }
      },
      timeout: 30000
    });
  });

  it('should have responsive design for pet create', () => {
    cy.viewport('iphone-x');
    cy.contains('Create Pet').should('be.visible');

    cy.viewport('ipad-2');
    cy.contains('Create Pet').should('be.visible');

    cy.viewport(1280, 800);
    cy.contains('Create Pet').should('be.visible');
  });

  it('should display the create pet form correctly', () => {
    cy.contains('h1', 'Add New Pet').should('be.visible');
    cy.contains('Upload Pet Photo').should('be.visible');
    cy.contains('Click to browse files').should('be.visible');

    cy.get("input[placeholder=\"What's your pet's name?\"]").should('be.visible');
    cy.get('div').contains('Male').should('exist');
    cy.get('div').contains('Female').should('exist');
    cy.get('textarea[placeholder="Any special information about your pet..."]').should('be.visible');

    cy.contains('label', 'Pet Type').should('be.visible');
    cy.get('select').should('contain', 'Dog');
    cy.get('select').should('contain', 'Cat');
    cy.get('select').should('not.contain', 'Bird');    

    cy.contains('label', 'Breed').should('be.visible');
    cy.contains('label', 'Weight (kg)').should('be.visible');
    cy.contains('label', 'Fur Type').should('be.visible');
    cy.contains('label', 'Fur Color').should('be.visible');

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

  it('should handle date picker correctly', () => {
    cy.wait(['@getPetTypes']);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

    cy.get('#datePicker').should('have.attr', 'max').and('not.be.empty');

    cy.get('#datePicker').invoke('attr', 'style', 'opacity: 1; z-index: 1; position: relative;');

    const pastDate = '2020-01-15';
    cy.get('#datePicker').click({ force: true }).clear().type(pastDate).trigger('change', { force: true });

    cy.get('#datePicker').should('have.value', pastDate);
    cy.get('#datePicker').should('have.value', '2020-01-15');
  });

  it('should clear validation errors when fields are corrected', () => {
    cy.wait(['@getPetTypes']);

    cy.contains('button', 'Create Pet').click();

    cy.contains('Please enter pet name').should('be.visible');

    cy.get("input[placeholder=\"What's your pet's name?\"]").type('Buddy');

    cy.contains('Please enter pet name').should('not.exist');

    cy.contains('Please select a pet image').should('be.visible');
  });

  it('should navigate back to pet list when clicking Cancel button', () => {
    cy.contains('button', 'Cancel').click();
    cy.url().should('include', '/customer/pet');
  });

  it('should show validation errors when submitting empty form', () => {
    cy.contains('button', 'Create Pet').click();

    cy.contains('Please select a pet image').should('be.visible');
    cy.contains('Please enter pet name').should('be.visible');
    cy.contains('Please enter pet note').should('be.visible');
    cy.contains('Please select date of birth').should('be.visible');
    cy.contains('Please select pet type').should('be.visible');
    cy.contains('Please select pet breed').should('be.visible');
    cy.contains('Please enter a valid weight').should('be.visible');
    cy.contains('Please enter fur type').should('be.visible');
    cy.contains('Please enter fur color').should('be.visible');
  });

  it('should handle image upload', () => {
    cy.fixture('images/test-pet.jpg', 'base64').then(fileContent => {
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
    cy.fixture('images/test-document.pdf', 'base64').then(fileContent => {
      const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'application/pdf');
      const testFileName = 'test-document.pdf';

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
    cy.wait(['@getPetTypes']);

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

    cy.get("input[placeholder=\"What's your pet's name?\"]").type('Buddy');
    cy.contains('div', 'Male').click();

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
    cy.wait(['@getPetTypes']);

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

    cy.get("input[placeholder=\"What's your pet's name?\"]").type('Buddy');
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

    cy.contains('button', 'Create Pet').click();

    cy.wait('@createPetError');

    cy.contains('Error').should('be.visible');
    cy.contains('Pet with this name already exists').should('be.visible');
  });

  it('should handle API error when creating pet', () => {
    cy.intercept('POST', '**/api/pet', {
      statusCode: 400,
      body: {
        flag: false,
        message: 'Failed to create pet: Invalid data'
      }
    }).as('createPetError');

    cy.fixture('images/test-pet.jpg', 'base64').then(fileContent => {
      const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
      cy.get('input[type="file"]').attachFile({
        fileContent: testFile,
        fileName: 'test-pet.jpg',
        mimeType: 'image/jpeg'
      });
    });

    cy.get("input[placeholder=\"What's your pet's name?\"]").type('Max');
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
    cy.get('textarea[placeholder="Any special information about your pet..."]').type('Test notes');
    cy.get('select').eq(0).select('Cat');
    cy.wait('@getCatBreeds');
    cy.get('select').eq(1).select('Persian');
    cy.contains('label', 'Weight (kg)').parent().find('input').type('4.2');
    cy.contains('label', 'Fur Type').parent().find('input').type('Short');
    cy.contains('label', 'Fur Color').parent().find('input').type('Gray');

    cy.contains('button', 'Create Pet').click();

    cy.wait('@createPetError');

    cy.contains('Error').should('be.visible');

    cy.url().should('include', '/customer/pet/add');
  });

  it('should validate weight field correctly', () => {
    cy.contains('label', 'Weight (kg)').parent().find('input').type('0');

    cy.contains('button', 'Create Pet').click();

    cy.contains('Please enter a valid weight (greater than 0)').should('be.visible');

    cy.contains('label', 'Weight (kg)').parent().find('input').clear().type('5');
    cy.contains('Please enter a valid weight (greater than 0)').should('not.exist');
  });
});
