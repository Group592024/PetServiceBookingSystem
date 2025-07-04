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
    cy.get('h2').contains('Forgot Your Password?').should('be.visible')
    cy.get('input[type="email"]').should('exist')
    cy.get('button[type="submit"]').contains('Reset Password').should('be.visible')
    cy.get('a[href="/login"]').should('exist')
  })

  it('should show validation error when email is invalid', () => {
    cy.get('input#email').clear().type('not-an-email');
    cy.get('button[type="submit"]').click();
    cy.get('p.text-red-600')
      .should('be.visible')
      .and('have.text', 'Please enter a valid email address');
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
    const testEmail = 'huynhkhanh2746@gmail.com';
    cy.window().then(win => {
      win.sessionStorage.setItem('token', 'dummy-token');
    });
    cy.intercept(
      'POST',
      `/api/Account/ForgotPassword?email=${encodeURIComponent(testEmail)}`,
      {
        statusCode: 200,
        body: { flag: true, message: 'Password reset email sent successfully' }
      }
    ).as('forgotPasswordRequest');
    cy.get('input#email').type(testEmail);
    cy.get('button[type="submit"]').click();
    cy.wait('@forgotPasswordRequest', { timeout: 20000 })
      .its('request.headers')
      .should(headers => {
        expect(headers).to.have.property('authorization', 'Bearer dummy-token');
        expect(headers['content-type']).to.contain('application/json');
      });
    cy.get('.swal2-popup', { timeout: 10000 }).should('be.visible').within(() => {
      cy.get('.swal2-title').should('contain', 'Email Sent');
      cy.get('.swal2-html-container')
        .should('contain', 'Password reset instructions have been sent to your email');
      cy.get('.swal2-confirm').click();
    });
    cy.get('h3').contains('Check Your Email');
    cy.get('p.text-blue-600').should('contain', testEmail);
    cy.get('button').contains('Try another email');
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