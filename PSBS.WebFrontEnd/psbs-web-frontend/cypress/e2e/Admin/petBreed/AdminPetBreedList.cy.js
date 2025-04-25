describe('Pet Breed List Page', () => {
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

    cy.intercept('GET', '**/api/PetBreed', {
      statusCode: 200,
      body: {
        data: [
          {
            petBreedId: 'breed1',
            petBreedName: 'Golden Retriever',
            petTypeId: 'type1',
            petBreedDescription: 'A friendly and intelligent dog breed',
            isDelete: false
          },
          {
            petBreedId: 'breed2',
            petBreedName: 'Siamese Cat',
            petTypeId: 'type2',
            petBreedDescription: 'An elegant and social cat breed',
            isDelete: true
          }
        ]
      }
    }).as('getPetBreeds');

    cy.intercept('GET', '**/api/PetType', {
      statusCode: 200,
      body: {
        data: [
          { petType_ID: 'type1', petType_Name: 'Dog', isDelete: false },
          { petType_ID: 'type2', petType_Name: 'Cat', isDelete: false }
        ]
      }
    }).as('getPetTypes');

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

    cy.visit('http://localhost:3000/petBreed', {
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
    cy.contains('Pet Breed List').should('be.visible');

    cy.viewport('ipad-2');
    cy.contains('Pet Breed List').should('be.visible');

    cy.viewport(1280, 800);
    cy.contains('Pet Breed List').should('be.visible');
  });

  it('should display the pet breed list correctly', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.contains('h1', 'Pet Breed List').should('be.visible');

    cy.contains('button', 'NEW').should('be.visible');

    cy.contains('Golden Retriever').should('be.visible');
    cy.contains('Siamese Cat').should('be.visible');
    cy.contains('Dog').should('be.visible');
    cy.contains('Cat').should('be.visible');
    cy.contains('A friendly and intelligent dog breed').should('be.visible');
    cy.contains('An elegant and social cat breed').should('be.visible');

    cy.contains('div', 'Active')
      .should('have.css', 'color')
      .and('match', /rgb\(0,\s*128,\s*0\)|green/);

    cy.contains('div', 'Inactive')
      .should('have.css', 'color')
      .and('match', /rgb\(255,\s*0,\s*0\)|red/);
  });

  it('should navigate to add pet breed page when clicking NEW button', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.contains('button', 'NEW').click();
    cy.url().should('include', '/petBreed/add');
  });

  it('should navigate to pet breed details page when clicking info button', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.get('.MuiDataGrid-row')
      .first()
      .find('button')
      .eq(0)
      .click({ force: true });

    cy.url().should('include', '/petBreed/breed1');
  });

  it('should navigate to edit page when clicking edit button', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.get('.MuiDataGrid-row')
      .first()
      .find('button')
      .eq(1)
      .click();

    cy.url().should('include', '/petBreed/edit/breed1');
  });

  it('should show confirmation dialog when clicking delete button for active pet breed', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.intercept('DELETE', '**/api/PetBreed/breed1', {
      statusCode: 200,
      body: { message: 'The pet breed has been deleted.' }
    }).as('deletePetBreed');

    cy.get('.MuiDataGrid-row')
      .first()
      .find('button')
      .eq(2)
      .click();

    cy.contains('Are you sure?').should('be.visible');
    cy.contains('Do you want to delete this item?').should('be.visible');

    cy.contains('button', 'Delete').click();

    cy.wait('@deletePetBreed', { timeout: 10000 });

    cy.contains('Deleted!').should('be.visible');
    cy.contains('The pet breed has been deleted.').should('be.visible');
  });

  it('should show confirmation dialog when clicking delete button for inactive pet breed', () => {
    cy.intercept('DELETE', '**/api/PetBreed/breed2', {
      statusCode: 200,
      body: { message: 'The pet breed has been deleted.' }
    }).as('deleteInactivePetBreed');

    cy.get('.MuiDataGrid-row').eq(1).find('button').eq(2).click();

    cy.contains('Are you sure?').should('be.visible');
    cy.contains('Do you want to delete this item?').should('be.visible');

    cy.contains('button', 'Delete').click();

    cy.wait('@deleteInactivePetBreed', { timeout: 10000 });

    cy.contains('Deleted!').should('be.visible');
    cy.contains('The pet breed has been deleted.').should('be.visible');
  });

  it('should handle delete error correctly', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.intercept('DELETE', '**/api/PetBreed/breed1', {
      statusCode: 400,
      body: { message: 'Cannot delete this pet breed because it has associated pets.' }
    }).as('deletePetBreedError');

    cy.get('.MuiDataGrid-row')
      .first()
      .find('button')
      .eq(2)
      .click();

    cy.contains('button', 'Delete').click();

    cy.wait('@deletePetBreedError', { timeout: 10000 });

    cy.contains('Error!').should('be.visible');
    cy.contains('Cannot delete this pet breed because it has associated pets.').should('be.visible');
  });

  it('should handle network error during delete operation', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.intercept('DELETE', '**/api/PetBreed/breed1', {
      forceNetworkError: true
    }).as('networkError');

    cy.get('.MuiDataGrid-row')
      .first()
      .find('button')
      .eq(2)
      .click();

    cy.contains('button', 'Delete').click();

    cy.wait('@networkError', { timeout: 10000 });

    cy.contains('Error!').should('be.visible');
    cy.contains('Failed to delete the pet breed.').should('be.visible');
  });

  it('should handle server error during delete operation', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.intercept('DELETE', '**/api/PetBreed/breed1', {
      statusCode: 500,
      body: { message: 'Internal server error' }
    }).as('serverError');

    cy.get('.MuiDataGrid-row')
      .first()
      .find('button')
      .eq(2)
      .click();

    cy.contains('button', 'Delete').click();

    cy.wait('@serverError', { timeout: 10000 });

    cy.contains('Error!').should('be.visible');
    cy.contains('Internal server error').should('be.visible');
  });

  it('should handle empty pet breed list', () => {
    cy.intercept('GET', '**/api/PetBreed', {
      statusCode: 200,
      body: {
        data: []
      }
    }).as('getEmptyPetBreeds');

    cy.reload();
    cy.wait('@getEmptyPetBreeds');

    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');
    cy.get('.MuiDataGrid-overlay').should('contain', 'No rows');
  });

  it('should handle unknown pet type correctly', () => {
    cy.intercept('GET', '**/api/PetBreed', {
      statusCode: 200,
      body: {
        data: [
          {
            petBreedId: 'breed3',
            petBreedName: 'Unknown Type Breed',
            petTypeId: 'nonexistent',
            petBreedDescription: 'A breed with unknown type',
            isDelete: false
          }
        ]
      }
    }).as('getUnknownTypePetBreed');

    cy.reload();
    cy.wait('@getUnknownTypePetBreed');

    cy.contains('Unknown Type Breed').should('be.visible');
    cy.contains('Unknown').should('be.visible');
  });

  it('should handle API error when fetching pet breeds', () => {
    cy.intercept('GET', '**/api/PetBreed', {
      statusCode: 500,
      body: {
        message: 'Internal server error'
      }
    }).as('getPetBreedsError');

    cy.reload();
    cy.wait('@getPetBreedsError');

    cy.get('.MuiDataGrid-root').should('be.visible');
    cy.get('.MuiDataGrid-overlay').should('contain', 'No rows');
  });

  it('should handle API error when fetching pet types', () => {
    cy.intercept('GET', '**/api/PetType', {
      statusCode: 500,
      body: {
        message: 'Internal server error'
      }
    }).as('getPetTypesError');

    cy.reload();
    cy.wait('@getPetTypesError');

    cy.contains('Golden Retriever').should('be.visible');
    cy.contains('Unknown').should('be.visible');
  });
});