describe("Voucher List E2E Tests", () => {
  before(() => {
    // loginByHien once before all tests
    cy.loginByHien("tranhthibich@gmail.com", "bich2024");
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.loginByHien("tranhthibich@gmail.com", "bich2024");
    cy.visit("http://localhost:3000/vouchers");
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it("should display the voucher list correctly", () => {
    // Verify table structure
    cy.get(".MuiDataGrid-root").should("exist");
    cy.get(".MuiDataGrid-virtualScrollerRenderZone").should("exist");
    cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);

    // Verify UI elements
    cy.get(".datatableTitle")
      .should("contain", "Voucher List")
      .and("be.visible");
    cy.contains("button", "NEW").should("be.visible");

    // Verify column headers (adjust based on your actual column configuration)
    const expectedHeaders = [
      "No.",
      "Voucher Name",
      "Voucher Code",
      "Voucher Quantity",
      "Voucher Type",
      "Status",
      "Action",
    ];
    cy.get(".MuiDataGrid-columnHeaderTitle").each(($el, index) => {
      cy.wrap($el).should("contain.text", expectedHeaders[index]);
    });
  });
  it("should display the voucher list or show empty message", () => {
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
        // or: cy.get('.MuiDataGrid-overlay').should('contain', 'No rows');
      }
    });

    // Still verify the title and NEW button regardless
    cy.get(".datatableTitle")
      .should("contain", "Voucher List")
      .and("be.visible");
    cy.contains("button", "NEW").should("be.visible");

    // Column headers check
    const expectedHeaders = [
      "No.",
      "Voucher Name",
      "Voucher Code",
      "Voucher Quantity",
      "Voucher Type",
      "Status",
      "Action",
    ];
    cy.get(".MuiDataGrid-columnHeaderTitle").each(($el, index) => {
      cy.wrap($el).should("contain.text", expectedHeaders[index]);
    });
  });
});
