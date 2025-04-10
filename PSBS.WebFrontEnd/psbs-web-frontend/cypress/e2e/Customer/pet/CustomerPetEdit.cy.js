describe('Customer Pet Edit Page', () => {
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

    const petId = 'pet-123';

    cy.intercept('GET', `**/api/pet/${petId}`, {
      statusCode: 200,
      body: {
        flag: true,
        data: {
          petId: petId,
          petName: 'Buddy',
          petGender: true,
          dateOfBirth: '2020-01-15T00:00:00',
          petTypeId: 'type1',
          petBreedId: 'breed1',
          petWeight: '15.5',
          petFurType: 'Long',
          petFurColor: 'Golden',
          petNote: 'Buddy is a friendly dog who loves to play fetch.',
          petImage: '/Images/buddy.jpg',
          accountId: 'customer-123',
          isDelete: false
        }
      }
    }).as('getPetDetails');

    cy.intercept('GET', '**/api/petType/available', {
      statusCode: 200,
      body: {
        flag: true,
        data: [
          { petType_ID: 'type1', petType_Name: 'Dog', isDelete: false },
          { petType_ID: 'type2', petType_Name: 'Cat', isDelete: false }
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

    cy.intercept('PUT', '**/api/pet', {
      statusCode: 200,
      body: {
        flag: true,
        message: 'Pet updated successfully'
      }
    }).as('updatePet');

    cy.visit(`http://localhost:3000/customer/pet/edit/${petId}`, {
      onBeforeLoad: (win) => {
        if (!win.sessionStorage.getItem('token')) {
          win.sessionStorage.setItem('token', 'dummy-test-token');
          win.sessionStorage.setItem('accountId', 'customer-123');
        }
      },
      timeout: 30000
    });

    cy.wait('@getPetDetails');
    cy.wait('@getPetTypes');
    cy.wait('@getDogBreeds');
  });

  it('should have responsive design for pet edit', () => {
    cy.viewport('iphone-x');
    cy.contains('Edit Pet Profile').should('be.visible');

    cy.viewport('ipad-2');
    cy.contains('Edit Pet Profile').should('be.visible');

    cy.viewport(1280, 800);
    cy.contains('Edit Pet Profile').should('be.visible');
  });

  it('should handle duplicate pet name error when updating a pet', () => {

    cy.intercept('PUT', '**/api/pet', {
      statusCode: 400,
      body: {
        flag: false,
        message: 'Pet with this name already exists'
      }
    }).as('updatePetError');

    cy.get("input[placeholder=\"What's your pet's name?\"]").clear().type('Duplicate Name');

    cy.contains('button', 'Save Changes').click();

    cy.contains('button', 'Yes, update it!').click();

    cy.wait('@updatePetError');

    cy.contains('Error').should('be.visible');
    cy.contains('Pet with this name already exists').should('be.visible');
  });

  it('should display the edit pet form with pre-filled data', () => {
    cy.contains('h1', 'Edit Pet Profile').should('be.visible');

    cy.get('img[alt="Preview"]').should('be.visible')
      .and('have.attr', 'src')
      .and('include', 'http://localhost:5050/pet-service/Images/buddy.jpg');

    cy.get("input[placeholder=\"What's your pet's name?\"]").should('have.value', 'Buddy');
    cy.get('select').first().should('have.value', 'true');
    cy.get('textarea[placeholder="Special care instructions, behaviors, or other important information..."]').should('have.value', 'Buddy is a friendly dog who loves to play fetch.');


    cy.get('select').eq(1).should('have.value', 'type1');
    cy.get('select').eq(2).should('have.value', 'breed1');

    cy.contains('label', 'Weight (kg)').parent().find('input').should('have.value', '15.5');
    cy.contains('label', 'Fur Type').parent().find('input').should('have.value', 'Long');
    cy.contains('label', 'Fur Color').parent().find('input').should('have.value', 'Golden');

    cy.contains('button', 'Cancel').should('be.visible');
    cy.contains('button', 'Save Changes').should('be.visible');
  });

  it('should navigate back to pet list when clicking Cancel button', () => {
    cy.contains('button', 'Cancel').click();
    cy.url().should('include', '/customer/pet');
  });

  it('should update pet information successfully', () => {
    cy.get("input[placeholder=\"What's your pet's name?\"]").clear().type('Buddy Updated');

    cy.get('select').first().select('false');

    cy.get('textarea[placeholder="Special care instructions, behaviors, or other important information..."]').clear().type('Updated notes about Buddy');

    cy.contains('label', 'Weight (kg)').parent().find('input').clear().type('16.5');

    cy.contains('label', 'Fur Type').parent().find('input').clear().type('Medium');

    cy.contains('label', 'Fur Color').parent().find('input').clear().type('Golden Brown');

    cy.contains('button', 'Save Changes').click();

    cy.contains("Are you sure?").should('be.visible');
    cy.contains('button', 'Yes, update it!').click();

    cy.contains('Success').should('be.visible');
    cy.contains('Pet updated successfully').should('be.visible');

    cy.url().should('include', '/customer/pet');
  });

  it('should change pet type and load corresponding breeds', () => {
    cy.get('select').eq(1).select('Cat');
    cy.wait('@getCatBreeds');

    cy.get('select').eq(2).should('not.have.value', 'breed1');
    cy.get('select').eq(2).find('option').should('have.length.at.least', 3);
    cy.get('select').eq(2).find('option').eq(1).should('have.text', 'Persian');
    cy.get('select').eq(2).find('option').eq(2).should('have.text', 'Siamese');

    cy.get('select').eq(2).select('Persian');

    cy.contains('button', 'Save Changes').click();
    cy.contains('button', 'Yes, update it!').click();

    cy.wait('@updatePet');
  });

  it('should handle image upload', () => {
    cy.fixture('images/test-pet.jpg', 'base64').then(fileContent => {
      const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
      const testFileName = 'test-pet-updated.jpg';

      cy.get('input[type="file"]').attachFile({
        fileContent: testFile,
        fileName: testFileName,
        mimeType: 'image/jpeg'
      });

      cy.get('img[alt="Preview"]').should('be.visible')
        .and('have.attr', 'src')
        .and('not.include', 'http://localhost:5050/pet-service/Images/buddy.jpg');

      cy.contains('button', 'Save Changes').click();
      cy.contains('button', 'Yes, update it!').click();

      cy.wait('@updatePet');
    });
  });

  it('should reject non-image files', () => {
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

  it('should handle API error when updating pet', () => {
    cy.intercept('PUT', '**/api/pet', {
      statusCode: 400,
      body: {
        flag: false,
        message: 'Failed to update pet: Invalid data'
      }
    }).as('updatePetError');

    cy.get("input[placeholder=\"What's your pet's name?\"]").clear().type('Error Test');

    cy.contains('button', 'Save Changes').click();
    cy.contains('button', 'Yes, update it!').click();

    cy.wait('@updatePetError');

    cy.contains('Error').should('be.visible');
    cy.contains('Failed to update pet: Invalid data').should('be.visible');

    cy.url().should('include', '/customer/pet/edit/');
  });

  it('should handle API error when fetching pet details', () => {
    cy.clearLocalStorage();
    cy.clearCookies();

    const petId = 'invalid-pet';

    cy.intercept('GET', `**/api/pet/${petId}`, {
      statusCode: 404,
      body: {
        flag: false,
        message: 'Pet not found'
      }
    }).as('getPetDetailsError');

    cy.visit(`http://localhost:3000/customer/pet/edit/${petId}`);

    cy.wait('@getPetDetailsError');

    cy.contains('Pet not found').should('be.visible');
  });

  it('should validate form before submission', () => {
    cy.get("input[placeholder=\"What's your pet's name?\"]").clear();
    cy.get('textarea[placeholder="Special care instructions, behaviors, or other important information..."]').clear();
    cy.contains('label', 'Weight (kg)').parent().find('input').clear().type('0');
    cy.contains('label', 'Fur Type').parent().find('input').clear();
    cy.contains('label', 'Fur Color').parent().find('input').clear();

    cy.contains('button', 'Save Changes').click();
    cy.contains('button', 'Yes, update it!').click();

    cy.contains('Please enter pet name').should('be.visible');
    cy.contains('Please enter pet note').should('be.visible');
    cy.contains('Please enter a valid weight (greater than 0)').should('be.visible');
    cy.contains('Please enter fur type').should('be.visible');
    cy.contains('Please enter fur color').should('be.visible');

    cy.get("input[placeholder=\"What's your pet's name?\"]").type('Buddy Fixed', { force: true });
    cy.get('textarea[placeholder="Special care instructions, behaviors, or other important information..."]').type('Fixed notes');
    cy.contains('label', 'Weight (kg)').parent().find('input').clear().type('10');
    cy.contains('label', 'Fur Type').parent().find('input').type('Short');
    cy.contains('label', 'Fur Color').parent().find('input').type('Brown');

    cy.contains('button', 'Save Changes').click();
    cy.contains('button', 'Yes, update it!').click();

    cy.wait('@updatePet');
    cy.contains('Success').should('be.visible');
  });

  it('should cancel update when clicking Cancel on confirmation dialog', () => {
    cy.get("input[placeholder=\"What's your pet's name?\"]").clear().type('Canceled Update');

    cy.contains('button', 'Save Changes').click();

    cy.contains('.swal2-cancel', 'Cancel').click({ force: true });
    cy.url().should('include', '/customer/pet/edit/');
    cy.get('@updatePet.all').should('have.length', 0);
  });

  it('should handle empty breed list for a pet type', () => {
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

    cy.contains('label', 'Breed').parent().find('select option').should('have.length', 1);
  });

  it('should format date correctly in the display field', () => {
    cy.get('#datePicker').should('have.attr', 'max').and('not.be.empty');

    cy.get('#datePicker').invoke('attr', 'style', 'opacity: 1; z-index: 1; position: relative;');

    const newDate = '2021-06-15';
    cy.get('#datePicker').click({ force: true }).clear().type(newDate).trigger('change', { force: true });

    cy.get('#datePicker').should('have.value', newDate);
    cy.get('#datePicker').should('have.value', '2021-06-15');
  });

  it('should preserve existing image if no new image is uploaded', () => {
    cy.get("input[placeholder=\"What's your pet's name?\"]").clear().type('No Image Change');

    cy.contains('button', 'Save Changes').click();
    cy.contains('button', 'Yes, update it!').click();

    cy.wait('@updatePet');
  });

  it('should handle network errors gracefully', () => {
    cy.intercept('PUT', '**/api/pet', {
      forceNetworkError: true
    }).as('networkError');

    cy.get("input[placeholder=\"What's your pet's name?\"]").clear().type('Network Error Test');
    cy.contains('button', 'Save Changes').click();
    cy.contains('button', 'Yes, update it!').click();

    cy.contains('Error').should('be.visible');
  });

  it('should handle back navigation correctly', () => {
    cy.get('button').first().click();

    cy.url().should('include', '/customer/pet');
  });

  it('should handle non-existent pet gracefully', () => {
    cy.clearLocalStorage();
    cy.clearCookies();

    const petId = 'non-existent';

    cy.intercept('GET', `**/api/pet/${petId}`, {
      statusCode: 404,
      body: {
        flag: false,
        message: 'Pet not found'
      }
    }).as('getNonExistentPet');

    cy.visit(`http://localhost:3000/customer/pet/edit/${petId}`);

    cy.wait('@getNonExistentPet');

    cy.contains('Error').should('be.visible');
  });
});

