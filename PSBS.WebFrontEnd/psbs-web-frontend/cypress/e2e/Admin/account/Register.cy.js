describe('Register Page', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/register');
    });

    it('Should display validation errors when submitting empty form', () => {
        cy.get('button[type="submit"]').click();

        cy.get('#name').then(($input) => {
            expect($input[0].checkValidity()).to.be.false;
            expect($input[0].validationMessage).to.contain('fill out');
        });
        cy.get('#email').then(($input) => {
            expect($input[0].checkValidity()).to.be.false;
            expect($input[0].validationMessage).to.contain('fill out');
        });
        cy.get('#phone').then(($input) => {
            expect($input[0].checkValidity()).to.be.false;
            expect($input[0].validationMessage).to.contain('fill out');
        });
        cy.get('#password').then(($input) => {
            expect($input[0].checkValidity()).to.be.false;
            expect($input[0].validationMessage).to.contain('fill out');
        });
        cy.get('#gender').then(($input) => {
        });
        cy.get('#dob').then(($input) => {
            expect($input[0].checkValidity()).to.be.false;
            expect($input[0].validationMessage).to.contain('fill out');
        });
        cy.get('#address').then(($input) => {
            expect($input[0].checkValidity()).to.be.false;
            expect($input[0].validationMessage).to.contain('fill out');
        });
    });

    it('Should show error for invalid email format', () => {
        cy.get('#name').clear().type('John Doe');
        cy.get('#email').clear().type('johndoegmail.com.nv');
        cy.get('#phone').clear().type('0123456789');
        cy.get('#password').clear().type('password123');
        cy.get('#gender').select('Male');
        cy.get('#dob').clear().type('1990-05-10');
        cy.get('#address').clear().type('123 Main Street');
        cy.get('button[type="submit"]').click();
        cy.get('#email').then(($input) => {
            expect($input[0].checkValidity()).to.be.false;
            expect($input[0].validationMessage).to.contain("@");
        });
    });

    it('Should show error for invalid phone number format', () => {
        cy.get('#name').clear().type('John Doe');
        cy.get('#email').clear().type('johndoe@gmail.com');
        cy.get('#phone').clear().type('12345');
        cy.get('#password').clear().type('password123');
        cy.get('#gender').select('Male');
        cy.get('#dob').clear().type('1990-05-10');
        cy.get('#address').clear().type('123 Main Street');
        cy.get('button[type="submit"]').click();
        cy.contains('Please enter a valid phone number').should('be.visible');
    });


    it('Should show error for short password', () => {
        cy.get('#name').clear().type('John Doe');
        cy.get('#email').clear().type('johndoe@gmail.com');
        cy.get('#phone').clear().type('0123456789');
        cy.get('#password').clear().type('123');
        cy.get('#gender').select('Male');
        cy.get('#dob').clear().type('1990-05-10');
        cy.get('#address').clear().type('123 Main Street');
        cy.get('button[type="submit"]').click();
        cy.contains('Password must be at least 6 characters long').should('be.visible');
    });

    it('Should show error if date of birth is in the future', () => {
        cy.get('#name').clear().type('John Doe');
        cy.get('#email').clear().type('johndoe@gmail.com');
        cy.get('#phone').clear().type('0123456789');
        cy.get('#password').clear().type('password123');
        cy.get('#gender').select('Male');
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const futureDateString = futureDate.toISOString().split('T')[0];
        cy.get('#dob').clear().type(futureDateString);
        cy.get('#address').clear().type('123 Main Street');
        cy.get('button[type="submit"]').click();
        cy.contains('Date of birth cannot be in the future').should('be.visible');
    });

    it('Should successfully register with valid inputs', () => {
        cy.get('#name').clear().type('John Doe');
        cy.get('#email').clear().type('johndoe@gmail.com');
        cy.get('#phone').clear().type('0123456789');
        cy.get('#password').clear().type('password123');
        cy.get('#gender').select('Male');
        cy.get('#dob').clear().type('1990-05-10');
        cy.get('#address').clear().type('123 Main Street');
        cy.intercept('POST', 'http://localhost:5050/api/Account/register', {
            statusCode: 200,
            body: { flag: true },
        }).as('registerRequest');
        cy.get('button[type="submit"]').click();
        cy.wait('@registerRequest');
        cy.get('.swal2-popup')
            .should('be.visible')
            .within(() => {
                cy.contains('Registration Successful').should('be.visible');
                cy.contains('Your account has been registered successfully!').should('be.visible');
                cy.get('.swal2-confirm').click();
            });

        cy.url().should('include', '/login');
    });

    it('Should display server error message when registration fails', () => {
        cy.get('#name').clear().type('John Doe');
        cy.get('#email').clear().type('existinguser@gmail.com');
        cy.get('#phone').clear().type('0123456789');
        cy.get('#password').clear().type('password123');
        cy.get('#gender').select('Male');
        cy.get('#dob').clear().type('1990-05-10');
        cy.get('#address').clear().type('123 Main Street');
        cy.intercept('POST', 'http://localhost:5050/api/Account/register', {
            statusCode: 400,
            body: { message: 'Email already exists' },
        }).as('registerFail');

        cy.get('button[type="submit"]').click();
        cy.wait('@registerFail');
        cy.contains('Email already exists').should('be.visible');
    });

    it('Should allow user to navigate to login page', () => {
        cy.contains('Login Here').click();
        cy.url().should('include', '/login');
    });
});
