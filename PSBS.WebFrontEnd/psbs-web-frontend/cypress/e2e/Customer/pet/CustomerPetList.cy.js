describe('Customer Pet List Page', () => {
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

    cy.window().then((win) => {
      const token = win.sessionStorage.getItem('token');
      expect(token).to.not.be.null;
      expect(token).to.not.be.undefined;
    });

    cy.intercept('GET', '**/api/pet/available/*', {
      statusCode: 200,
      body: {
        flag: true,
        data: [
          {
            petId: '1',
            petName: 'Fluffy',
            petImage: '/images/pets/fluffy.jpg',
            accountId: 'customer-123',
            petBreedId: 'breed1',
            dateOfBirth: '2020-01-01T00:00:00',
            petGender: true,
            isDelete: false
          },
          {
            petId: '2',
            petName: 'Whiskers',
            petImage: '/images/pets/whiskers.jpg',
            accountId: 'customer-123',
            petBreedId: 'breed2',
            dateOfBirth: '2019-05-15T00:00:00',
            petGender: false,
            isDelete: false
          }
        ]
      }
    }).as('getCustomerPets');

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

    cy.visit('http://localhost:3000/customer/pet', {
      onBeforeLoad: (win) => {
        if (!win.sessionStorage.getItem('token')) {
          win.sessionStorage.setItem('token', 'dummy-test-token');
          win.sessionStorage.setItem('accountId', 'customer-123');
          win.sessionStorage.setItem('user', JSON.stringify({
            id: 'customer-123',
            name: 'Customer User',
            role: 'user'
          }));
        }
      },
      timeout: 30000 
    });

    cy.get('.grid', { timeout: 20000 }).should('exist');
  });

  it('should have responsive design for pet list', () => {
    cy.viewport('iphone-x');
    cy.contains('Your Pet Collection').should('be.visible');
    cy.get('.grid').should('have.class', 'grid-cols-1');

    cy.viewport('ipad-2');
    cy.contains('Your Pet Collection').should('be.visible');

    cy.viewport(1280, 800);
    cy.contains('Your Pet Collection').should('be.visible');
  });

  it('should display the customer pet list correctly', () => {
    cy.contains('h1', 'Your Pet Collection').should('be.visible');
    cy.contains('button', 'Add New Pet').should('be.visible');

    cy.contains('Fluffy').should('be.visible');
    cy.contains('Whiskers').should('be.visible');

    cy.contains('Born:').should('be.visible');
  });

  it('should navigate to add pet page when clicking Add New Pet button', () => {
    cy.contains('button', 'Add New Pet').click();
    cy.url().should('include', '/customer/pet/add');
  });

  it('should navigate to pet details page when clicking View button', () => {
    cy.contains('button', 'View').first().click();
    cy.url().should('include', '/customer/pet/1');
  });

  it('should navigate to edit page when clicking Edit button', () => {
    cy.contains('button', 'Edit').first().click();
    cy.url().should('include', '/customer/pet/edit/1');
  });

  it('should show confirmation dialog when clicking delete button', () => {
    cy.intercept('DELETE', '**/api/pet/*', {
      statusCode: 200,
      body: { flag: true, message: 'The pet has been deleted.' }
    }).as('deletePet');

    cy.contains('button', 'Delete').first().click();

    cy.contains('Are you sure?').should('be.visible');
    cy.contains('Do you want to delete this pet?').should('be.visible');

    cy.contains('.swal2-confirm', 'Delete').click({ force: true });

    cy.wait('@deletePet', { timeout: 10000 });

    cy.contains('Deleted!').should('be.visible');
    cy.contains('The pet has been deleted.').should('be.visible');

    cy.contains('Fluffy').should('not.exist');
  });

  it('should handle delete error correctly', () => {
    cy.intercept('DELETE', '**/api/pet/*', {
      statusCode: 400,
      body: { flag: false, message: 'Failed to delete the pet.' }
    }).as('deletePetError');

    cy.contains('button', 'Delete').first().click();

    cy.contains('.swal2-confirm', 'Delete').click({ force: true });

    cy.wait('@deletePetError', { timeout: 10000 });

    cy.contains('Error!').should('be.visible');
    cy.contains('Failed to delete the pet.').should('be.visible');
  });

  it('should display empty state when no pets are available', () => {
    cy.intercept('GET', '**/api/pet/available/*', {
      statusCode: 200,
      body: {
        flag: true,
        data: []
      }
    }).as('getEmptyPets');

    cy.reload();
    cy.wait('@getEmptyPets');

    cy.contains('No Pets Added Yet').should('be.visible');
    cy.contains('Start building your pet collection by adding your first pet').should('be.visible');
    cy.contains('button', 'Add Your First Pet').should('be.visible');
  });

  it('should navigate to add pet page from empty state button', () => {
    cy.intercept('GET', '**/api/pet/available/*', {
      statusCode: 200,
      body: {
        flag: true,
        data: []
      }
    }).as('getEmptyPets');

    cy.reload();
    cy.wait('@getEmptyPets');

    cy.contains('button', 'Add Your First Pet').click();
    cy.url().should('include', '/customer/pet/add');
  });

  it('should handle API error when fetching pets', () => {
    cy.intercept('GET', '**/api/pet/available/*', {
      statusCode: 400,
      body: {
        flag: false,
        message: 'Failed to fetch pets.'
      }
    }).as('getPetsError');

    cy.reload();
    cy.wait('@getPetsError');

    cy.contains('No Pets Added Yet').should('be.visible');
  });
});
