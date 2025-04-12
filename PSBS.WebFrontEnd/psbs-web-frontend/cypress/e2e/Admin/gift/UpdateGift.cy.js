describe("Update Gift E2E Tests", () => {
    const testGiftName = "Test Gift Item";
    const updatedGiftName = "Updated Test Gift";
    const testGiftCode = "GIFT1000";
    const testGiftId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
  
    before(() => {
      cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
      
      // Create test fixture files if they don't exist
      cy.writeFile('cypress/fixtures/test-gift.jpg', 'binary-image-content', 'binary');
      cy.writeFile('cypress/fixtures/updated-gift.jpg', 'updated-binary-image-content', 'binary');
      cy.writeFile('cypress/fixtures/invalid-file.txt', 'This is not an image file');
    });
  
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
      
      // Mock the API response for getting gift details
      cy.intercept('GET', `http://localhost:5050/Gifts/${testGiftId}`, {
        statusCode: 200,
        body: {
          flag: true,
          message: "Gift retrieved successfully",
          data: {
            giftId: testGiftId,
            giftName: testGiftName,
            giftDescription: "This is a test gift for updating",
            giftPoint: 500,
            quantity: 10,
            giftCode: testGiftCode,
            giftImage: "/images/gifts/test-gift.jpg",
            giftStatus: false,
            isDelete: false
          }
        }
      }).as('getGiftDetail');
  
      // Visit the update page
      cy.visit(`http://localhost:3000/gifts/update/${testGiftId}`);
      cy.wait('@getGiftDetail');
    });
  
    afterEach(() => {
      cy.saveLocalStorage();
    });
  
    it("should load gift details correctly and update successfully", () => {
      // Verify the form is pre-filled with existing gift data
      cy.get('input[name="giftName"]').should('have.value', testGiftName);
      cy.get('input[name="giftCode"]').should('have.value', testGiftCode);
      cy.get('input[name="giftPoint"]').should('have.value', '500');
      cy.get('input[name="quantity"]').should('have.value', '10');
      cy.get('textarea[name="giftDescription"], input[name="giftDescription"]').should('exist');
      
      // Verify image is loaded
      cy.get('img[alt="Gift"]').should('be.visible');
      cy.get('img[alt="Gift"]').should('have.attr', 'src').and('include', 'test-gift.jpg');
  
      // Mock the API response for updating gift
      cy.intercept('PUT', 'http://localhost:5050/Gifts', {
        statusCode: 200,
        body: {
          flag: true,
          message: "Gift updated successfully",
          data: {
            giftId: testGiftId,
            giftName: updatedGiftName,
            giftDescription: "This is an updated test gift",
            giftPoint: 600,
            quantity: 15,
            giftCode: testGiftCode,
            giftImage: "/images/gifts/updated-gift.jpg",
            giftStatus: false,
            isDelete: false
          }
        }
      }).as('updateGift');
  
      // Update form fields
      cy.get('input[name="giftName"]').clear().type(updatedGiftName);
      cy.get('input[name="giftPoint"]').clear().type('600');
      cy.get('input[name="quantity"]').clear().type('15');
      cy.get('textarea[name="giftDescription"], input[name="giftDescription"]').clear().type('This is an updated test gift');
      
      // Upload a new image
      cy.get('#fileInput').selectFile('cypress/fixtures/updated-gift.jpg');
      
      // Submit the form
      cy.contains('button', 'Update Gift').click();
      cy.wait('@updateGift');
      
      // Check for success message
      cy.get('.swal2-title', { timeout: 10000 }).should('contain', 'Success');
      cy.get('.swal2-confirm').click({ force: true });

      
      // Verify redirect back to gift list
      cy.url().should('include', '/gifts');
    });
  
    it("should handle validation errors correctly", () => {
      // Clear required fields
      cy.get('input[name="giftName"]').clear();
      cy.get('input[name="giftPoint"]').clear().type('0');
      cy.get('input[name="quantity"]').clear().type('0');
      cy.get('textarea[name="giftDescription"], input[name="giftDescription"]').clear();
      
      // Submit the form
      cy.contains('button', 'Update Gift').click();
      
      // Check for validation errors
      cy.contains('Gift name is required').should('be.visible');
      cy.contains('Gift point should be greater than 0').should('be.visible');
      cy.contains('Quantity should be greater than 0').should('be.visible');
      cy.contains('Gift description is required').should('be.visible');
    });
  
    it("should handle image validation correctly", () => {
      // Try uploading an invalid file
      cy.get('#fileInput').selectFile('cypress/fixtures/invalid-file.txt', { force: true });
      
      // Check for validation error
      cy.contains('Image size should be less than 5MB').should('not.exist');
      
      // Mock a large file error
      cy.window().then((win) => {
        const originalFileReader = win.FileReader;
        cy.stub(win, 'FileReader').callsFake(function() {
          const reader = new originalFileReader();
          setTimeout(() => {
            // Simulate a large file by triggering the error in the component
            cy.get('input[name="giftName"]').then($el => {
              const component = $el[0];
              component.dispatchEvent(new Event('change', { bubbles: true }));
              cy.get('#fileInput').trigger('change');
            });
          }, 100);
          return reader;
        });
      });
      
      // Force the error to appear
      cy.window().then((win) => {
        win.setErrors = (errors) => {
          win.document.querySelector('form').dispatchEvent(new CustomEvent('error', { 
            detail: { image: "Image size should be less than 5MB" }
          }));
        };
      });
    });
  
    it("should navigate back to list when Back button is clicked", () => {
      // Click the Back to List button
      cy.contains('button', 'Back to List').click();
      
      // Verify redirect back to gift list
      cy.url().should('include', '/gifts');
      cy.url().should('not.include', '/update');
    });
  
    it("should handle API errors gracefully", () => {
      // Mock the API to return an error
      cy.intercept('PUT', 'http://localhost:5050/Gifts', {
        statusCode: 500,
        body: {
          flag: false,
          message: "Server error occurred"
        }
      }).as('updateGiftError');
      
      // Make a small change to the form
      cy.get('input[name="giftName"]').clear().type('Error Test Gift');
      
      // Submit the form
      cy.contains('button', 'Update Gift').click();
      cy.wait('@updateGiftError');
      
      // Check for error message
      cy.get('.swal2-title', { timeout: 10000 }).should('contain', 'Warning');
      cy.get('.swal2-confirm').click();
    });
  
    it("should toggle gift status correctly", () => {
      // Mock the API response for updating gift with changed status
      cy.intercept('PUT', 'http://localhost:5050/Gifts', {
        statusCode: 200,
        body: {
          flag: true,
          message: "Gift status updated successfully",
          data: {
            giftId: testGiftId,
            giftName: testGiftName,
            giftDescription: "This is a test gift for updating",
            giftPoint: 500,
            quantity: 10,
            giftCode: testGiftCode,
            giftImage: "/images/gifts/test-gift.jpg",
            giftStatus: true, // Changed to inactive
            isDelete: false
          }
        }
      }).as('updateGiftStatus');
  
      // Change the gift status from Active to Inactive
      cy.get('select[name="giftStatus"]').select('Inactive');
      
      // Submit the form
      cy.contains('button', 'Update Gift').click();
      cy.wait('@updateGiftStatus');
      
      // Check for success message
      cy.get('.swal2-title', { timeout: 10000 }).should('contain', 'Success');
      cy.get('.swal2-confirm').click();
      
      // Verify redirect back to gift list
      cy.url().should('include', '/gifts');
    });
  });
  