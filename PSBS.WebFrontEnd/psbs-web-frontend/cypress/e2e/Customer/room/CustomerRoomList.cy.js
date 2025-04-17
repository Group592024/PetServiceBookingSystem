describe('Customer Room List Page', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();

    cy.intercept('POST', '**/api/Account/Login').as('loginRequest');

    cy.visit('http://localhost:3000/login');
    cy.get('#email', { timeout: 10000 }).should('be.visible');
    cy.get('#email').type('tranthibich@gmail.com');
    cy.get('#password').type('bich2024');
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

    cy.intercept('GET', '**/api/Room/available', {
      statusCode: 200,
      body: {
        data: [
          {
            roomId: 'room1',
            roomName: 'Luxury Suite 101',
            roomImage: '/Images/room1.jpg',
            roomTypeId: 'type1',
            status: 'Free',
            isDeleted: false
          },
          {
            roomId: 'room2',
            roomName: 'Premium Suite 202',
            roomImage: '/Images/room2.jpg',
            roomTypeId: 'type2',
            status: 'Free',
            isDeleted: false
          },
          {
            roomId: 'room3',
            roomName: 'Deluxe Suite 303',
            roomImage: '/Images/room3.jpg',
            roomTypeId: 'type3',
            status: 'Free',
            isDeleted: false
          }
        ]
      }
    }).as('getRooms');

    cy.intercept('GET', '**/api/RoomType/available', {
      statusCode: 200,
      body: {
        data: [
          { roomTypeId: 'type1', name: 'Luxury Suite', price: 500000, description: 'Our most luxurious accommodation' },
          { roomTypeId: 'type2', name: 'Premium Suite', price: 350000, description: 'Premium comfort for your pet' },
          { roomTypeId: 'type3', name: 'Deluxe Suite', price: 250000, description: 'Comfortable and spacious' }
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

    cy.visit('http://localhost:3000/customerRoom', {
      onBeforeLoad: (win) => {
        if (!win.sessionStorage.getItem('token')) {
          win.sessionStorage.setItem('token', 'dummy-test-token');
          win.sessionStorage.setItem('user', JSON.stringify({
            id: '123',
            name: 'Customer',
            role: 'customer'
          }));
        }
      },
      timeout: 30000
    });

    cy.get('h1', { timeout: 20000 }).contains('Luxury Pet Rooms').should('be.visible');
  });

  it('should display the room list correctly', () => {
    cy.contains('h1', 'Luxury Pet Rooms').should('be.visible');
    cy.contains('p', 'Choose the perfect accommodation for your beloved pet').should('be.visible');

    cy.get('.grid').children().should('have.length', 7);

    cy.contains('Luxury Suite 101').should('be.visible');
    cy.contains('Luxury Suite').should('be.visible');
    cy.contains('500.000 ₫').should('be.visible');
    cy.contains('Free').should('be.visible')
      .should('have.css', 'background-color')
      .and('match', /rgb\(34,\s*197,\s*94\)|rgb\(16,\s*185,\s*129\)/);

    cy.contains('Premium Care').should('be.visible');
    cy.contains('24/7 Support').should('be.visible');
    cy.contains('View Details').should('have.length', 1);
  });

  it('should filter rooms by selected room type', () => {
    cy.get('select').eq(0).select('Premium Suite');
    cy.get('.grid').children().should('have.length', 5);
    cy.contains('Premium Suite 202').should('be.visible');
  });

  it('should show no rooms for price range Low (<100.000)', () => {
    cy.get('select').eq(1).select('Under 100.000');
    cy.get('.grid').children().should('have.length', 4);
  });

  it('should show no rooms for price range Medium (100.000 - 200.000)', () => {
    cy.get('select').eq(1).select('100.000 - 200.000');
    cy.get('.grid').children().should('have.length', 4);
  });

  it('should filter rooms with price over 200.000', () => {
    cy.get('select').eq(1).select('Over 200.000');
    cy.get('.grid').children().should('have.length', 7);
  });

  it('should search rooms by name', () => {
    cy.get('input[type="text"]').type('Luxury');
    cy.get('.grid').children().should('have.length', 5);
    cy.contains('Luxury Suite 101').should('be.visible');
  });

  it('should filter and search rooms correctly', () => {
    cy.get('input[type="text"]').type('Suite');
    cy.get('select').eq(0).select('Luxury Suite');
    cy.get('select').eq(1).select('Over 200.000');
    cy.get('.grid').children().should('have.length', 5);
    cy.contains('Luxury Suite 101').should('be.visible');
  });

  it('should clear all filters and show all rooms', () => {
    cy.get('input[type="text"]').type('Premium');
    cy.get('select').eq(0).select('Premium Suite');
    cy.get('select').eq(1).select('Over 200.000');

    cy.contains('button', 'Clear Filter').click();

    cy.get('input[type="text"]').should('have.value', '');
    cy.get('select').eq(0).should('have.value', '');
    cy.get('select').eq(1).should('have.value', '');
    cy.get('.grid').children().should('have.length', 7);
  });

  it('should navigate to room details page when clicking View Details', () => {
    cy.contains('Luxury Suite 101')
      .parents('.bg-white')
      .find('button')
      .contains('View Details')
      .click();

    cy.url().should('include', '/customerRoom/room1');
  });

  it('should display empty state when no rooms are available', () => {
    cy.intercept('GET', '**/api/Room/available', {
      statusCode: 200,
      body: {
        data: []
      }
    }).as('getEmptyRooms');

    cy.reload();
    cy.wait('@getEmptyRooms');

    cy.contains('No Rooms Available').should('be.visible');
    cy.contains('Please check back later for available rooms.').should('be.visible');
  });

  it('should handle API error when fetching rooms', () => {
    cy.intercept('GET', '**/api/Room/available', {
      statusCode: 500,
      body: {
        message: 'Internal server error'
      }
    }).as('getRoomsError');

    cy.reload();
    cy.wait('@getRoomsError');

    cy.contains('Service Unavailable').should('be.visible');
    cy.contains("We couldn't retrieve room information at the moment. Please try again later").should('be.visible');
  });

  it('should handle API error when fetching room types', () => {
    cy.intercept('GET', '**/api/RoomType/available', {
      statusCode: 500,
      body: {
        message: 'Internal server error'
      }
    }).as('getRoomTypesError');

    cy.intercept('GET', '**/api/Room/available', {
      statusCode: 200,
      body: {
        data: [
          {
            roomId: 'room1',
            roomName: 'Luxury Suite 101',
            roomImage: '/Images/room1.jpg',
            roomTypeId: 'type1',
            status: 'Free',
            isDeleted: false
          }
        ]
      }
    }).as('getRooms');

    cy.reload();
    cy.wait(['@getRooms', '@getRoomTypesError']);

    cy.contains('Service Unavailable').should('be.visible');
    cy.contains("We couldn't retrieve room information at the moment. Please try again later").should('be.visible');
  });

  it('should display Unknown for room type when type is not found', () => {
    cy.intercept('GET', '**/api/Room/available', {
      statusCode: 200,
      body: {
        data: [
          {
            roomId: 'room4',
            roomName: 'Mystery Room',
            roomImage: '/Images/room4.jpg',
            roomTypeId: 'unknown-type',
            status: 'Free',
            isDeleted: false
          }
        ]
      }
    }).as('getRoomWithUnknownType');

    cy.reload();
    cy.wait('@getRoomWithUnknownType');

    cy.contains('Mystery Room').should('be.visible');
    cy.contains('Unknown').should('be.visible');
    cy.contains('N/A').should('be.visible');
  });

  it('should filter out deleted rooms', () => {
    cy.intercept('GET', '**/api/Room/available', {
      statusCode: 200,
      body: {
        data: [
          {
            roomId: 'room1',
            roomName: 'Luxury Suite 101',
            roomImage: '/Images/room1.jpg',
            roomTypeId: 'type1',
            status: 'Free',
            isDeleted: false
          },
          {
            roomId: 'room5',
            roomName: 'Deleted Room',
            roomImage: '/Images/room5.jpg',
            roomTypeId: 'type1',
            status: 'Free',
            isDeleted: true
          }
        ]
      }
    }).as('getRoomsWithDeleted');

    cy.reload();
    cy.wait('@getRoomsWithDeleted');

    cy.contains('Luxury Suite 101').should('be.visible');
    cy.contains('Deleted Room').should('not.exist');
  });

  it('should display correct status badges with appropriate colors', () => {
    cy.contains('Free')
      .should('have.css', 'background-color')
      .and('match', /rgb\(34,\s*197,\s*94\)|rgb\(16,\s*185,\s*129\)/);
  });

  it('should have responsive design', () => {
    cy.viewport('iphone-x');
    cy.contains('Luxury Pet Rooms').should('be.visible');
    cy.get('.grid').should('have.class', 'grid-cols-1');

    cy.viewport('ipad-2');
    cy.contains('Luxury Pet Rooms').should('be.visible');

    cy.viewport(1280, 800);
    cy.contains('Luxury Pet Rooms').should('be.visible');
  });
});
