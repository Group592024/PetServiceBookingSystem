describe('Pet Breed Detail Page', () => {
  beforeEach(() => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxOTE2MjM5MDIyfQ.N_ZJ0o3V9MxIZuGPmXJBLK9jn-kK3fXQjpwLBLc4d5A';

    cy.window().then((win) => {
      win.sessionStorage.setItem('token', validToken);
    });

    const breedId = 'breed1';

    cy.intercept('GET', `**/api/PetBreed/${breedId}`, {
      statusCode: 200,
      body: {
        flag: true,
        data: {
          petBreedId: breedId,
          petBreedName: 'Golden Retriever',
          petTypeId: 'type1',
          petBreedDescription: 'A friendly and intelligent dog breed that is great with families and children. Known for their golden coat and loyal temperament.',
          petBreedImage: '/Images/golden-retriever.jpg',
          isDelete: false
        }
      }
    }).as('getPetBreedDetail');

    cy.intercept('GET', '**/api/PetType/type1', {
      statusCode: 200,
      body: {
        flag: true,
        data: {
          petType_ID: 'type1',
          petType_Name: 'Dog',
          isDelete: false
        }
      }
    }).as('getPetTypeDetail');

    cy.intercept('GET', '**/api/auth/**', {
      statusCode: 200,
      body: { isValid: true }
    });

    cy.intercept('**/unauthorized*', (req) => {
      req.reply(200, 'Intercepted unauthorized redirect');
    });

    cy.visit(`http://localhost:3000/petBreed/${breedId}`, {
      onBeforeLoad: (win) => {
        win.sessionStorage.setItem('token', validToken);
      }
    });
  });

  it('should have responsive design', () => {
    cy.viewport('iphone-x');
    cy.contains('Pet Breed Detail').should('be.visible');

    cy.viewport('ipad-2');
    cy.contains('Pet Breed Detail').should('be.visible');

    cy.viewport(1280, 800);
    cy.contains('Pet Breed Detail').should('be.visible');
  });

  it('should display pet breed details correctly', () => {
    cy.wait(['@getPetBreedDetail', '@getPetTypeDetail']);

    cy.contains('h1', 'Pet Breed Detail').should('be.visible');

    cy.get('img[alt="Golden Retriever"]')
      .should('be.visible')
      .and('have.attr', 'src')
      .and('include', '/pet-service/Images/golden-retriever.jpg');

    cy.contains('label', 'Breed Name').parent().find('input').should('have.value', 'Golden Retriever');
    cy.contains('label', 'Pet Type').parent().find('input').should('exist').should('have.value', 'Dog');

    cy.get('textarea').should('have.value', 'A friendly and intelligent dog breed that is great with families and children. Known for their golden coat and loyal temperament.');

    cy.contains('Active').scrollIntoView().should('be.visible');
    cy.get('.bg-emerald-50').should('be.visible');
    cy.get('.bg-emerald-500').should('be.visible');
  });

  it('should navigate back when clicking the back button', () => {
    cy.wait(['@getPetBreedDetail', '@getPetTypeDetail']);

    cy.get('button').find('svg').first().click();

    cy.url().should('not.include', '/petBreed/breed1');
  });

  it('should display inactive status for deleted pet breeds', () => {
    const breedId = 'breed1';

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
          isDelete: true
        }
      }
    }).as('getDeletedPetBreed');

    cy.reload();

    cy.wait(['@getDeletedPetBreed', '@getPetTypeDetail']);

    cy.contains('Inactive').scrollIntoView().should('be.visible');
    cy.get('.bg-red-50').should('be.visible');
    cy.get('.bg-red-500').should('be.visible');
  });

  it('should handle pet breed not found correctly', () => {
    const breedId = 'breed1';

    cy.intercept('GET', `**/api/PetBreed/${breedId}`, {
      statusCode: 404,
      body: {
        flag: false,
        message: 'Pet breed not found'
      }
    }).as('getPetBreedNotFound');

    cy.reload();

    cy.wait('@getPetBreedNotFound');

    cy.contains('Loading...').should('be.visible');
  });

  it('should handle pet type not found correctly', () => {
    const breedId = 'breed1';

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
    }).as('getPetBreedDetail');

    cy.intercept('GET', '**/api/PetType/type1', {
      statusCode: 404,
      body: {
        flag: false,
        message: 'Pet type not found'
      }
    }).as('getPetTypeNotFound');

    cy.reload();

    cy.wait(['@getPetBreedDetail', '@getPetTypeNotFound']);
    cy.contains('label', 'Pet Type').parent().find('input').should('have.value', 'Unknown');
  });

  it('should handle missing pet type ID correctly', () => {
    const breedId = 'breed1';

    cy.intercept('GET', `**/api/PetBreed/${breedId}`, {
      statusCode: 200,
      body: {
        flag: true,
        data: {
          petBreedId: breedId,
          petBreedName: 'Golden Retriever',
          petBreedDescription: 'A friendly and intelligent dog breed.',
          petBreedImage: '/Images/golden-retriever.jpg',
          isDelete: false
        }
      }
    }).as('getPetBreedWithoutType');

    cy.reload();

    cy.wait('@getPetBreedWithoutType');

    cy.contains('label', 'Pet Type').parent().find('input').should('have.value', 'Unknown');
  });

  it('should handle network errors gracefully', () => {
    const breedId = 'breed1';

    cy.intercept('GET', `**/api/PetBreed/${breedId}`, {
      forceNetworkError: true
    }).as('networkError');

    cy.window().then(win => {
      cy.stub(win.console, 'error').callsFake(() => { });
    });

    cy.reload();

    cy.wait('@networkError');

    cy.contains('Loading...').should('be.visible');
  });

  it('should handle malformed response data correctly', () => {
    const breedId = 'breed1';

    cy.intercept('GET', `**/api/PetBreed/${breedId}`, {
      statusCode: 200,
      body: {
        flag: true,
        message: 'Success'
      }
    }).as('malformedResponse');

    cy.window().then(win => {
      cy.stub(win.console, 'error').callsFake(() => { });
    });

    cy.reload();

    cy.wait('@malformedResponse');

    cy.contains('Loading...').should('be.visible');
  });

  it('should handle server errors gracefully', () => {
    const breedId = 'breed1';

    cy.intercept('GET', `**/api/PetBreed/${breedId}`, {
      statusCode: 500,
      body: {
        flag: false,
        message: 'Internal server error'
      }
    }).as('serverError');

    cy.window().then(win => {
      cy.stub(win.console, 'error').callsFake(() => { });
    });

    cy.reload();

    cy.wait('@serverError');

    cy.contains('Loading...').should('be.visible');
  });

  it('should display image correctly with different image paths', () => {
    const breedId = 'breed1';

    cy.intercept('GET', `**/api/PetBreed/${breedId}`, {
      statusCode: 200,
      body: {
        flag: true,
        data: {
          petBreedId: breedId,
          petBreedName: 'Golden Retriever',
          petTypeId: 'type1',
          petBreedDescription: 'A friendly and intelligent dog breed.',
          petBreedImage: 'https://example.com/images/golden-retriever.jpg',
          isDelete: false
        }
      }
    }).as('getPetBreedWithAbsoluteImage');

    cy.reload();

    cy.wait(['@getPetBreedWithAbsoluteImage', '@getPetTypeDetail']);

    cy.get('img[alt="Golden Retriever"]')
      .should('have.attr', 'src')
      .and('include', 'https://example.com/images/golden-retriever.jpg');

    cy.intercept('GET', `**/api/PetBreed/${breedId}`, {
      statusCode: 200,
      body: {
        flag: true,
        data: {
          petBreedId: breedId,
          petBreedName: 'Golden Retriever',
          petTypeId: 'type1',
          petBreedDescription: 'A friendly and intelligent dog breed.',
          petBreedImage: null,
          isDelete: false
        }
      }
    }).as('getPetBreedWithNullImage');

    cy.reload();

    cy.wait(['@getPetBreedWithNullImage', '@getPetTypeDetail']);

    cy.get('img[alt="Golden Retriever"]')
      .should('have.attr', 'src')
      .and('include', 'http://localhost:5050/pet-service');
  });
});

