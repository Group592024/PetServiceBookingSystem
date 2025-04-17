/// <reference types="cypress" />

describe("Point Rule List E2E Tests", () => {
    before(() => {
      // Login once before all tests
      cy.loginByHien("user6@example.com", "123456");
    });
  
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("user6@example.com", "123456");
      cy.visit("http://localhost:3000/settings/pointRule");
    });
  
    afterEach(() => {
      cy.saveLocalStorage();
    });
  
    it("should display the Point Rule list correctly", () => {
      // Verify table structure
      cy.get(".MuiDataGrid-root").should("exist");
      cy.get(".MuiDataGrid-virtualScrollerRenderZone").should("exist");
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
  
      // Verify UI elements
      cy.get(".datatableTitle")
        .should("contain", "Point Rule List")
        .and("be.visible");
      cy.contains("button", "NEW").should("be.visible");
  
      // Verify column headers (based on your actual column configuration)
      const expectedHeaders = [
        "No.",
        "Point Rule Ratio",
        "Status",
        "Action",
      ];
      cy.get(".MuiDataGrid-columnHeaderTitle").each(($el, index) => {
        cy.wrap($el).should("contain.text", expectedHeaders[index]);
      });
    });
  
    it("should display the point rule list or show empty message", () => {
      cy.get(".MuiDataGrid-root").should("exist");
      
      // Check if the table has any rows
      cy.get(".MuiDataGrid-virtualScrollerRenderZone").then(($zone) => {
        const rowCount = $zone.find("[data-rowindex]").length;
        if (rowCount > 0) {
          // ✅ Table has rows
          cy.log("Table has data");
          cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
        } else {
          // ❌ Table is empty
          cy.log("Table is empty");
          cy.contains("No rows").should("be.visible");
        }
      });
  
      // Still verify the title and NEW button regardless
      cy.get(".datatableTitle")
        .should("contain", "Point Rule List")
        .and("be.visible");
      cy.contains("button", "NEW").should("be.visible");
  
      // Column headers check
      const expectedHeaders = [
        "No.",
        "Point Rule Ratio",
        "Status",
        "Action",
      ];
      cy.get(".MuiDataGrid-columnHeaderTitle").each(($el, index) => {
        cy.wrap($el).should("contain.text", expectedHeaders[index]);
      });
    });
  
    it("should open the add new point rule modal when clicking NEW button", () => {
      // Click on the NEW button
      cy.contains("button", "NEW").click();
      
      // Verify modal appears with correct title and fields
      cy.contains("Point Rule").should("be.visible");
      cy.get('input[name="pointRuleRatio"]').should("exist");
      
      // Verify buttons
      cy.contains("button", "Submit").should("be.visible");
      cy.contains("button", "Close").should("be.visible");
      
      // Close the modal
      cy.contains("button", "Close").click();
    });
  
    it("should show point rule details when clicking the info button", () => {
      // Wait for table to load
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      
      // Click on the info button of the first row
      cy.get(".MuiDataGrid-row")
        .first()
        .find('[aria-label="info"]')
        .click();
      
      // Verify modal appears with correct title and fields
      cy.contains("Point Rule").should("be.visible");
    
      cy.get('input[name="pointRuleRatio"]').should("be.visible");
      
      // Close the modal
      cy.contains("button", "Close").click();
    });
  
    it("should show edit modal when clicking the edit button", () => {
      // Wait for table to load
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      
      // Click on the edit button of the first row
      cy.get(".MuiDataGrid-row")
        .first()
        .find('[aria-label="edit"]')
        .click();
      
      // Verify modal appears with correct title and fields
      cy.contains("Point Rule").should("be.visible");
    
      cy.get('input[name="pointRuleRatio"]').should("be.enabled");
      
      // Verify buttons
      cy.contains("button", "Submit").should("be.visible");
      cy.contains("button", "Close").should("be.visible");
      
      // Close the modal
      cy.contains("button", "Close").click();
    });
  
    it("should show confirmation dialog when clicking the delete button", () => {
      // Wait for table to load
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      
      // Click on the delete button of the first row
      cy.get(".MuiDataGrid-row")
        .first()
        .find('[aria-label="delete"]')
        .click();
      
      // Verify confirmation dialog appears
      cy.contains("Are you sure?").should("be.visible");
      cy.contains("You won't be able to revert this!").should("be.visible");
      cy.contains("button", "Yes, delete it!").should("be.visible");
      cy.contains("button", "Cancel").should("be.visible");
      
      // Close the deletion
      cy.contains("button", "Cancel").click();
    });
  
    it("should validate input when adding a new point rule", () => {
      // Click on the NEW button
      cy.contains("button", "NEW").click();
      
      // Try to submit without entering data
      cy.contains("button", "Submit").click();
      
      // Verify validation message
      cy.contains("This must be a valid integer").should("be.visible");
      
      // Enter invalid data (negative number)
      cy.get('input[name="pointRuleRatio"]').type("-5");
      cy.contains("button", "Submit").click();
      
      // Verify validation message for negative value
      cy.contains("This must not be negative").should("be.visible");
      
      // Enter invalid data (non-integer)
      cy.get('input[name="pointRuleRatio"]').clear().type("abc");
      cy.contains("button", "Submit").click();
      
      // Verify validation message for non-integer
      cy.contains("This must be a valid integer").should("be.visible");
      
      // Close the modal
      cy.contains("button", "Close").click();
    });
  
    it("should display active/inactive status correctly", () => {
      // Wait for table to load
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      
      // Check for status chips
      cy.get(".MuiChip-label").each(($chip) => {
        const text = $chip.text();
        expect(text).to.be.oneOf(["Active", "Inactive"]);
        
        if (text === "Active") {
          cy.wrap($chip).parent().should("have.class", "MuiChip-colorSuccess");
        } else if (text === "Inactive") {
          cy.wrap($chip).parent().should("have.class", "MuiChip-colorError");
        }
      });
    });
  });
  