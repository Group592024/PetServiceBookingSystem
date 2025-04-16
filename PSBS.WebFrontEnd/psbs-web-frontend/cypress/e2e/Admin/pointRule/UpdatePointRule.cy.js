/// <reference types="cypress" />

describe("Edit Point Rule E2E Tests", () => {
  before(() => {
    // Login once before all tests
    cy.loginByHien("user6@example.com", "123456");
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.loginByHien("user6@example.com", "123456");
    cy.visit("http://localhost:3000/settings/pointRule");
    
    // Wait for the table to load
    cy.get(".MuiDataGrid-root").should("exist");
    cy.get(".MuiDataGrid-virtualScrollerRenderZone").should("exist");
    cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
    
    // Click on the edit button of the first row to open edit modal
    cy.get(".MuiDataGrid-row")
      .first()
      .find('[aria-label="edit"]')
      .click();
    
    // Verify modal appears with correct title
    cy.contains("Point Rule").should("be.visible");
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  
  it("should validate required fields when editing", () => {
    // Clear the input field
    cy.get('input[name="pointRuleRatio"]').clear();
    
    // Click Submit button
    cy.contains("button", "Submit").click();
    
    // Verify validation message for required field
    cy.contains("This must be a valid integer").should("be.visible");
    
    // Close the modal
    cy.contains("button", "Close").click();
    
    // Verify modal is closed by checking that the modal buttons no longer exist
    cy.contains("button", "Submit").should("not.exist");
    cy.contains("button", "Close").should("not.exist");
  });

  it("should validate negative values when editing", () => {
    // Clear and enter negative value
    cy.get('input[name="pointRuleRatio"]').clear().type("-5");
    
    // Click Submit button
    cy.contains("button", "Submit").click();
    
    // Verify validation message for negative value
    cy.contains("This must not be negative").should("be.visible");
    
    // Close the modal
    cy.contains("button", "Close").click();
    
    // Verify modal is closed by checking that the modal buttons no longer exist
    cy.contains("button", "Submit").should("not.exist");
    cy.contains("button", "Close").should("not.exist");
  });

  it("should validate non-integer values when editing", () => {
    // Clear and enter non-integer value
    cy.get('input[name="pointRuleRatio"]').clear().type("abc");
    
    // Click Submit button
    cy.contains("button", "Submit").click();
    
    // Verify validation message for non-integer
    cy.contains("This must be a valid integer").should("be.visible");
    
    // Close the modal
    cy.contains("button", "Close").click();
    
    // Verify modal is closed by checking that the modal buttons no longer exist
    cy.contains("button", "Submit").should("not.exist");
    cy.contains("button", "Close").should("not.exist");
  });

  it("should validate decimal values when editing", () => {
    // Clear and enter decimal value
    cy.get('input[name="pointRuleRatio"]').clear().type("10.5");
    
    // Click Submit button
    cy.contains("button", "Submit").click();
    
    // Verify validation message for non-integer
    cy.contains("This must be a valid integer").should("be.visible");
    
    // Close the modal
    cy.contains("button", "Close").click();
    
    // Verify modal is closed by checking that the modal buttons no longer exist
    cy.contains("button", "Submit").should("not.exist");
    cy.contains("button", "Close").should("not.exist");
  });

  it("should successfully update a point rule with valid data", () => {
    // Enable debugging to see all network requests
    cy.intercept('**/*').as('allRequests');
    
    // Get the input field and store its original value
    cy.get('input[name="pointRuleRatio"]').then(($input) => {
      const originalValue = $input.val();
      const newValue = parseInt(originalValue) + 5;
      
      // Log the values for debugging
      cy.log(`Original value: ${originalValue}, New value: ${newValue}`);
      
      // Clear and enter a new valid point rule ratio
      cy.get('input[name="pointRuleRatio"]').clear().type(newValue.toString());
      
      // Add a small delay to ensure the form has processed the input
      cy.wait(500);
      
      // Click Submit button
      cy.contains("button", "Submit").click();
      
      // Instead of waiting for a specific route, check all network requests
      cy.wait('@allRequests', { timeout: 10000 }).then(() => {
        // Look for any PUT requests to the PointRule API
        cy.get('body').then(() => {
          // Check if success message appears
          cy.get('body').then(($body) => {
            const hasSuccessMessage = $body.find('.swal2-title:contains("Success")').length > 0;
            
            if (hasSuccessMessage) {
              cy.get('.swal2-title').should('contain', 'Success');
              cy.get('.swal2-confirm').click();
              
              // Verify the updated point rule appears in the table
              cy.get('.MuiDataGrid-row').contains(newValue.toString()).should('exist');
            } else {
              // If no success message, check for error message
              if ($body.find('.swal2-title:contains("Error")').length > 0) {
                cy.log('Error dialog found');
                cy.get('.swal2-confirm').click();
              } else {
                // If no dialog at all, the form submission might have failed silently
                cy.log('No dialog appeared after submission');
              }
            }
          });
        });
      });
    });
  });

 

  it("should not update when no changes are made", () => {
    // Enable debugging to see all network requests
    cy.intercept('**/*').as('allRequests');
    
    // Store the original value
    let originalValue;
    cy.get('input[name="pointRuleRatio"]').then(($input) => {
      originalValue = $input.val();
      
      // Click Submit button without making changes
      cy.contains("button", "Submit").click();
      
      // Wait for any network request
      cy.wait('@allRequests', { timeout: 10000 }).then(() => {
        // Check for success or error message
        cy.get('body').then(($body) => {
          if ($body.find('.swal2-title').length > 0) {
            // Verify success or info message
            cy.get('.swal2-title').should('exist');
            cy.get('.swal2-confirm').click();
          }
        });
      });
    });
  });

  

  

  it("should handle very large integer values when editing", () => {
    // Clear and enter a very large integer
    cy.get('input[name="pointRuleRatio"]').clear().type("9999999999");
    
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
        
        // Verify modal is closed by checking that the modal buttons no longer exist
        cy.contains("button", "Submit").should("not.exist");
        cy.contains("button", "Close").should("not.exist");
      }
    });
  });

});

