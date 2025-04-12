import moment from 'moment';

describe('Pet Health Book List - Customer Page', () => {
  const ACCOUNT_ID = 'account-001';
  const petId = 'pet1';
  const LOGIN_URL = 'http://localhost:3000/login';
  const PET_HEALTH_LIST_URL = `http://localhost:3000/list/${petId}`;

  const petHealthBookData = {
    data: [
      {
        healthBookId: 'health1',
        performBy: 'Dr. Smith',
        visitDate: '2020-10-01T00:00:00Z',
        nextVisitDate: '2020-11-01T00:00:00Z',
        medicineIds: ['m1'],
        bookingServiceItemId: 'bsi1',
        petId: 'pet1',
      },
      {
        healthBookId: 'health2',
        performBy: 'Dr. John',
        visitDate: '2023-12-01T00:00:00Z',
        nextVisitDate: moment().add(5, 'days').toISOString(),
        medicineIds: ['m2'],
        bookingServiceItemId: 'bsi2',
        petId: 'pet1',
      }
    ]
  };

  const medicinesData = {
    data: [
      { medicineId: 'm1', medicineName: 'Medicine A' },
      { medicineId: 'm2', medicineName: 'Medicine B' }
    ]
  };

  const bookingServiceItemsData = {
    data: [
      { bookingServiceItemId: 'bsi1', petId: 'pet1' },
      { bookingServiceItemId: 'bsi2', petId: 'pet1' }
    ]
  };

  const petsData = {
    data: [
      {
        petId: 'pet1',
        petName: 'Buddy',
        dateOfBirth: '2020-01-01T00:00:00Z',
        petImage: '/images/buddy.png',
        accountId: ACCOUNT_ID,
      },
      {
        petId: 'pet2',
        petName: 'Max',
        dateOfBirth: '2019-06-15T00:00:00Z',
        petImage: null,
        accountId: ACCOUNT_ID,
      }
    ]
  };

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();

    cy.intercept('POST', '**/api/Account/Login').as('loginRequest');

    cy.visit(LOGIN_URL);
    cy.get('#email').should('be.visible').type('tuan0@gmail.com');
    cy.get('#password').type('1234567');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest').then(({ response }) => {
      expect(response.statusCode).to.equal(200);
      const token = response.body.data;
      cy.window().then(win => {
        win.sessionStorage.setItem('token', token);
        win.sessionStorage.setItem('accountId', ACCOUNT_ID);
      });
    });

    cy.intercept('GET', '**/api/PetHealthBook**', {
      statusCode: 200,
      body: petHealthBookData,
      delay: 300,
    }).as('getPetHealthBooks');

    cy.intercept('GET', '**/Medicines**', {
      statusCode: 200,
      body: medicinesData,
      delay: 200,
    }).as('getMedicines');

    cy.intercept('GET', '**/api/BookingServiceItems/GetBookingServiceList**', {
      statusCode: 200,
      body: bookingServiceItemsData,
      delay: 150,
    }).as('getBookingServiceItems');

    cy.intercept('GET', '**/api/pet**', {
      statusCode: 200,
      body: petsData,
      delay: 200,
    }).as('getPets');

    cy.visit(PET_HEALTH_LIST_URL);
    cy.wait(['@getPetHealthBooks', '@getMedicines', '@getBookingServiceItems', '@getPets']);
  });

  it('displays pet list with health records', () => {
    cy.contains('My Pet Health Book List').should('be.visible');
    cy.contains('View health records for all your pets').should('be.visible');

    cy.contains('Buddy').should('be.visible');
    cy.contains('Born:').should('be.visible');

    cy.contains('Health Records').parent().within(() => {
      cy.contains(/record[s]?/i).should('exist');
    });
  });

  it('renders health record details correctly with proper status', () => {
    cy.contains(moment('2020-11-01T00:00:00Z').format('DD/MM/YYYY')).should('be.visible');
    cy.contains('Status').parent().should('contain', 'Done');

    cy.contains(moment().add(5, 'days').format('DD/MM/YYYY')).should('be.visible');
    cy.contains('Pending').should('exist');
  });
  it('navigates to health record details when clicking view details icon', () => {
    cy.get('a[href*="/detailcus/"]')
      .first()
      .click();
    cy.url().should('include', '/detailcus/');
  });
});
