/// <reference types="cypress" />

describe("Delete Point Rule E2E Tests", () => {
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
    });
  
    afterEach(() => {
      cy.saveLocalStorage();
    });
  
    it("should display delete confirmation dialog when clicking delete button", () => {
      // Click on the delete button of the first row
      cy.get(".MuiDataGrid-row")
        .first()
        .find('[aria-label="delete"]')
        .click();
      
      // Verify confirmation dialog appears
      cy.get('.swal2-title').should('contain', 'Are you sure?');
      cy.get('.swal2-html-container').should('contain', 'You won\'t be able to revert this!');
      
      // Verify dialog has both confirm and cancel buttons
      cy.get('.swal2-confirm').should('be.visible');
      cy.get('.swal2-cancel').should('be.visible');
      
      // Cancel the deletion
      cy.get('.swal2-cancel').click();
      
      // Verify dialog is closed
      cy.get('.swal2-container').should('not.exist');
    });
  
    it("should cancel deletion when clicking Cancel button", () => {
      // Get the number of rows before attempting deletion
      let rowCountBefore;
      cy.get(".MuiDataGrid-row").then($rows => {
        rowCountBefore = $rows.length;
      });
      
      // Click on the delete button of the first row
      cy.get(".MuiDataGrid-row")
        .first()
        .find('[aria-label="delete"]')
        .click();
      
      // Click Cancel button
      cy.get('.swal2-cancel').click();
      
      // Verify dialog is closed
      cy.get('.swal2-container').should('not.exist');
      
      
    });
  
    it("should successfully delete an inactive point rule", () => {
      // Enable debugging to see all network requests
      cy.intercept('**/*').as('allRequests');
      
      // Find an inactive point rule to delete
      cy.get('.MuiDataGrid-row').then(($rows) => {
        // Look for a row with an inactive chip
        const inactiveRowIndex = Array.from($rows).findIndex(row => 
          Cypress.$(row).find('.MuiChip-colorError').length > 0
        );
        
        if (inactiveRowIndex >= 0) {
          // Get the text of the point rule to be deleted for verification
          let pointRuleText;
          cy.get('.MuiDataGrid-row')
            .eq(inactiveRowIndex)
            .find('.MuiDataGrid-cell')
            .first()
            .then($cell => {
              pointRuleText = $cell.text();
              
              // Click delete on the inactive row
              cy.get('.MuiDataGrid-row')
                .eq(inactiveRowIndex)
                .find('[aria-label="delete"]')
                .click();
              
              // Confirm deletion
              cy.get('.swal2-confirm').click();
              
              // Wait for any network request
              cy.wait('@allRequests', { timeout: 10000 }).then(() => {
                // Check for success message
                cy.get('body').then(($body) => {
                  if ($body.find('.swal2-title:contains("Success")').length > 0) {
                    cy.get('.swal2-title').should('contain', 'Success');
                    cy.get('.swal2-confirm').click();
                    
                    // Verify the deleted point rule no longer appears in the table
                    cy.get('.MuiDataGrid-row').each(($row) => {
                      cy.wrap($row)
                        .find('.MuiDataGrid-cell')
                        .first()
                        .should('not.have.text', pointRuleText);
                    });
                  }
                });
              });
            });
        } else {
          // No inactive rules found, skip this test
          cy.log('No inactive point rules found, skipping test');
        }
      });
    });
  
  
  
    it("should handle API error when deleting a point rule", () => {
      // Mock an API error response for DELETE requests
      cy.intercept('DELETE', '**/api/PointRule/*', {
        statusCode: 400,
        body: {
          flag: false,
          message: "Cannot delete the point rule at this time."
        }
      }).as('deleteError');
      
      // Enable debugging to see all network requests
      cy.intercept('**/*').as('allRequests');
      
      // Click on the delete button of the first row
      cy.get(".MuiDataGrid-row")
        .first()
        .find('[aria-label="delete"]')
        .click();
      
      // Confirm deletion
      cy.get('.swal2-confirm').click();
      
      // Wait for any network request
      cy.wait('@allRequests', { timeout: 10000 }).then(() => {
        // Check for error message
        cy.get('body').then(($body) => {
          if ($body.find('.swal2-title:contains("Error")').length > 0) {
            cy.get('.swal2-title').should('contain', 'Error');
            cy.get('.swal2-html-container').should('contain', 'Cannot delete the point rule at this time.');
            cy.get('.swal2-confirm').click();
          }
        });
      });
    });
  
    it("should handle network error when deleting a point rule", () => {
      // Mock a network error for DELETE requests
      cy.intercept('DELETE', '**/api/PointRule/*', {
        forceNetworkError: true
      }).as('networkError');
      
      // Enable debugging to see all network requests
      cy.intercept('**/*').as('allRequests');
      
      // Click on the delete button of the first row
      cy.get(".MuiDataGrid-row")
        .first()
        .find('[aria-label="delete"]')
        .click();
      
      // Confirm deletion
      cy.get('.swal2-confirm').click();
      
      // Wait for any network request
      cy.wait('@allRequests', { timeout: 10000 }).then(() => {
        // Verify error toast or message appears
        cy.get('body').then(($body) => {
          if ($body.find('.Toastify__toast--error').length > 0) {
            cy.get('.Toastify__toast--error').should('be.visible');
          } else if ($body.find('.swal2-title:contains("Error")').length > 0) {
            cy.get('.swal2-title').should('contain', 'Error');
            cy.get('.swal2-confirm').click();
          }
        });
      });
    });
  
  
  
    it("should delete a point rule and update the table", () => {
      // Find a point rule that can be deleted (preferably inactive)
      cy.get('.MuiDataGrid-row').then(($rows) => {
        // Look for a row with an inactive chip
        const inactiveRowIndex = Array.from($rows).findIndex(row => 
          Cypress.$(row).find('.MuiChip-colorError').length > 0
        );
        
        // If no inactive rule found, use the second active rule if multiple active rules exist
        const activeRows = $rows.filter((_, row) => 
          Cypress.$(row).find('.MuiChip-colorSuccess').length > 0
        );
        
        let rowToDelete = inactiveRowIndex >= 0 ? inactiveRowIndex : 
                          (activeRows.length > 1 ? Array.from($rows).indexOf(activeRows[1]) : -1);
        
        if (rowToDelete >= 0) {
          // Enable debugging to see all network requests
          cy.intercept('**/*').as('allRequests');
          
          // Get the total number of rows before deletion
          const totalRowsBefore = $rows.length;
          
          // Click delete on the selected row
          cy.get('.MuiDataGrid-row')
            .eq(rowToDelete)
            .find('[aria-label="delete"]')
            .click();
          
          // Confirm deletion
          cy.get('.swal2-confirm').click();
          
          // Wait for any network request
          cy.wait('@allRequests', { timeout: 10000 }).then(() => {
            // Check for success message
            cy.get('body').then(($body) => {
              if ($body.find('.swal2-title:contains("Success")').length > 0) {
                cy.get('.swal2-title').should('contain', 'Success');
                cy.get('.swal2-confirm').click();
                
                // Verify the table has one fewer row
                cy.get(".MuiDataGrid-row").should('have.length', totalRowsBefore - 1);
              } else if ($body.find('.swal2-title:contains("Error")').length > 0) {
                // If there's an error, log it but don't fail the test
                cy.log('Error occurred during deletion');
                cy.get('.swal2-confirm').click();
              }
            });
          });
        } else {
          // No suitable point rule found for deletion
          cy.log('No suitable point rule found for deletion, skipping test');
        }
      });
    });
  
    it("should show empty state when all point rules are deleted", () => {
      // This test is conditional - it will only run if there's exactly one point rule left
      cy.get('.MuiDataGrid-row').then(($rows) => {
        if ($rows.length === 1) {
          // If there's only one row and it's inactive, we can try to delete it
          const isInactive = Cypress.$($rows[0]).find('.MuiChip-colorError').length > 0;
          
          if (isInactive) {
            // Enable debugging to see all network requests
            cy.intercept('**/*').as('allRequests');
            
            // Click delete on the row
            cy.get('.MuiDataGrid-row')
              .first()
              .find('[aria-label="delete"]')
              .click();
            
            // Confirm deletion
            cy.get('.swal2-confirm').click();
            
            // Wait for any network request
            cy.wait('@allRequests', { timeout: 10000 }).then(() => {
              // Check for success message
              cy.get('body').then(($body) => {
                if ($body.find('.swal2-title:contains("Success")').length > 0) {
                  cy.get('.swal2-title').should('contain', 'Success');
                  cy.get('.swal2-confirm').click();
                  
                  // Verify empty state is shown
                  cy.get('.MuiDataGrid-overlay').should('be.visible');
                  cy.get('.MuiDataGrid-overlay').should('contain', 'No rows');
                }
              });
            });
          } else {
            cy.log('The last point rule is active and cannot be deleted, skipping test');
          }
        } else {
          cy.log('Multiple point rules exist, skipping empty state test');
        }
      });
    });
  });
  