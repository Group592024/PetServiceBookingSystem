describe('Customer Pet Detail Page', () => {
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

    const petId = '123';
    const petBreedId = 'breed-456';

    cy.intercept('GET', `**/api/pet/${petId}`, {
      statusCode: 200,
      body: {
        flag: true,
        data: {
          petId: petId,
          petName: 'Fluffy',
          petImage: '/images/pets/fluffy.jpg',
          accountId: 'customer-123',
          petBreedId: petBreedId,
          dateOfBirth: '2020-01-01T00:00:00',
          petGender: true,
          petWeight: '5.5',
          petFurType: 'Long',
          petFurColor: 'White',
          petNote: 'Fluffy is a very friendly cat who loves to play.'
        }
      }
    }).as('getPetData');

    cy.intercept('GET', `**/api/petBreed/${petBreedId}`, {
      statusCode: 200,
      body: {
        flag: true,
        data: {
          petBreedId: petBreedId,
          petBreedName: 'Persian Cat',
          petTypeId: 'type-789'
        }
      }
    }).as('getPetBreedData');

    cy.intercept('GET', '**/api/token/validate', {
      statusCode: 200,
      body: {
        valid: true
      }
    }).as('tokenValidate');

    cy.visit(`http://localhost:3000/customer/pet/${petId}`, {
      onBeforeLoad: (win) => {
        if (!win.sessionStorage.getItem('token')) {
          win.sessionStorage.setItem('token', 'dummy-test-token');
          win.sessionStorage.setItem('accountId', 'customer-123');
        }
      },
      timeout: 30000 
    });

    cy.wait('@getPetData');
    cy.wait('@getPetBreedData');
  });

  it('should handle pet not found correctly', () => {
    cy.intercept('GET', '**/api/pet/123', {
      statusCode: 404,
      body: { flag: false, message: 'Pet not found' }
    }).as('getPetNotFound');
    cy.reload();
    cy.wait('@getPetNotFound');
  });

  it('should display the pet details correctly', () => {
    cy.contains('h1', 'Pet Profile').should('be.visible');
    cy.contains('button', 'Add New Pet').should('be.visible');

    cy.contains('h1', 'Fluffy').should('be.visible');
    cy.get('img[alt="Fluffy"]').should('be.visible');

    cy.contains('♂ Male').should('be.visible');
    cy.contains('01 Jan 2020').should('be.visible');

    cy.contains('Breed').should('be.visible');
    cy.contains('Persian Cat').should('be.visible');
    cy.contains('Weight').should('be.visible');
    cy.contains('5.5 kg').should('be.visible');
    cy.contains('Fur Type').should('be.visible');
    cy.contains('Long').should('be.visible');
    cy.contains('Fur Color').should('be.visible');
    cy.contains('White').should('be.visible');

    cy.contains('Notes').should('be.visible');
    cy.contains('Fluffy is a very friendly cat who loves to play.').should('be.visible');

    cy.contains('button', 'Edit').should('be.visible');
    cy.contains('button', 'Delete').should('be.visible');

    cy.contains('Pet Diary').should('be.visible');
    cy.contains('Medical History').should('be.visible');
  });

  it('should navigate to edit page when clicking Edit button', () => {
    cy.contains('button', 'Edit').click();
    cy.url().should('include', '/customer/pet/edit/123');
  });

  it('should navigate to add pet page when clicking Add New Pet button', () => {
    cy.contains('button', 'Add New Pet').click();
    cy.url().should('include', '/customer/pet/add');
  });

  it('should navigate to pet diary page when clicking Pet Diary button', () => {
    cy.contains('Pet Diary').click();
    cy.url().should('include', '/customer/pet-diaries/123');
  });

  it('should navigate to medical history page when clicking Medical History button', () => {
    cy.contains('Medical History').click();
    cy.url().should('include', '/list/123');
  });

  it('should show confirmation dialog when clicking Delete button and confirm deletion', () => {
    cy.intercept('DELETE', '**/api/pet/123', {
      statusCode: 200,
      body: { flag: true, message: 'The pet has been deleted.' }
    }).as('deletePet');

    cy.contains('button', 'Delete').click();

    cy.contains('Are you sure?').should('be.visible');
    cy.contains('Do you want to delete this pet?').should('be.visible');

    cy.contains('.swal2-confirm', 'Delete').click({ force: true });

    cy.wait('@deletePet', { timeout: 10000 });

    cy.contains('Deleted!').should('be.visible');
    cy.contains('The pet has been deleted.').should('be.visible');

    cy.url().should('include', '/customer/pet');
  });

  it('should show confirmation dialog when clicking Delete button and cancel deletion', () => {
    cy.contains('button', 'Delete').click();

    cy.contains('Are you sure?').should('be.visible');
    cy.contains('Do you want to delete this pet?').should('be.visible');

    cy.contains('button', 'Cancel').click();

    cy.contains('Are you sure?').should('not.exist');
    cy.url().should('include', '/customer/pet/123');
  });

  it('should handle delete error correctly', () => {
    cy.intercept('DELETE', '**/api/pet/123', {
      statusCode: 400,
      body: { flag: false, message: 'Cannot delete this pet because it has active bookings.' }
    }).as('deletePetError');

    cy.contains('button', 'Delete').click();
    cy.contains('.swal2-confirm', 'Delete').click({ force: true });

    cy.wait('@deletePetError', { timeout: 10000 });

    cy.contains('Error!').should('be.visible');
    cy.contains('Cannot delete this pet because it has active bookings.').should('be.visible');
  });

  it('should have responsive design for pet details', () => {
    cy.viewport('iphone-x');
    cy.contains('Pet Profile').should('be.visible');
    cy.get('.container').should('have.css', 'flex-direction', 'row');

    cy.viewport('ipad-2');
    cy.contains('Pet Profile').should('be.visible');

    cy.viewport(1280, 800);
    cy.contains('Pet Profile').should('be.visible');
  });
});
