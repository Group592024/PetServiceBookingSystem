describe("Create Gift E2E Tests", () => {
    const testGiftName = "Test Gift Item";
    const testGiftCode = "GIFT1000";
    
    before(() => {
      cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234"); // Using the same login command as in voucher tests
      
      // Create test fixture files if they don't exist
      cy.writeFile('cypress/fixtures/test-gift.jpg', 'binary-image-content', 'binary');
      cy.writeFile('cypress/fixtures/invalid-file.txt', 'This is not an image file');
    });
    
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
      cy.visit("http://localhost:3000/gifts");
      cy.contains("button", "New").click();
    });
    
    afterEach(() => {
      cy.saveLocalStorage();
    });
    
    after(() => {
      // Delete the test gift
      cy.deleteGift(testGiftName);
    });
    
    it("should open the create gift form, submit successfully, and find the gift by scrolling", () => {
        // Mock the API response for gift code check
        cy.intercept('GET', `http://localhost:5050/api/Voucher/search-gift-code?voucherCode=${testGiftCode}`, {
          statusCode: 200,
          body: {
            flag: true,
            message: "The Voucher retrieved successfully",
            data: {
              voucherId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
              voucherName: "Test Voucher",
              voucherDescription: "Test Description",
              voucherQuantity: 10,
              voucherDiscount: 20,
              voucherMaximum: 100,
              voucherMinimumSpend: 50,
              voucherCode: testGiftCode,
              voucherStartDate: "2023-01-01T00:00:00",
              voucherEndDate: "2023-12-31T00:00:00",
              isGift: true,
              isDeleted: false
            }
          }
        }).as('checkGiftCode');
        
        cy.intercept('POST', 'http://localhost:5050/Gifts', {
          statusCode: 200,
          body: {
            flag: true,
            message: "Gift added successfully",
            data: {
              giftId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
              giftName: testGiftName,
              giftDescription: "This is a test gift created by Cypress",
              giftPoint: 500,
              giftQuantity: 10,
              giftCode: testGiftCode,
              giftImage: "/images/gifts/test-gift.jpg",
              giftStatus: false,
              isDelete: false
            }
          }
        }).as('createGift');
        
        // Mock the gift list API to return many gifts so we need to scroll
        cy.intercept('GET', 'http://localhost:5050/Gifts/admin-gift-list', {
          statusCode: 200,
          body: {
            flag: true,
            data: Array(20).fill().map((_, index) => ({
              giftId: `gift-${index + 1}`,
              giftName: index === 15 ? testGiftName : `Gift Item ${index + 1}`, // Put our test gift at position 16
              giftCode: index === 15 ? testGiftCode : `CODE${index + 1}`,
              giftImage: '/images/gifts/sample.jpg',
              giftStatus: false
            }))
          }
        }).as('getGiftList');
        
        // Fill out the form fields
        cy.get('input[placeholder="Gift Name"]').type(testGiftName);
        cy.get('textarea[placeholder="Gift Description"]').type("This is a test gift created by Cypress");
        cy.get('input[placeholder="Gift Point"]').type("500");
        cy.get('input[placeholder="Gift Quantity"]').type("10");
        cy.get('input[placeholder="Gift Code (Optional)"]').type(testGiftCode);
        
        // Upload image file
        cy.get('#fileInput').selectFile('cypress/fixtures/test-gift.jpg');
        
        // Check image preview appears
        cy.get('img[alt="Preview"]').should('be.visible');
        
        cy.contains("button", "Submit").click();
        cy.wait('@checkGiftCode');
        cy.wait('@createGift');
        
        // Check for success message
        cy.get(".swal2-title", { timeout: 10000 }).should("contain", "Success");
        cy.get(".swal2-confirm").click();
        
        // Verify redirect back to gift list
        cy.url().should("include", "/gifts");
        cy.wait('@getGiftList');
        
        // Scroll down the table to find our gift
        // First approach: Using the DataGrid's scrolling capabilities
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('bottom', { ensureScrollable: false });
        
        // Second approach: Find the gift by searching through all rows
        cy.get('.MuiDataGrid-virtualScroller').then($scroller => {
          // Function to scroll down incrementally and check for the gift
          const scrollAndCheck = (scrollPosition = 0, increment = 100, maxScrolls = 10) => {
            if (maxScrolls <= 0) {
              // We've scrolled enough times, fail the test if we haven't found it
              throw new Error(`Could not find gift "${testGiftName}" after scrolling`);
            }
            
            // Scroll down
            cy.wrap($scroller).scrollTo(0, scrollPosition);
            
            // Check if our gift is visible
            cy.contains('div', testGiftName).then($gift => {
              if ($gift.length === 0) {
                // Not found, scroll more
                scrollAndCheck(scrollPosition + increment, increment, maxScrolls - 1);
              } else {
                // Found it! Verify it's our gift
                cy.wrap($gift).should('be.visible');
                cy.wrap($gift).parents('.MuiDataGrid-row').within(() => {
                  cy.contains(testGiftCode).should('exist');
                  cy.get('.MuiChip-label').contains('Active').should('exist');
                });
              }
            });
          };
          
          // Start scrolling from the top
          scrollAndCheck();
        });
        
        // Alternative approach: Use the search functionality if available
        // cy.get('input[placeholder="Search..."]').type(testGiftName);
        // cy.contains(testGiftName).should('be.visible');
      });
      
    
    it("should display validation errors for empty required fields", () => {
      // Submit without filling any fields
      cy.contains("button", "Submit").click();
      
      // Check for validation errors
      cy.contains("Gift Name is required").should("be.visible");
      cy.contains("Gift Description is required").should("be.visible");
      cy.contains("Gift Point must be greater than 0").should("be.visible");
      cy.contains("Quantity must be greater than 0").should("be.visible");
      cy.contains("Gift Image is required").should("be.visible");
    });
    
    it("should display validation error for gift point less than or equal to 0", () => {
      cy.get('input[placeholder="Gift Point"]').type("0");
      cy.contains("button", "Submit").click();
      
      cy.contains("Gift Point must be greater than 0").should("be.visible");
      
      // Try with negative value
      cy.get('input[placeholder="Gift Point"]').clear().type("-10");
      cy.contains("button", "Submit").click();
      
      cy.contains("Gift Point must be greater than 0").should("be.visible");
    });
    
    it("should display validation error for quantity less than or equal to 0", () => {
      cy.get('input[placeholder="Gift Quantity"]').type("0");
      cy.contains("button", "Submit").click();
      
      cy.contains("Quantity must be greater than 0").should("be.visible");
      
      // Try with negative value
      cy.get('input[placeholder="Gift Quantity"]').clear().type("-5");
      cy.contains("button", "Submit").click();
      
      cy.contains("Quantity must be greater than 0").should("be.visible");
    });
    
    it("should validate image file type", () => {
      // Try uploading a non-image file
      cy.get('#fileInput').selectFile('cypress/fixtures/invalid-file.txt', { force: true });
      
      // Check for validation error
      cy.contains("Please select a valid image file").should("be.visible");
    });
    
    it("should handle gift code validation correctly", () => {
      // Mock the API response for gift code check
      cy.intercept('GET', 'http://localhost:5050/api/Voucher/search-gift-code*', {
        statusCode: 200,
        body: {
          flag: false,
          message: "Gift code not found",
          data: null
        }
      }).as('checkGiftCode');
      
      // Fill form with invalid gift code
      cy.get('input[placeholder="Gift Name"]').type("Test Gift With Invalid Code");
      cy.get('textarea[placeholder="Gift Description"]').type("Testing gift code validation");
      cy.get('input[placeholder="Gift Point"]').type("300");
      cy.get('input[placeholder="Gift Quantity"]').type("5");
      cy.get('input[placeholder="Gift Code (Optional)"]').type("INVALID123");
      
      // Upload image
      cy.get('#fileInput').selectFile('cypress/fixtures/test-gift.jpg');
      
      // Submit the form
      cy.contains("button", "Submit").click();
      
      // Wait for API call
      cy.wait('@checkGiftCode');
      
      // Check for validation error
      cy.contains("Gift code not found or invalid").should("be.visible");
    });
    
    it("should handle API errors gracefully", () => {
      // Mock the API to return an error
      cy.intercept('POST', 'http://localhost:5050/Gifts', {
        statusCode: 500,
        body: {
          flag: false,
          message: "Server error occurred"
        }
      }).as('createGiftError');
      
      // Fill out the form
      cy.get('input[placeholder="Gift Name"]').type("Error Test Gift");
      cy.get('textarea[placeholder="Gift Description"]').type("Testing error handling");
      cy.get('input[placeholder="Gift Point"]').type("200");
      cy.get('input[placeholder="Gift Quantity"]').type("3");
      
      // Upload image
      cy.get('#fileInput').selectFile('cypress/fixtures/test-gift.jpg');
      
      // Submit the form
      cy.contains("button", "Submit").click();
      
      // Wait for API call
      cy.wait('@createGiftError');
      
      // Check for error message
      cy.get(".swal2-title").should("contain", "Warning");
      cy.get(".swal2-confirm").click();
    });
    
    it("should clear form when Cancel button is clicked", () => {
      // Fill out some fields
      cy.get('input[placeholder="Gift Name"]').type("Gift To Cancel");
      cy.get('textarea[placeholder="Gift Description"]').type("This should be cleared");
      cy.get('input[placeholder="Gift Point"]').type("100");
      
      // Click Cancel
      cy.contains("button", "Cancel").click();
      
      // Verify redirect back to gift list
      cy.url().should("include", "/gifts");
      cy.url().should("not.include", "/add");
    });
    
    it("should create gift without optional gift code", () => {
      // Fill out the form without gift code
      cy.get('input[placeholder="Gift Name"]').type(`${testGiftName}-NoCode`);
      cy.get('textarea[placeholder="Gift Description"]').type("Gift without code");
      cy.get('input[placeholder="Gift Point"]').type("250");
      cy.get('input[placeholder="Gift Quantity"]').type("5");
      
      // Upload image
      cy.get('#fileInput').selectFile('cypress/fixtures/test-gift.jpg');
      
      // Submit the form
      cy.contains("button", "Submit").click();
      
      // Check for success message
      cy.get(".swal2-title", { timeout: 10000 }).should("contain", "Success");
      cy.get(".swal2-confirm").click();
      
      // Verify redirect back to gift list
      cy.url().should("include", "/gifts");
    });
    
  });
  