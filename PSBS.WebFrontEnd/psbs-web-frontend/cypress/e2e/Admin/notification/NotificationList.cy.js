describe("NotificationNotification List E2E Tests", () => {
  before(() => {
    // Login once before all tests
    cy.login("user6@example.com", "123456");
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.login("user6@example.com", "123456");
    cy.visit("http://localhost:3000/notification");
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it("should display the NotificationNotification list correctly", () => {
    // Verify table structure
    cy.get(".MuiDataGrid-root").should("exist");
    cy.get(".MuiDataGrid-virtualScrollerRenderZone").should("exist");
    cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);

    // Verify UI elements
    cy.get(".datatableTitle")
      .should("contain", "Notifications List")
      .and("be.visible");
    cy.contains("button", "NEW").should("be.visible");

    // Verify column headers (adjust based on your actual column configuration)
    const expectedHeaders = [
      "No.",
      "Notification Title",
      "Notification Type",
      "Created Date",
      "Is Pushed",
      "Status",
      "Action",
    ];
    cy.get(".MuiDataGrid-columnHeaderTitle").each(($el, index) => {
      cy.wrap($el).should("contain.text", expectedHeaders[index]);
    });
  });
  it("should display the notification list or show empty message", () => {
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
      .should("contain", "Notifications List")
      .and("be.visible");
    cy.contains("button", "NEW").should("be.visible");

    // Column headers check
    const expectedHeaders = [
      "No.",
      "Notification Title",
      "Notification Type",
      "Created Date",
      "Is Pushed",
      "Status",
      "Action",
    ];
    cy.get(".MuiDataGrid-columnHeaderTitle").each(($el, index) => {
      cy.wrap($el).should("contain.text", expectedHeaders[index]);
    });
  });
});
