describe('Room Edit Page', () => {
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

    cy.intercept('GET', '**/api/RoomType/type1', {
      statusCode: 200,
      body: {
        flag: true,
        data: {
          roomTypeId: 'type1',
          name: 'Standard Room',
          price: 500000,
          description: 'Basic room with essential amenities'
        }
      }
    }).as('getRoomType');

    cy.intercept('GET', '**/api/Room/1', {
      statusCode: 200,
      body: {
        flag: true,
        data: {
          roomId: '1',
          roomName: 'Room 101',
          roomTypeId: 'type1',
          status: 'Free',
          description: 'Standard room with a view',
          roomImage: '/images/rooms/room101.jpg',
          isDeleted: false
        }
      }
    }).as('getRoom');

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

    cy.intercept('GET', '**/facility-service/images/rooms/room101.jpg', {
      statusCode: 200,
      fixture: 'images/test-pet.jpg'
    }).as('getRoomImage');

    cy.visit('http://localhost:3000/room/edit/1', {
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
    cy.contains('Edit Room').should('be.visible');

    cy.viewport('ipad-2');
    cy.contains('Edit Room').should('be.visible');

    cy.viewport(1280, 800);
    cy.contains('Edit Room').should('be.visible');
  });

  it('should load room data correctly', () => {
    cy.contains('h1', 'Edit Room').should('be.visible');
    cy.get('input[value="Room 101"]').should('exist');
    cy.contains('label', 'Room Price').parent().find('input').invoke('val').should('contain', '500.000');
    cy.get('textarea').should('have.value', 'Standard room with a view');
    cy.get('img[alt="Preview"]').should('be.visible');
  });

  it('should validate required fields', () => {
    cy.get('input[value="Room 101"]').should('exist');
    cy.get('input[value="Room 101"]').clear({ force: true });
    cy.contains('button', 'Save Changes').first().click();
    cy.contains('Room Name is required').scrollIntoView().should('be.visible');
  });

  it('should handle duplicate room name error', () => {
    cy.intercept('PUT', '**/api/Room', {
      statusCode: 400,
      body: {
        flag: false,
        message: 'Room with name 1 already exists!'
      }
    }).as('updateRoomError');

    cy.contains('label', 'Room Name').parent().find('input').clear().type('Room 1');

    cy.get('.MuiSelect-select').first().click();
    cy.contains('.MuiMenuItem-root', 'Standard Room').click();

    cy.contains('label', 'Description').parent().find('textarea').first().type('Test duplicate name.');

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

    cy.contains('button', 'Save Changes').click();

    cy.contains('Are you sure?').should('be.visible');
    cy.contains('button', 'Update').click();

    cy.wait('@updateRoomError');

    cy.contains('Room with name 1 already exists!').should('be.visible');
  });

  it('should change room status', () => {
    cy.get('label').contains('Status').parent().find('div.MuiSelect-select').click({ force: true });
    cy.wait(500);
    cy.get('li').contains('In Use').click();
    cy.wait(500);
    cy.get('label').contains('Status').parent().find('div.MuiSelect-select').should('contain', 'In Use');
  });

  it('should change availability status', () => {
    cy.get('input[value="true"]').check({ force: true });
    cy.get('input[value="true"]').should('be.checked');
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

  it('should submit the form successfully', () => {
    cy.intercept('PUT', '**/api/Room', {
      statusCode: 200,
      body: {
        flag: true,
        message: 'Room Updated Successfully!'
      }
    }).as('updateRoom');
    cy.get('input[value="Room 101"]').clear().type('Room 101 Updated');
    cy.get('.MuiSelect-select').first().click();
    cy.contains('.MuiMenuItem-root', 'Deluxe Room').click();
    cy.get('label').contains('Status').parent().find('div.MuiSelect-select').click();
    cy.get('li').contains('In Use').click();

    cy.contains('button', 'Save Changes').click();

    cy.contains('Are you sure?').should('be.visible');
    cy.contains('button', 'Update').click();

    cy.wait('@updateRoom');

    cy.contains('Room Updated Successfully!').should('be.visible');

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
});
