describe('Pet List Page', () => {
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

    cy.intercept('GET', '**/api/Pet', {
      statusCode: 200,
      body: {
        data: [
          {
            petId: '1',
            petName: 'Buddy',
            petImage: '/images/pets/buddy.jpg',
            accountId: 'acc1',
            petBreedId: 'breed1',
            dateOfBirth: '2020-01-01T00:00:00',
            petGender: true,
            isDelete: false
          },
          {
            petId: '2',
            petName: 'Max',
            petImage: '/images/pets/max.jpg',
            accountId: 'acc2',
            petBreedId: 'breed2',
            dateOfBirth: '2019-05-15T00:00:00',
            petGender: false,
            isDelete: true
          }
        ]
      }
    }).as('getPets');

    cy.intercept('GET', '**/api/Account/all', {
      statusCode: 200,
      body: {
        data: [
          { accountId: 'acc1', accountName: 'John Doe' },
          { accountId: 'acc2', accountName: 'Jane Smith' }
        ]
      }
    }).as('getAccounts');

    cy.intercept('GET', '**/api/PetBreed', {
      statusCode: 200,
      body: {
        data: [
          { petBreedId: 'breed1', petBreedName: 'Golden Retriever' },
          { petBreedId: 'breed2', petBreedName: 'Siamese Cat' }
        ]
      }
    }).as('getBreeds');

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

    cy.visit('http://localhost:3000/pet', {
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
    cy.contains('Pet List').should('be.visible');

    cy.viewport('ipad-2');
    cy.contains('Pet List').should('be.visible');

    cy.viewport(1280, 800);
    cy.contains('Pet List').should('be.visible');
  });

  it('should display the pet list correctly', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.contains('h1', 'Pet List').should('be.visible');

    cy.contains('button', 'NEW').should('be.visible');

    cy.contains('Buddy').should('be.visible');
    cy.contains('Max').should('be.visible');
    cy.contains('John Doe').should('be.visible');
    cy.contains('Golden Retriever').should('be.visible');

    cy.contains('div', 'Active')
      .should('have.css', 'color')
      .and('match', /rgb\(0,\s*128,\s*0\)|green/);

    cy.contains('div', 'Inactive')
      .should('have.css', 'color')
      .and('match', /rgb\(255,\s*0,\s*0\)|red/);
  });

  it('should navigate to add pet page when clicking NEW button', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.contains('button', 'NEW').click();
    cy.url().should('include', '/pet/add');
  });

  it('should navigate to pet details page when clicking info button', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.get('.MuiDataGrid-row')
      .first()
      .find('button')
      .eq(0)
      .click({ force: true });

    cy.url().should('include', '/pet/');
  });

  it('should navigate to edit page when clicking edit button', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.get('.MuiDataGrid-row')
      .first()
      .find('button')
      .eq(1)
      .click();

    cy.url().should('include', '/pet/edit/');
  });

  it('should show confirmation dialog when clicking delete button for soft-deleted pet', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.intercept('DELETE', '**/api/pet/*', {
      statusCode: 200,
      body: { message: 'Pet has been deleted.' }
    }).as('deletePet');

    cy.get('.MuiDataGrid-row')
      .first()
      .find('button')
      .eq(2)
      .click();

    cy.contains('Are you sure?').should('be.visible');
    cy.contains('Do you want to delete this pet?').should('be.visible');

    cy.contains('button', 'Delete').click();

    cy.wait('@deletePet', { timeout: 10000 });

    cy.contains('Deleted!').should('be.visible');
    cy.contains('Pet has been deleted.').should('be.visible');
  });

  it('should show confirmation dialog when clicking delete button for hard-deleted pet', () => {
    cy.intercept('DELETE', '**/api/pet/*', {
      statusCode: 200,
      body: { message: 'Pet has been deleted.' }
    }).as('hardDeletePet');

    cy.get('.MuiDataGrid-row').eq(1).find('button').eq(2).click();

    cy.contains('Are you sure?').should('be.visible');
    cy.contains('Do you want to delete this pet?').should('be.visible');

    cy.contains('button', 'Delete').click();

    cy.wait('@hardDeletePet', { timeout: 10000 });

    cy.contains('Deleted!').should('be.visible');
    cy.contains('Pet has been deleted.').should('be.visible');

    cy.get('.MuiDataGrid-root').within(() => {
      cy.contains('Max').should('not.exist');
    });
  });

  it('should show error when hard delete fails due to existing bookings', () => {
    cy.intercept('DELETE', '**/api/pet/*', {
      statusCode: 400,
      body: { message: 'Pet cannot be deleted because it has associated bookings.' }
    }).as('hardDeleteFail');

    cy.get('.MuiDataGrid-row').eq(1).find('button').eq(2).click();

    cy.contains('Are you sure?').should('be.visible');
    cy.contains('Do you want to delete this pet?').should('be.visible');

    cy.contains('button', 'Delete').click();

    cy.wait('@hardDeleteFail', { timeout: 10000 });

    cy.contains('Error!').should('be.visible');
    cy.contains('Pet cannot be deleted because it has associated bookings.').should('be.visible');
  });

  it('should handle delete error correctly', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.intercept('DELETE', '**/api/pet/*', {
      statusCode: 400,
      body: { message: 'Cannot delete this pet.' }
    }).as('deletePetError');

    cy.get('.MuiDataGrid-row')
      .first()
      .find('button')
      .eq(2)
      .click();

    cy.contains('button', 'Delete').click();

    cy.wait('@deletePetError', { timeout: 10000 });

    cy.contains('Error!').should('be.visible');
    cy.contains('Cannot delete this pet.').should('be.visible');
  });
});
