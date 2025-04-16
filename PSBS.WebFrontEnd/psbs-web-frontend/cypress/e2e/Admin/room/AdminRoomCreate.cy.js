describe('Room Create Page', () => {
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

    cy.intercept('GET', '**/api/RoomType/available', {
      statusCode: 200,
      body: {
        flag: true,
        data: [
          {
            roomTypeId: 'type1',
            name: 'Standard Room',
            price: 500000,
            description: 'Basic room with essential amenities'
          },
          {
            roomTypeId: 'type2',
            name: 'Deluxe Room',
            price: 800000,
            description: 'Spacious room with premium amenities'
          },
          {
            roomTypeId: 'type3',
            name: 'Suite',
            price: 1200000,
            description: 'Luxury suite with separate living area'
          }
        ]
      }
    }).as('getRoomTypes');

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

    cy.visit('http://localhost:3000/room/add', {
      onBeforeLoad: (win) => {
        if (!win.sessionStorage.getItem('token')) {
          win.sessionStorage.setItem('token', 'dummy-test-token');
        }
      },
      timeout: 30000
    });
  });

  it('should have responsive design', () => {
    cy.viewport('iphone-x');
    cy.contains('Create New Room').should('be.visible');

    cy.viewport('ipad-2');
    cy.contains('Create New Room').should('be.visible');

    cy.viewport(1280, 800);
    cy.contains('Create New Room').should('be.visible');
  });

  it('should display the create room form correctly', () => {
    cy.contains('h1', 'Create New Room').should('be.visible');

    cy.get('input').should('have.length.at.least', 2);
    cy.get('textarea').should('exist');

    cy.get('img[alt="Preview"]').should('be.visible');

    cy.get('[aria-haspopup="listbox"]').click();

    cy.get('ul[role="listbox"]').within(() => {
      cy.contains('Standard Room').should('be.visible');
      cy.contains('Deluxe Room').should('be.visible');
      cy.contains('Suite').should('be.visible');
    });

    cy.get('body').click();
  });

  it('should validate required fields', () => {
    cy.contains('button', 'Create Room').click();

    cy.contains('Room Name is required').should('be.visible');
    cy.contains('Room Type is required').should('be.visible');
    cy.contains('Description is required').should('be.visible');

    cy.contains('label', 'Room Name').parent().find('input').type('Deluxe Room');
    cy.get('.MuiSelect-select').click();
    cy.contains('.MuiMenuItem-root', 'Standard Room').click();
    cy.contains('label', 'Description').parent().find('textarea').first().type('A cozy room with sea view.');

    cy.contains('button', 'Create Room').click();

    cy.contains('Room Image is required').should('be.visible');
  });

  it('should handle duplicate room name error when creating a room', () => {
    cy.intercept('POST', '**/api/Room', {
      statusCode: 400,
      body: {
        flag: false,
        message: 'Room with name 1 already exists!'
      }
    }).as('createRoomError');

    cy.contains('label', 'Room Name').parent().find('input').clear().type('Room 1');

    cy.get('.MuiSelect-select').click();
    cy.contains('.MuiMenuItem-root', 'Standard Room').click();

    cy.contains('label', 'Description').parent().find('textarea').first().type('A cozy room with sea view.');

    cy.fixture('images/test-pet.jpg', 'base64').then(fileContent => {
      const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
      const fileName = 'test-pet.jpg';

      cy.get('input[type="file"]').attachFile({
        fileContent: testFile,
        fileName: fileName,
        mimeType: 'image/jpeg'
      });

      cy.get('img[alt="Preview"]').should('be.visible');
    });

    cy.contains('button', 'Create Room').click();

    cy.wait('@createRoomError');

    cy.contains('Room with name 1 already exists!').should('be.visible');
  });

  it('should select a room type and display its price', () => {
    cy.get('.MuiSelect-select').click();
    cy.contains('.MuiMenuItem-root', 'Deluxe Room').click();
    cy.contains('label', 'Room Price').parent().find('input').invoke('val').should('contain', '800.000');
  });

  it('should handle image upload', () => {
    cy.fixture('images/test-pet.jpg', 'base64').then(fileContent => {
      const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
      const fileName = 'test-pet.jpg';

      cy.get('input[type="file"]').attachFile({
        fileContent: testFile,
        fileName: fileName,
        mimeType: 'image/jpeg'
      });

      cy.get('img[alt="Preview"]').should('be.visible');
    });
  });

  it('should reject invalid file types', () => {
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

      cy.contains('.swal2-popup', 'Only accept image files!').should('be.visible');
    });
  });

  it('should submit the form successfully', () => {
    cy.intercept('POST', '**/api/Room', {
      statusCode: 201,
      body: {
        flag: true,
        message: 'Room Created Successfully!'
      }
    }).as('createRoom');

    cy.contains('label', 'Room Name').parent().find('input').type('Deluxe Room');
    cy.get('.MuiSelect-select').click();
    cy.contains('.MuiMenuItem-root', 'Standard Room').click();
    cy.contains('label', 'Description').parent().find('textarea').first().type('A cozy room with sea view.');

    cy.fixture('images/test-pet.jpg', 'base64').then(fileContent => {
      const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
      const fileName = 'test-pet.jpg';

      cy.get('input[type="file"]').attachFile({
        fileContent: testFile,
        fileName: fileName,
        mimeType: 'image/jpeg'
      });

      cy.get('img[alt="Preview"]').should('be.visible');
    });

    cy.contains('button', 'Create Room').click();

    cy.wait('@createRoom');

    cy.contains('Room Created Successfully!').should('be.visible');

    cy.url().should('include', '/room');
  });

  it('should navigate back when cancel button is clicked', () => {
    cy.contains('button', 'Cancel').click();
    cy.url().should('include', '/room');
  });

  it('should navigate back when back button is clicked', () => {
    cy.get('button').first().click();
    cy.url().should('include', '/room');
  });
});
