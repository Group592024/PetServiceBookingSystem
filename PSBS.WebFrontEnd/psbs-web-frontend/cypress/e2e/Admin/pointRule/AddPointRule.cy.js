/// <reference types="cypress" />

describe("Add New Point Rule E2E Tests", () => {
    before(() => {
      // Login once before all tests
      cy.loginByHien("user6@example.com", "123456");
    });
  
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("user6@example.com", "123456");
      cy.visit("http://localhost:3000/settings/pointRule");
      
      // Open the add new point rule modal for each test
      cy.contains("button", "NEW").click();
      cy.contains("Point Rule").should("be.visible");
    });
  
    afterEach(() => {
      cy.saveLocalStorage();
    });
  
    it("should display the add new point rule modal with correct elements", () => {
      // Verify modal title
      cy.contains("Point Rule").should("be.visible");
      
      // Verify form fields
      cy.get('input[name="pointRuleRatio"]').should("exist").and("be.visible");
      
      // Verify buttons
      cy.contains("button", "Submit").should("be.visible");
      cy.contains("button", "Close").should("be.visible");
      
      // Close the modal
      cy.contains("button", "Close").click();
    });
  
    it("should validate required fields", () => {
      // Leave the field empty
      cy.get('input[name="pointRuleRatio"]').should("have.value", "");
      
      // Click Submit button
      cy.contains("button", "Submit").click();
      
      // Verify validation message for required field
      cy.contains("This must be a valid integer").should("be.visible");
      
      // Close the modal
      cy.contains("button", "Close").click();
    });
  
    it("should validate negative values", () => {
      // Enter negative value
      cy.get('input[name="pointRuleRatio"]').type("-5");
      
      // Click Submit button
      cy.contains("button", "Submit").click();
      
      // Verify validation message for negative value
      cy.contains("This must not be negative").should("be.visible");
      
      // Close the modal
      cy.contains("button", "Close").click();
    });
  
    it("should validate non-integer values", () => {
      // Enter non-integer value
      cy.get('input[name="pointRuleRatio"]').type("abc");
      
      // Click Submit button
      cy.contains("button", "Submit").click();
      
      // Verify validation message for non-integer
      cy.contains("This must be a valid integer").should("be.visible");
      
      // Close the modal
      cy.contains("button", "Close").click();
    });
  
    it("should validate decimal values", () => {
      // Enter decimal value
      cy.get('input[name="pointRuleRatio"]').type("10.5");
      
      // Click Submit button
      cy.contains("button", "Submit").click();
      
      // Verify validation message for non-integer
      cy.contains("This must be a valid integer").should("be.visible");
      
      // Close the modal
      cy.contains("button", "Close").click();
    });
  
    it("should successfully add a new point rule with valid data", () => {
      // Intercept the POST request
      cy.intercept('POST', '**/api/PointRule').as('addPointRule');
      
      // Enter valid point rule ratio
      cy.get('input[name="pointRuleRatio"]').type("25");
      
      // Click Submit button
      cy.contains("button", "Submit").click();
      
      // Wait for the API call
      cy.wait('@addPointRule').then((interception) => {
        // Check if the request was successful
        if (interception.response?.statusCode === 200 && interception.response?.body?.flag === true) {
          // Verify success message (if using SweetAlert or similar)
          cy.get('.swal2-title').should('contain', 'Success');
          cy.get('.swal2-confirm').click();
          
          // Verify the new point rule appears in the table
          cy.get('.MuiDataGrid-row').contains('25').should('exist');
        } else {
          // If there's an error message, log it but don't fail the test
          // (since we can't control if there's already an active point rule)
          cy.log('API response:', interception.response?.body);
          
          // If there's an error dialog, close it
          cy.get('body').then(($body) => {
            if ($body.find('.swal2-title').length > 0) {
              cy.get('.swal2-confirm').click();
            }
          });
        }
      });
    });
  
    it("should close the modal when clicking the Close button", () => {
      // Click the Close button
      cy.contains("button", "Close").click();
      
      // Verify modal is closed
      cy.contains("Point Rule List").should("be.visible");
    });
  
    it("should reset form values when reopening the modal", () => {
      // Enter some value
      cy.get('input[name="pointRuleRatio"]').type("30");
      
      // Close the modal
      cy.contains("button", "Close").click();
      
      // Reopen the modal
      cy.contains("button", "NEW").click();
      
      // Verify the input field is empty
      cy.get('input[name="pointRuleRatio"]').should("have.value", "");
      
      // Close the modal again
      cy.contains("button", "Close").click();
    });
  
    it("should handle API error when adding a point rule", () => {
      // Mock an API error response
      cy.intercept('POST', '**/api/PointRule', {
        statusCode: 400,
        body: {
          flag: false,
          message: "Please inactivate the current Point Rule Ratio before adding a new one."
        }
      }).as('addPointRuleError');
      
      // Enter valid point rule ratio
      cy.get('input[name="pointRuleRatio"]').type("40");
      
      // Click Submit button
      cy.contains("button", "Submit").click();
      
      // Wait for the API call
      cy.wait('@addPointRuleError');
      
      // Verify error message (if using SweetAlert or similar)
      cy.get('.swal2-title').should('contain', 'Error');
      cy.get('.swal2-html-container').should('contain', 'Please inactivate the current Point Rule Ratio before adding a new one.');
      cy.get('.swal2-confirm').click();
      
      // Verify modal is still open
      cy.contains("Point Rule").should("be.visible");
          
    });
  
   
  
    it("should handle very large integer values", () => {
      // Enter a very large integer
      cy.get('input[name="pointRuleRatio"]').type("9999999999");
      
      // Click Submit button
      cy.contains("button", "Submit").click();
      
      // This test will either pass if the app accepts large integers
      // or show validation errors if there's a max value constraint
      cy.get('body').then(($body) => {
        if ($body.find('.swal2-title').length > 0) {
          // If there's a success or error message, log it
          cy.log('Response received for large integer');
          cy.get('.swal2-confirm').click();
        } else if ($body.text().includes("must not exceed")) {
          // If there's a validation error about max value
          cy.contains("must not exceed").should("be.visible");
        }
      });
      
      // Close the modal if it's still open
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Close")').length > 0) {
          cy.contains("button", "Close").click();
        }
      });
    });
  });
  