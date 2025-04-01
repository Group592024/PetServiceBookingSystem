describe('Pet Detail Page', () => {
  beforeEach(() => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxOTE2MjM5MDIyfQ.N_ZJ0o3V9MxIZuGPmXJBLK9jn-kK3fXQjpwLBLc4d5A';

    cy.window().then((win) => {
      win.sessionStorage.setItem('token', validToken);
    });

    let petId = '1';
    let isDeleted = false;

    if (Cypress.currentTest.title.includes('hard')) {
      petId = '2';
      isDeleted = true;
    }

    cy.intercept('GET', `**/api/Pet/${petId}`, {
      statusCode: 200,
      body: {
        data: {
          petId: petId,
          petName: petId === '1' ? 'Buddy' : 'Max',
          petImage: petId === '1' ? '/images/pets/buddy.jpg' : '/images/pets/max.jpg',
          accountId: 'acc1',
          petBreedId: 'breed1',
          dateOfBirth: '2020-01-01T00:00:00',
          petGender: true,
          petWeight: 15,
          petFurType: 'Long',
          petFurColor: 'Golden',
          petNote: 'Friendly and playful dog',
          isDelete: isDeleted
        }
      }
    }).as('getPetDetail');

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

    cy.intercept('GET', '**/api/auth/**', {
      statusCode: 200,
      body: { isValid: true }
    });

    cy.intercept('**/unauthorized*', (req) => {
      req.reply(200, 'Intercepted unauthorized redirect');
    });

    cy.visit(`http://localhost:3000/pet/${petId}`, {
      onBeforeLoad: (win) => {
        win.sessionStorage.setItem('token', validToken);
      }
    });
  });

  it('should have responsive design', () => {
    cy.viewport('iphone-x');
    cy.contains('Pet Profile').should('be.visible');

    cy.viewport('ipad-2');
    cy.contains('Pet Profile').should('be.visible');

    cy.viewport(1280, 800);
    cy.contains('Pet Profile').should('be.visible');
  });

  it('should display pet details correctly', () => {
    cy.wait(['@getPetDetail', '@getAccounts', '@getBreeds']);

    cy.contains('h1', 'Pet Profile').should('be.visible');

    cy.get('img[alt="Pet"]')
      .should('be.visible')
      .and('have.attr', 'src')
      .and('include', '/pet-service/images/pets/buddy.jpg');

    cy.contains('Buddy').scrollIntoView().should('be.visible');
    cy.contains('♂ Male').should('be.visible');
    cy.contains('01/01/2020').should('be.visible');
    cy.contains('John Doe').should('be.visible');

    cy.contains('Golden Retriever').should('be.visible');
    cy.contains('15 kg').should('be.visible');
    cy.contains('Long').should('be.visible');
    cy.contains('Golden').should('be.visible');

    cy.contains('Friendly and playful dog').scrollIntoView().should('be.visible');

    cy.contains('Active Pet').should('be.visible');

    cy.contains('button', 'Pet Diary').should('be.visible');
    cy.contains('button', 'Health Book').should('be.visible');
    cy.contains('button', 'Edit Pet').should('be.visible');
    cy.contains('button', 'Delete Pet').should('be.visible');
  });

  it('should navigate back when clicking the back button', () => {
    cy.wait(['@getPetDetail', '@getAccounts', '@getBreeds']);

    cy.get('button').find('svg').first().click();

    cy.go('back');
    cy.wait(500);
    cy.url().should('include', '/pet');
  });

  it('should navigate to edit page when clicking Edit Pet button', () => {
    cy.wait(['@getPetDetail', '@getAccounts', '@getBreeds']);

    cy.contains('button', 'Edit Pet').click();

    cy.url().should('include', '/pet/edit/1');
  });

  // it('should navigate to pet diary when clicking Pet Diary button', () => {
  //   cy.wait(['@getPetDetail', '@getAccounts', '@getBreeds']);

  //   // Click the Pet Diary button
  //   cy.contains('button', 'Pet Diary').click();

  //   // Check if navigation to pet diary occurred
  //   cy.url().should('include', '/customer/pet-diaries/1');
  // });

  // it('should navigate to health book when clicking Health Book button', () => {
  //   cy.wait(['@getPetDetail', '@getAccounts', '@getBreeds']);

  //   // Click the Health Book button
  //   cy.contains('button', 'Health Book').click();

  //   // Check if navigation to health book occurred
  //   cy.url().should('include', '/pethealthbook');
  // });

  it('should show confirmation dialog when clicking Delete Pet button for soft-deleted pet', () => {
    cy.wait(['@getPetDetail', '@getAccounts', '@getBreeds']);

    cy.intercept('DELETE', '**/api/Pet/1', {
      statusCode: 200,
      body: { message: 'Pet has been deleted.' }
    }).as('deletePet');

    cy.contains('button', 'Delete Pet').click();

    cy.contains('Are you sure?').should('be.visible');
    cy.contains("You won't be able to revert this!").should('be.visible');

    cy.contains('button', 'Yes, delete it!').click();

    cy.wait('@deletePet');

    cy.contains('Deleted!').should('be.visible');
    cy.contains('The pet has been deleted.').should('be.visible');

    cy.url().should('include', '/pet');
  });

  it('should show confirmation dialog when clicking delete button for hard-deleted pet', () => {
    cy.intercept('DELETE', '**/api/Pet/2', {
      statusCode: 200,
      body: { message: 'Pet has been deleted.' }
    }).as('hardDeletePet');

    cy.contains('button', 'Delete Pet').click();

    cy.contains('Are you sure?').should('be.visible');

    cy.contains('button', 'Yes, delete it!').click();

    cy.wait('@hardDeletePet', { timeout: 10000 });

    cy.contains('Deleted!').should('be.visible');
    cy.contains('The pet has been deleted.').should('be.visible');
  });

  it('should show error when hard delete fails due to existing bookings', () => {
    cy.intercept('DELETE', '**/api/Pet/2', {
      statusCode: 400,
      body: { message: 'Pet cannot be deleted because it has associated bookings.' }
    }).as('hardDeleteFail');

    cy.contains('button', 'Delete Pet').click();

    cy.contains('Are you sure?').should('be.visible');

    cy.contains('button', 'Yes, delete it!').click();

    cy.wait('@hardDeleteFail', { timeout: 10000 });

    cy.contains('Error').should('be.visible');
    cy.contains('Pet cannot be deleted because it has associated bookings.').should('be.visible');
  });

  it('should handle delete error correctly', () => {
    cy.wait(['@getPetDetail', '@getAccounts', '@getBreeds']);

    cy.intercept('DELETE', '**/api/Pet/1', {
      statusCode: 400,
      body: { message: 'Cannot delete this pet.' }
    }).as('deletePetError');

    cy.contains('button', 'Delete Pet').click();

    cy.contains('button', 'Yes, delete it!').click();

    cy.wait('@deletePetError');

    cy.contains('Error').should('be.visible');
    cy.contains('Cannot delete this pet.').should('be.visible');
  });

  it('should display inactive status for deleted pets', () => {
    cy.intercept('GET', '**/api/Pet/1', {
      statusCode: 200,
      body: {
        data: {
          petId: '1',
          petName: 'Buddy',
          petImage: '/images/pets/buddy.jpg',
          accountId: 'acc1',
          petBreedId: 'breed1',
          dateOfBirth: '2020-01-01T00:00:00',
          petGender: true,
          petWeight: 15,
          petFurType: 'Long',
          petFurColor: 'Golden',
          petNote: 'Friendly and playful dog.',
          isDelete: true
        }
      }
    }).as('getDeletedPet');

    cy.reload();

    cy.wait(['@getDeletedPet', '@getAccounts', '@getBreeds']);

    cy.contains('Inactive Pet').scrollIntoView().should('be.visible');
    cy.get('.bg-red-50').should('be.visible');
  });

  it('should handle loading state correctly', () => {
    cy.intercept('GET', '**/api/Pet/1', (req) => {
      req.reply({
        statusCode: 200,
        delay: 1000,
        body: {
          data: {
            petId: '1',
            petName: 'Buddy',
            petImage: '/images/pets/buddy.jpg',
            accountId: 'acc1',
            petBreedId: 'breed1',
            dateOfBirth: '2020-01-01T00:00:00',
            petGender: true,
            isDelete: false
          }
        }
      });
    }).as('getDelayedPet');

    cy.reload();

    cy.contains('Loading...').should('be.visible');

    cy.wait('@getDelayedPet');

    cy.contains('Buddy', { timeout: 5000 }).scrollIntoView().should('be.visible');
  });

  it('should handle pet not found correctly', () => {
    cy.intercept('GET', '**/api/Pet/1', {
      statusCode: 404,
      body: {
        message: 'Pet not found'
      }
    }).as('getPetNotFound');

    cy.reload();

    cy.wait('@getPetNotFound');

    cy.contains('Error').should('be.visible');
    cy.contains('Pet not found').should('be.visible');
  });
});
