/// <reference types="cypress" />

describe("Point Rule Detail E2E Tests", () => {
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
      
      // Click on the info button of the first row to open detail modal
      cy.get(".MuiDataGrid-row")
        .first()
        .find('[aria-label="info"]')
        .click();
      
      // Verify modal appears with correct title
      cy.contains("Point Rule").should("be.visible");
    });
  
    afterEach(() => {
      cy.saveLocalStorage();
    });
  
    
  
    it("should display correct point rule ratio in detail modal", () => {
      // Get the point rule ratio from the table
      let pointRuleRatio;
      cy.get(".MuiDataGrid-row")
        .first()
        .find('.MuiDataGrid-cell')
        .eq(1) // Assuming point rule ratio is in the second column
        .then($cell => {
          pointRuleRatio = $cell.text().trim();
          
          // Verify the point rule ratio in detail modal matches the table
          cy.get('input[name="pointRuleRatio"]')
            .should("have.value", pointRuleRatio);
          
          // Close the modal
          cy.contains("button", "Close").click();
        });
    });
  
   
  
    it("should display created date in detail modal if available", () => {
      // Check if created date field exists
      cy.get('body').then($body => {
        if ($body.find('label:contains("Created Date")').length > 0) {
          // Verify created date field has valid format
          cy.get('label:contains("Created Date")')
            .parent()
            .find('input')
            .should('have.value.match', /\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}|[A-Za-z]+ \d{1,2}, \d{4}/); // Match common date formats
        } else {
          cy.log('Created Date field not found in detail modal');
        }
        
        // Close the modal
        cy.contains("button", "Close").click();
      });
    });
  
    it("should display last modified date in detail modal if available", () => {
      // Check if last modified date field exists
      cy.get('body').then($body => {
        if ($body.find('label:contains("Last Modified")').length > 0) {
          // Verify last modified date field has valid format
          cy.get('label:contains("Last Modified")')
            .parent()
            .find('input')
            .should('have.value.match', /\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}|[A-Za-z]+ \d{1,2}, \d{4}/); // Match common date formats
        } else {
          cy.log('Last Modified field not found in detail modal');
        }
        
        // Close the modal
        cy.contains("button", "Close").click();
      });
    });
  
   
  
    it("should navigate between different point rules in detail view", () => {
      // Close the first detail modal
      cy.contains("button", "Close").click();
      
      // Check if there are at least two rows
      cy.get(".MuiDataGrid-row").then($rows => {
        if ($rows.length >= 2) {
          // Get the point rule ratio from the first row
          let firstPointRuleRatio;
          cy.get(".MuiDataGrid-row")
            .first()
            .find('.MuiDataGrid-cell')
            .eq(1) // Assuming point rule ratio is in the second column
            .then($cell => {
              firstPointRuleRatio = $cell.text().trim();
              
              // Click on the info button of the first row
              cy.get(".MuiDataGrid-row")
                .first()
                .find('[aria-label="info"]')
                .click();
              
              // Verify the first point rule ratio in detail modal
              cy.get('input[name="pointRuleRatio"]')
                .should("have.value", firstPointRuleRatio);
              
              // Close the detail modal
              cy.contains("button", "Close").click();
              
              // Get the point rule ratio from the second row
              let secondPointRuleRatio;
              cy.get(".MuiDataGrid-row")
                .eq(1)
                .find('.MuiDataGrid-cell')
                .eq(1) // Assuming point rule ratio is in the second column
                .then($cell => {
                  secondPointRuleRatio = $cell.text().trim();
                  
                  // Click on the info button of the second row
                  cy.get(".MuiDataGrid-row")
                    .eq(1)
                    .find('[aria-label="info"]')
                    .click();
                  
                  // Verify the second point rule ratio in detail modal
                  cy.get('input[name="pointRuleRatio"]')
                    .should("have.value", secondPointRuleRatio);
                  
                  // Close the detail modal
                  cy.contains("button", "Close").click();
                });
            });
        } else {
          cy.log('Not enough point rules to test navigation, skipping test');
        }
      });
    });
  
   
  
    it("should close the detail modal when clicking the Close button", () => {
      // Click the Close button
      cy.contains("button", "Close").click();
      
      // Verify modal is closed
   
      cy.get('input[name="pointRuleRatio"]').should("not.exist");
    });
  
  
  
    it("should have an edit button if editing is allowed", () => {
      // Check if edit button exists in the modal
      cy.get('body').then($body => {
        const hasEditButton = $body.find('button:contains("Edit")').length > 0;
        
        if (hasEditButton) {
          // Verify edit button is visible
          cy.contains("button", "Edit").should("be.visible");
          
          // Click edit button
          cy.contains("button", "Edit").click();
          
          // Verify we're now in edit mode (fields should be enabled)
          cy.get('input[name="pointRuleRatio"]').should("not.be.disabled");
          
          // Cancel edit mode
          cy.contains("button", "Close").click();
        } else {
          cy.log('No edit button in detail modal, skipping test');
          
          // Close the modal
          cy.contains("button", "Close").click();
        }
      });
    });
  });
  