describe('Forgot Password Page', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.sessionStorage.clear()
    })
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('http://localhost:3000/forgotpassword')
  })

  it('should render forgot password page correctly', () => {
    cy.get('h2').contains('Forgot Password').should('be.visible')
    cy.get('input[type="email"]').should('exist')
    cy.get('button[type="submit"]').contains('Reset Password').should('be.visible')
    cy.get('a[href="/login"]').should('exist')
  })

  it('should show validation error when email is empty', () => {
    cy.get('input#email').clear();
  
    cy.get('button[type="submit"]').click();
  
    cy.get('input#email').then(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validationMessage).to.equal('Please fill out this field.');
    });
  });
  
  it('should show validation error for invalid email', () => {
    cy.get('input#email').invoke('removeAttr', 'required');
    cy.get('input#email').invoke('removeAttr', 'type');
    cy.get('input#email').clear().type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.wait(1000);
    cy.contains('Please enter a valid email address', { timeout: 5000 }).should('be.visible');
  });


  it('should handle successful password reset request', () => {

    cy.intercept('POST', '/api/Account/ForgotPassword*', {
      statusCode: 200,
      body: { flag: true, message: 'Password reset email sent successfully' }
    }).as('forgotPasswordRequest');
    cy.get('input#email').type('huynhkhanh2746@gmail.com');
    cy.get('button[type="submit"]').click();
    cy.wait('@forgotPasswordRequest', { timeout: 20000 });
    cy.get('.swal2-popup', { timeout: 10000 }).should('be.visible'); 
    cy.get('.swal2-html-container').then(($container) => {
      console.log('Popup content:', $container.text()); 
    });
    cy.get('.swal2-title').should('contain', 'Success');
    cy.get('.swal2-html-container').should('include.text', 'Password reset email sent successfully');
    cy.get('.swal2-confirm').click();
  });


  it('should handle API errors', () => {
    cy.intercept('POST', '**/api/Account/ForgotPassword*', {
      statusCode: 500,
      body: {
        message: 'Internal server error'
      }
    }).as('failedRequest')

    cy.get('input[type="email"]').type('valid@example.com')
    cy.get('button[type="submit"]').click()

    cy.wait('@failedRequest')
    cy.get('.swal2-popup').should('be.visible')
    cy.get('.swal2-title').should('contain', 'Error')
    cy.get('.swal2-html-container').should('contain', 'Internal server error')
  })

  it('should navigate to login page', () => {
    cy.get('a[href="/login"]').click()
    cy.url().should('include', '/login')
  })

  it('should handle network errors', () => {
    cy.intercept('POST', '**/api/Account/ForgotPassword*', {
      forceNetworkError: true
    }).as('networkError')

    cy.get('input[type="email"]').type('valid@example.com')
    cy.get('button[type="submit"]').click()

    cy.get('.swal2-popup').should('be.visible')
    cy.get('.swal2-html-container').should('contain', 'Please try again later')
  })
})