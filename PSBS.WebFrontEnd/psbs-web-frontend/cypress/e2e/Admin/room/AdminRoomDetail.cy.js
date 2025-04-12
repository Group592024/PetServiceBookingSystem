describe('Room Detail Page', () => {
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

    cy.intercept('GET', '**/api/Room/1', {
      statusCode: 200,
      body: {
        flag: true,
        data: {
          roomId: '1',
          roomName: 'Room 101',
          roomTypeId: 'type1',
          status: 'Free',
          description: 'A comfortable standard room with a beautiful view of the garden. Features include a queen-sized bed, private bathroom, air conditioning, and complimentary Wi-Fi.',
          roomImage: '/images/rooms/room101.jpg',
          isDeleted: false
        }
      }
    }).as('getRoom');

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

    cy.intercept('GET', '**/facility-service/images/rooms/room101.jpg', {
      statusCode: 200,
      fixture: 'images/test-pet.jpg'
    }).as('getRoomImage');

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

    cy.visit('http://localhost:3000/room/1', {
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
    cy.contains('Room Detail').should('be.visible');

    cy.viewport('ipad-2');
    cy.contains('Room Detail').should('be.visible');

    cy.viewport(1280, 800);
    cy.contains('Room Detail').should('be.visible');
  });

  it('should display room details correctly', () => {
    cy.wait('@getRoom');
    cy.wait('@getRoomType');

    cy.contains('h1', 'Room Detail').should('be.visible');

    cy.contains('Name:').should('be.visible');
    cy.contains('Room 101').should('be.visible');

    cy.contains('Type:').should('be.visible');
    cy.contains('Standard Room').should('be.visible');

    cy.contains('Price:').should('be.visible');
    cy.contains('500.000').should('be.visible');
    cy.contains('₫').should('be.visible');

    cy.contains('Description:').should('be.visible');
    cy.contains('A comfortable standard room with a beautiful view of the garden').should('be.visible');

    cy.contains('Status:').scrollIntoView().should('be.visible');
    cy.contains('Free').should('be.visible')
      .should('have.css', 'color')
      .and('match', /rgb\(22,\s*163,\s*74\)|#16a34a/);

    cy.contains('Available:').should('be.visible');
    cy.contains('Active').should('be.visible')
      .should('have.css', 'color')
      .and('match', /rgb\(22,\s*163,\s*74\)|#16a34a/);

    cy.get('img[alt="Room 101"]').should('be.visible');
  });

  it('should display different status colors correctly', () => {
    cy.intercept('GET', '**/api/Room/1', {
      statusCode: 200,
      body: {
        flag: true,
        data: {
          roomId: '1',
          roomName: 'Room 101',
          roomTypeId: 'type1',
          status: 'In Use',
          description: 'A comfortable standard room with a beautiful view of the garden.',
          roomImage: '/images/rooms/room101.jpg',
          isDeleted: false
        }
      }
    }).as('getRoomInUse');

    cy.reload();
    cy.wait('@getRoomInUse');
    cy.wait('@getRoomType');

    cy.contains('In Use').should('be.visible')
      .should('have.css', 'color')
      .and('match', /rgb\(234,\s*88,\s*12\)|#ea580c/);

    cy.intercept('GET', '**/api/Room/1', {
      statusCode: 200,
      body: {
        flag: true,
        data: {
          roomId: '1',
          roomName: 'Room 101',
          roomTypeId: 'type1',
          status: 'Maintenance',
          description: 'A comfortable standard room with a beautiful view of the garden.',
          roomImage: '/images/rooms/room101.jpg',
          isDeleted: false
        }
      }
    }).as('getRoomMaintenance');

    cy.reload();
    cy.wait('@getRoomMaintenance');
    cy.wait('@getRoomType');

    cy.contains('Maintenance').should('be.visible')
      .should('have.css', 'color')
      .and('match', /rgb\(220,\s*38,\s*38\)|#dc2626/);
  });

  it('should display inactive status correctly', () => {
    cy.intercept('GET', '**/api/Room/1', {
      statusCode: 200,
      body: {
        flag: true,
        data: {
          roomId: '1',
          roomName: 'Room 101',
          roomTypeId: 'type1',
          status: 'Free',
          description: 'A comfortable standard room with a beautiful view of the garden.',
          roomImage: '/images/rooms/room101.jpg',
          isDeleted: true
        }
      }
    }).as('getRoomInactive');

    cy.reload();
    cy.wait('@getRoomInactive');
    cy.wait('@getRoomType');

    cy.contains('Inactive').scrollIntoView().should('be.visible')
      .should('have.css', 'color')
      .and('match', /rgb\(220,\s*38,\s*38\)|#dc2626/);
  });

  it('should handle missing room type data', () => {
    cy.intercept('GET', '**/api/RoomType/type1', {
      statusCode: 404,
      body: {
        flag: false,
        message: 'Room type not found'
      }
    }).as('getRoomTypeError');

    cy.reload();
    cy.wait('@getRoom');
    cy.wait('@getRoomTypeError');

    cy.contains('Type:').parent().contains('Unknown').should('be.visible');
  });

  it('should handle API errors', () => {
    cy.intercept('GET', '**/api/Room/1', {
      statusCode: 404,
      body: {
        flag: false,
        message: 'Room not found'
      }
    }).as('getRoomError');

    cy.reload();
    cy.wait('@getRoomError');

    cy.contains('Failed to fetch room details').should('be.visible');
  });

  it('should navigate back when back button is clicked', () => {
    cy.wait('@getRoom');
    cy.wait('@getRoomType');

    cy.intercept('GET', '**/room', {
      statusCode: 200,
      body: '<html><body>Room List Page</body></html>'
    }).as('roomList');

    cy.get('button').first().click();

    cy.url().should('include', '/room');
  });
});
