import dayjs from 'dayjs';

describe('Register Page (E2E)', () => {
  const baseUrl = 'http://localhost:3000';
  const apiUrl = 'http://localhost:5050/api/Account/register';
  const dummyToken = 'dummy-token';

  beforeEach(() => {
    cy.window().then(win => {
      win.sessionStorage.setItem('token', dummyToken);
    });
    cy.visit(`${baseUrl}/register`, {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('token', dummyToken);
      }
    });
  });

  it('renders all form fields and the submit button', () => {
    cy.contains('Create Account').should('be.visible');
    cy.get('#name').should('exist');
    cy.get('#email').should('exist');
    cy.get('#phone').should('exist');
    cy.get('#password').should('exist');
    cy.get('#gender').should('exist');
    cy.get('#dob').should('exist');
    cy.get('input[readonly][placeholder="DD/MM/YYYY"]').should('exist');
    cy.get('#address').should('exist');
    cy.get('#terms[type="checkbox"]').should('exist');
    cy.get('label[for="terms"]').should('contain', 'I agree to the Terms of Service and Privacy Policy');
    cy.get('label[for="terms"] a').should('have.length', 2)
      .first().should('have.attr', 'href', '#')
      .next().should('have.attr', 'href', '#');
    cy.get('button[type="submit"]').contains('Create Account').should('exist');
  });

  it('shows validation errors when submitting empty form', () => {
    cy.get('#terms').invoke('removeAttr', 'required');
    cy.get('button[type="submit"]').click();

    cy.get('p.text-red-500').should('have.length', 7)
      .then($errs => {
        const texts = [...$errs].map(el => el.innerText);
        expect(texts).to.include.members([
          'Name is required',
          'Email is required',
          'Phone number is required',
          'Password is required',
          'Gender is required',
          'Date of birth is required',
          'Address is required',
        ]);
      });
  });

  it('toggles the terms checkbox when clicking its label', () => {
    cy.get('#terms').should('not.be.checked');
    cy.get('label[for="terms"]').click({ force: true });
    cy.get('#terms').should('be.checked');
    cy.get('label[for="terms"]').click();
    cy.get('label[for="terms"]').click({ force: true });

    cy.get('#terms').should('not.be.checked');

  });

  it('validates format errors correctly', () => {
    cy.get('#email').type(' username@gmail.com');
    cy.get('#phone').type('123');
    cy.get('#password').type('123');
    const future = dayjs().add(1, 'day').format('YYYY-MM-DD');
    cy.get('#dob[type="date"]').invoke('val', future).trigger('input', { force: true });

    cy.get('#name').type('Test User');
    cy.get('#address').type('123 Main St');
    cy.get('#gender').select('male');
    cy.get('#terms').check();

    cy.get('button[type="submit"]').click();

    cy.get('p.text-red-500').should('have.length', 3)
      .then($errs => {
        const texts = [...$errs].map(el => el.innerText);
        expect(texts).to.include.members([
          'Please enter a valid phone number',
          'Password must be at least 6 characters long',
          'Date of birth is required'
        ]);
      });
  });

  it('submits successfully and navigates to login', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '0123456789',
      password: 'password123',
      gender: 'female',
      dob: '1990-01-01',
      address: '456 Elm St'
    };

    cy.intercept('POST', apiUrl, req => {
      expect(req.headers).to.have.property('authorization', `Bearer ${dummyToken}`);
      req.reply({ statusCode: 200, body: { flag: true, message: 'Registered successfully' } });
    }).as('postRegister');
    cy.get('#name').type(data.name);
    cy.get('#email').type(data.email);
    cy.get('#phone').type(data.phone);
    cy.get('#password').type(data.password);
    cy.get('#gender').select(data.gender);
    cy.get('#dob')
    .invoke('attr', 'style', 'opacity: 1; z-index: 9999; position: relative') 
    .type('1990-01-01', { force: true }); 
    cy.get('#address').type(data.address);
    cy.get('#terms').check();
    cy.get('button[type="submit"]').click();
    cy.wait('@postRegister');
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').contains('Registration Successful');
    cy.get('.swal2-confirm').click();
    cy.url().should('include', '/login');
  });

  it('displays server-side validation errors', () => {
    const serverErrors = {
      AccountName: ['Too short'],
      AccountEmail: ['Already exists'],
      AccountPhoneNumber: ['Invalid phone'],
      AccountDob: ['Age too high']
    };
    cy.intercept('POST', apiUrl, {
      statusCode: 400,
      body: { errors: serverErrors }
    }).as('postErr');
    cy.get('#name').type('JD');
    cy.get('#email').type('john@example.com');
    cy.get('#phone').type('0123456789');
    cy.get('#password').type('password123');
    cy.get('#gender').select('male');
    cy.get('#dob')
  .invoke('attr', 'style', 'opacity: 1; z-index: 9999; position: relative') 
  .type('1990-01-01', { force: true }); 
    cy.get('#address').type('456 Elm St');
    cy.get('#terms').check();
    cy.get('button[type="submit"]').click();
    cy.wait('@postErr');
    cy.get('p.text-red-500').should('have.length', 4)
      .then($errs => {
        const texts = [...$errs].map(el => el.innerText);
        expect(texts).to.include.members([
          'Too short',
          'Already exists',
          'Invalid phone',
          'Age too high'
        ]);
      });
  });

  it('shows generic error on server failure', () => {
    cy.intercept('POST', apiUrl, {
      statusCode: 500,
      body: 'Internal server error'
    }).as('postFail');
    cy.get('#name').type('John Doe');
    cy.get('#email').type('john@example.com');
    cy.get('#phone').type('0123456789');
    cy.get('#password').type('password123');
    cy.get('#gender').select('male');
    cy.get('#dob')
    .invoke('attr', 'style', 'opacity: 1; z-index: 9999; position: relative') 
    .type('1990-01-01', { force: true }); 
    cy.get('#address').type('456 Elm St');
    cy.get('#terms').check();
    cy.get('button[type="submit"]').click();
    cy.wait('@postFail');
    cy.get('p.text-red-500').first().should('contain', 'Internal server error');
  });
});
