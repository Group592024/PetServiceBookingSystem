describe("Gift Detail Page E2E Tests", () => {
    // Test gift data
    const testGiftName = "Premium Pet Food";
    const testGiftCode = "FOOD001";
    let testGiftId = "abc123"; // Using a fixed ID for our test gift
  
    // Custom command for login
    Cypress.Commands.add('loginAsAdmin', () => {
      cy.session('adminLogin', () => {
        cy.visit('http://localhost:3000/login');
        cy.get('#email').type('se.rn.a.vill.ar.es@gmail.com');
        cy.get('#password').type('minh1234');
        cy.get('button[type="submit"]').click();
        cy.url().should('not.include', '/login', { timeout: 10000 });
      });
    });
  
    beforeEach(() => {
      cy.loginAsAdmin();
      
      // Create a stub for the gift detail API
      cy.intercept('GET', `http://localhost:5050/Gifts/${testGiftId}`, {
        statusCode: 200,
        body: {
          flag: true,
          message: "Gift details retrieved successfully",
          data: {
            giftId: testGiftId,
            giftName: testGiftName,
            giftPoint: 500,
            giftCode: testGiftCode,
            giftDescription: 'High-quality premium pet food for your beloved pet.',
            giftImage: '/images/gifts/pet-food.jpg',
            quantity: 10,
            giftStatus: false
          }
        }
      }).as('getGiftDetail');
    });
  
    it("should display gift details correctly", () => {
      // Visit the gift detail page
      cy.visit(`http://localhost:3000/gifts/detail/${testGiftId}`);
      cy.wait('@getGiftDetail');
      
      // Handle SweetAlert2 success popup
      cy.get('.swal2-confirm').click();
      
      // Verify page title
      cy.contains('Gift Detail').should('be.visible');
      
      // Verify all form fields have correct values
      cy.get('input[value="Premium Pet Food"]').should('be.visible');
      cy.get('input[value="500"]').should('be.visible');
      cy.get('input[value="FOOD001"]').should('be.visible');
      cy.get('input[value="10"]').should('be.visible');
      cy.get('input[value="Active"]').should('be.visible');
      
      // Verify description field
      cy.get('textarea').should('have.value', 'High-quality premium pet food for your beloved pet.');
      
      // Verify image is displayed
      cy.get('img[alt="Gift"]')
        .should('be.visible')
        .and('have.attr', 'src', 'http://localhost:5022/images/gifts/pet-food.jpg');
    });
  
    it("should navigate back to gift list when clicking Back button", () => {
      // Visit the gift detail page
      cy.visit(`http://localhost:3000/gifts/detail/${testGiftId}`);
      cy.wait('@getGiftDetail');
      
      // Handle SweetAlert2 success popup
      cy.get('.swal2-confirm').click();
      
      // Click the Back button
      cy.contains('button', 'Back').click();
      
      // Verify navigation to the gift list page
      cy.url().should('include', '/gifts');
      cy.url().should('not.include', '/detail');
    });
  
    it("should display 'No Image' when gift has no image", () => {
      // Create a stub for a gift with no image
      cy.intercept('GET', 'http://localhost:5050/Gifts/def456', {
        statusCode: 200,
        body: {
          flag: true,
          message: "Gift details retrieved successfully",
          data: {
            giftId: 'def456',
            giftName: 'Gift Card',
            giftPoint: 300,
            giftCode: 'CARD002',
            giftDescription: 'A gift card for pet services.',
            giftImage: '',
            quantity: 5,
            giftStatus: false
          }
        }
      }).as('giftWithNoImage');
      
      // Visit the gift detail page
      cy.visit('http://localhost:3000/gifts/detail/def456');
      cy.wait('@giftWithNoImage');
      
      // Handle SweetAlert2 success popup
      cy.get('.swal2-confirm').click();
      
      // Verify "No Image" text is displayed
      cy.contains('No Image').should('be.visible');
      
      // Verify the image element doesn't exist
      cy.get('img[alt="Gift"]').should('not.exist');
    });
  
    it("should handle loading state correctly", () => {
      // Intercept the API call to delay it
      cy.intercept('GET', `http://localhost:5050/Gifts/${testGiftId}`, (req) => {
        req.on('response', (res) => {
          // Delay the response to show loading state
          res.setDelay(1000);
        });
      }).as('delayedGiftDetail');
      
      // Visit the gift detail page
      cy.visit(`http://localhost:3000/gifts/detail/${testGiftId}`);
      
      // Verify loading spinner is displayed
      cy.get('svg.animate-spin').should('be.visible');
      
      // Wait for data to load
      cy.wait('@delayedGiftDetail');
      
      // Handle SweetAlert2 success popup
      cy.get('.swal2-confirm').click();
      
      // Verify content is shown after loading
      cy.contains('Gift Detail').should('be.visible');
      cy.get('svg.animate-spin').should('not.exist');
    });
  
    it("should handle error state correctly", () => {
      // Create a stub for a failed API response
      cy.intercept('GET', 'http://localhost:5050/Gifts/invalid-id', {
        statusCode: 404,
        body: {
          flag: false,
          message: "Gift not found"
        }
      }).as('giftNotFound');
      
      // Visit the gift detail page with an invalid ID
      cy.visit('http://localhost:3000/gifts/detail/invalid-id');
      cy.wait('@giftNotFound');
      
      // Check for SweetAlert2 warning popup
      cy.get('.swal2-warning').should('be.visible');
      cy.get('.swal2-title').should('contain', 'Warning');
      cy.get('.swal2-html-container').should('contain', 'Gift not found');
      cy.get('.swal2-confirm').click();
    });
  
    it("should handle network error correctly", () => {
      // Create a stub for a network error
      cy.intercept('GET', 'http://localhost:5050/Gifts/network-error', {
        forceNetworkError: true
      }).as('networkError');
      
      // Visit the gift detail page with an ID that will trigger network error
      cy.visit('http://localhost:3000/gifts/detail/network-error');
      
      // Check for SweetAlert2 error popup
      cy.get('.swal2-icon.swal2-warning', { timeout: 10000 }).should('be.visible');
      cy.get('.swal2-title').should('contain', 'Warning');
      cy.get('.swal2-confirm').click();
    });
  
    it("should display inactive status for inactive gifts", () => {
      // Create a stub for an inactive gift
      cy.intercept('GET', 'http://localhost:5050/Gifts/inactive-gift', {
        statusCode: 200,
        body: {
          flag: true,
          message: "Gift details retrieved successfully",
          data: {
            giftId: 'inactive-gift',
            giftName: 'Inactive Gift',
            giftPoint: 200,
            giftCode: 'INACTIVE001',
            giftDescription: 'This is an inactive gift.',
            giftImage: '/images/gifts/inactive.jpg',
            quantity: 0,
            giftStatus: true // true means inactive
          }
        }
      }).as('inactiveGift');
      
      // Visit the gift detail page
      cy.visit('http://localhost:3000/gifts/detail/inactive-gift');
      cy.wait('@inactiveGift');
      
      // Handle SweetAlert2 success popup
      cy.get('.swal2-confirm').click();
      
      // Verify inactive status is shown
      cy.get('input[value="Inactive"]').should('be.visible');
    });
  
    it("should handle different gift point values correctly", () => {
      // Create a stub for a gift with high point value
      cy.intercept('GET', 'http://localhost:5050/Gifts/high-point-gift', {
        statusCode: 200,
        body: {
          flag: true,
          message: "Gift details retrieved successfully",
          data: {
            giftId: 'high-point-gift',
            giftName: 'Premium Gift',
            giftPoint: 1000,
            giftCode: 'PREMIUM001',
            giftDescription: 'A premium gift with high point value.',
            giftImage: '/images/gifts/premium.jpg',
            quantity: 5,
            giftStatus: false
          }
        }
      }).as('highPointGift');
      
      // Visit the gift detail page
      cy.visit('http://localhost:3000/gifts/detail/high-point-gift');
      cy.wait('@highPointGift');
      
      // Handle SweetAlert2 success popup
      cy.get('.swal2-confirm').click();
      
      // Verify high point value is shown
      cy.get('input[value="1000"]').should('be.visible');
    });
  });
  