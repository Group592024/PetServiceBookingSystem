describe('Room List Page', () => {
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

    cy.intercept('GET', '**/api/Room', {
      statusCode: 200,
      body: {
        data: [
          {
            roomId: '1',
            roomName: 'Room 101',
            roomTypeId: 'type1',
            status: 'Free',
            description: 'Standard room with a view',
            roomImage: '/images/rooms/room101.jpg',
            isDeleted: false
          },
          {
            roomId: '2',
            roomName: 'Room 102',
            roomTypeId: 'type2',
            status: 'In Use',
            description: 'Deluxe room with balcony',
            roomImage: '/images/rooms/room102.jpg',
            isDeleted: false
          },
          {
            roomId: '3',
            roomName: 'Room 103',
            roomTypeId: 'type1',
            status: 'Maintenance',
            description: 'Standard room under renovation',
            roomImage: '/images/rooms/room103.jpg',
            isDeleted: true
          }
        ]
      }
    }).as('getRooms');

    cy.intercept('GET', '**/api/RoomType', {
      statusCode: 200,
      body: {
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

    cy.visit('http://localhost:3000/room', {
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
    cy.contains('Room List').should('be.visible');

    cy.viewport('ipad-2');
    cy.contains('Room List').should('be.visible');

    cy.viewport(1280, 800);
    cy.contains('Room List').should('be.visible');
  });

  it('should display the room list correctly', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.contains('h1', 'Room List').should('be.visible');

    cy.contains('button', 'NEW').should('be.visible');

    cy.contains('Room 101').should('be.visible');
    cy.contains('Room 102').should('be.visible');
    cy.contains('Standard Room').should('be.visible');
    cy.contains('Deluxe Room').should('be.visible');
    cy.contains('500.000').should('be.visible');

    cy.contains('div', 'Free')
      .should('have.css', 'color')
      .and('match', /rgb\(0,\s*128,\s*0\)|green/);

    cy.contains('div', 'In Use')
      .should('have.css', 'color')
      .and('match', /rgb\(255,\s*165,\s*0\)|#FFA500/);

    cy.contains('div', 'Maintenance')
      .should('have.css', 'color')
      .and('match', /rgb\(255,\s*0,\s*0\)|red/);

    cy.contains('div', 'Active')
      .should('have.css', 'color')
      .and('match', /rgb\(0,\s*128,\s*0\)|green/);

    cy.contains('div', 'Inactive')
      .should('have.css', 'color')
      .and('match', /rgb\(255,\s*0,\s*0\)|red/);
  });

  it('should navigate to add room page when clicking NEW button', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.contains('button', 'NEW').click();
    cy.url().should('include', '/room/add');
  });

  it('should navigate to room details page when clicking info button', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.get('.MuiDataGrid-row')
      .first()
      .find('button')
      .eq(0)
      .click({ force: true });

    cy.url().should('include', '/room/');
  });

  it('should navigate to edit page when clicking edit button', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.get('.MuiDataGrid-row')
      .first()
      .find('button')
      .eq(1)
      .click();

    cy.url().should('include', '/room/edit/');
  });

  it('should show confirmation dialog when clicking delete button for soft-deleted room', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.intercept('DELETE', '**/api/Room/*', {
      statusCode: 200,
      body: { message: 'The room has been deleted.' }
    }).as('deleteRoom');

    cy.get('.MuiDataGrid-row')
      .first()
      .find('button')
      .eq(2)
      .click();

    cy.contains('Are you sure?').should('be.visible');
    cy.contains('Do you want to delete this item?').should('be.visible');

    cy.contains('button', 'Delete').click();

    cy.wait('@deleteRoom', { timeout: 10000 });

    cy.contains('Deleted!').should('be.visible');
    cy.contains('The room has been deleted.').should('be.visible');
  });

  it('should show confirmation dialog when clicking delete button for hard-deleted room', () => {
    cy.intercept('DELETE', '**/api/Room/*', {
      statusCode: 200,
      body: { message: 'The room has been deleted.' }
    }).as('hardDeleteRoom');

    cy.get('.MuiDataGrid-row').eq(2).find('button').eq(2).click();

    cy.contains('Are you sure?').should('be.visible');
    cy.contains('Do you want to delete this item?').should('be.visible');

    cy.contains('button', 'Delete').click();

    cy.wait('@hardDeleteRoom', { timeout: 10000 });

    cy.contains('Deleted!').should('be.visible');
    cy.contains('The room has been deleted.').should('be.visible');

    cy.get('.MuiDataGrid-root').within(() => {
      cy.contains('Deleted Room').should('not.exist');
    });
  });

  it('should show error when hard delete fails due to room history', () => {
    cy.intercept('DELETE', '**/api/Room/*', {
      statusCode: 400,
      body: { message: 'Cannot delete room with history' }
    }).as('hardDeleteFail');

    cy.get('.MuiDataGrid-row').eq(2).find('button').eq(2).click();

    cy.contains('Are you sure?').should('be.visible');
    cy.contains('Do you want to delete this item?').should('be.visible');

    cy.contains('button', 'Delete').click();

    cy.wait('@hardDeleteFail', { timeout: 10000 });

    cy.contains('Error!').should('be.visible');
    cy.contains('Cannot delete room with history').should('be.visible');
  });

  it('should handle delete error correctly', () => {
    cy.get('.MuiDataGrid-root', { timeout: 15000 }).should('be.visible');

    cy.intercept('DELETE', '**/api/Room/*', {
      statusCode: 400,
      body: { message: 'Failed to delete the room.' }
    }).as('deleteRoomError');

    cy.get('.MuiDataGrid-row')
      .first()
      .find('button')
      .eq(2)
      .click();

    cy.contains('button', 'Delete').click();

    cy.wait('@deleteRoomError', { timeout: 10000 });

    cy.contains('Error!').should('be.visible');
    cy.contains('Failed to delete the room.').should('be.visible');
  });
});
