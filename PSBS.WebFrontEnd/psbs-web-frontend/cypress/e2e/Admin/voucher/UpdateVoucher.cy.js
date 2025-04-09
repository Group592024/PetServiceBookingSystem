describe("Update Voucher E2E Tests", () => {
  const testVoucherCode = "TEST10000";
  const testVoucherName = "Test Voucher NhaNha";
  const updatedVoucherName = "Test Voucher Update";
  const updatedVoucherCode = "TESTUpdate10000";

  before(() => {
    cy.loginByHien("user6@example.com", "123456");

    // Create a test voucher if it doesn't exist
    cy.visit("http://localhost:3000/vouchers");
    cy.contains("button", "NEW").click();

    // Fill out the form fields
    cy.get('input[name="voucherName"]').type(testVoucherName);
    cy.get('input[name="voucherCode"]').type(testVoucherCode);
    cy.get('input[name="voucherQuantity"]').type("50");
    cy.get('input[name="voucherDiscount"]').type("20");
    cy.get('input[name="voucherMaximum"]').type("500");
    cy.get('input[name="voucherMinimumSpend"]').type("100");

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);
    const formatDate = (date) => date.toISOString().split("T")[0];

    cy.get('input[name="voucherStartDate"]').type(formatDate(startDate));
    cy.get('input[name="voucherEndDate"]').type(formatDate(endDate));
    cy.get('input[name="voucherDescription"]').type(
      "This is a test voucher for update testing."
    );

    // Set isGift to Yes using the dropdown - use force: true to handle any overlays
    cy.get('[data-testid="isGift"]').parent().click();
    cy.contains("li", "Yes").click({ force: true });

    cy.contains("button", "Submit").click({ force: true });

    // Handle potential duplicate error
    cy.get("body").then(($body) => {
      if (
        $body.text().includes("already added") ||
        $body.text().includes("already exists")
      ) {
        cy.log("Voucher already exists, proceeding with tests");
        cy.get(".swal2-confirm").click();
      } else {
        cy.get(".swal2-confirm").click();
      }
    });
  });

  beforeEach(() => {
    cy.loginByHien("user6@example.com", "123456");
    cy.visit("http://localhost:3000/vouchers");
  });

  after(() => {
    // Delete the test voucher
    cy.deleteVoucher(testVoucherCode);
   
  });

  it("should open the update voucher form and update successfully", () => {
    // Find the voucher by code in the DataGrid
    cy.get(".MuiDataGrid-cell")
      .contains(testVoucherCode)
      .should("exist")
      .then(() => {
        // Find the edit button in the same row
        cy.get('button[aria-label="edit"]').first().click();
      });

    // Clear and update form fields
    cy.get('input[name="voucherName"]').clear().type(updatedVoucherName);
    cy.get('input[name="voucherCode"]').clear().type(updatedVoucherCode);
    cy.get('input[name="voucherQuantity"]').clear().type("50");
    cy.get('input[name="voucherDiscount"]').clear().type("25");
    cy.get('input[name="voucherMaximum"]').clear().type("600");
    cy.get('input[name="voucherMinimumSpend"]').clear().type("150");

    // Update dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 14); // Extend end date
    const formatDate = (date) => date.toISOString().split("T")[0];

    cy.get('input[name="voucherStartDate"]')
      .clear()
      .type(formatDate(startDate));
    cy.get('input[name="voucherEndDate"]').clear().type(formatDate(endDate));

    cy.get('input[name="voucherDescription"]')
      .clear()
      .type("This is an updated test voucher.");

    // Change isGift to No - use force: true to handle any overlays
    cy.get('[data-testid="isGift"]').parent().click();
    cy.contains("li", "No").click({ force: true });

    // Submit update
    cy.contains("button", "Submit").click({ force: true });

    // Check success message
    cy.get(".swal2-title", { timeout: 10000 }).should("contain", "Success");
    cy.get(".swal2-html-container").should("contain", "successfully updated");
    cy.get(".swal2-confirm").click();

    // Verify redirects back to voucher list
    cy.url().should("include", "/vouchers");

    // Verify updated voucher appears in the list
    cy.get(".MuiDataGrid-cell").contains(updatedVoucherCode).should("exist");
  });

  // For validation tests, use the same approach to find the voucher row
  it("should display validation errors for empty required fields", () => {
    // Find the voucher by code in the DataGrid
    cy.get(".MuiDataGrid-cell")
      .contains(updatedVoucherCode)
      .should("exist")
      .then(() => {
        // Find the edit button in the same row
        cy.get('button[aria-label="edit"]').first().click();
      });

    // Clear required fields
    cy.get('input[name="voucherName"]').clear();
    cy.get('input[name="voucherCode"]').clear();
    cy.get('input[name="voucherQuantity"]').clear();
    cy.get('input[name="voucherDiscount"]').clear();
    cy.get('input[name="voucherStartDate"]').clear();
    cy.get('input[name="voucherEndDate"]').clear();

    cy.contains("button", "Submit").click({ force: true });

    // Check for invalid fields
    cy.get('input[name="voucherName"]').should(
      "have.attr",
      "aria-invalid",
      "true"
    );
    cy.get('input[name="voucherCode"]').should(
      "have.attr",
      "aria-invalid",
      "true"
    );
    cy.get('input[name="voucherQuantity"]').should(
      "have.attr",
      "aria-invalid",
      "true"
    );
    cy.get('input[name="voucherDiscount"]').should(
      "have.attr",
      "aria-invalid",
      "true"
    );
    cy.get('input[name="voucherStartDate"]').should(
      "have.attr",
      "aria-invalid",
      "true"
    );
    cy.get('input[name="voucherEndDate"]').should(
      "have.attr",
      "aria-invalid",
      "true"
    );

    // Check error messages
    cy.contains("Voucher Name is required").should("be.visible");
    cy.contains("Voucher Code is required").should("be.visible");
    cy.contains("This must be a valid number").should("be.visible");

    // Go back to voucher list
    cy.contains("button", "Back").click();
  });
  it("should display not found for invalid voucher ID", () => {
    cy.visit(
      "http://localhost:3000/vouchers/update/b1d1f7a2-4484-4b07-9e10-9e7c7f85566c"
    );
    cy.contains("voucher requested not found").should("exist");
  });
});
