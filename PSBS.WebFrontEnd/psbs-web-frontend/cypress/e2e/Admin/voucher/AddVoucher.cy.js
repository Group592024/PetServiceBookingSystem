describe("Create Voucher E2E Tests", () => {
  const testVoucherCode = "TEST10000";
  const testVoucherName = "Test Voucher NhaNha";
  before(() => {
    cy.loginByHien("user6@example.com", "123456"); // loginByHien function defined in commands
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.loginByHien("user6@example.com", "123456");
    cy.visit("http://localhost:3000/vouchers");
    cy.contains("button", "NEW").click();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });
  after(() => {
    // Delete the test voucher
    cy.deleteVoucher(testVoucherCode);
  });
  it("should open the create voucher form and submit successfully", () => {
    // Click NEW button

    // Fill out the form fields
    cy.get('input[name="voucherName"]').type("Test Voucher NhaNha");
    cy.get('input[name="voucherCode"]').type("TEST10000");

    cy.get('input[name="voucherQuantity"]').type("50");
    cy.get('input[name="voucherDiscount"]').type("20");
    cy.get('input[name="voucherMaximum"]').type("500");
    cy.get('input[name="voucherMinimumSpend"]').type("100");

    // Date pickers (adjust selectors if you're using MUI, etc.)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);

    const formatDate = (date) => date.toISOString().split("T")[0]; // format: YYYY-MM-DD

    cy.get('input[name="voucherStartDate"]').type(formatDate(startDate));
    cy.get('input[name="voucherEndDate"]').type(formatDate(endDate));

    cy.get('input[name="voucherDescription"]').type(
      "This is a test voucher created by Cypress."
    );

    // Optional checkboxes/switches
    cy.get('[data-testid="isGift"]').parent().click();
    cy.contains("li", "Yes").click();

    // Submit
    cy.contains("button", "Submit").click();

    // Use this for SweetAlert:
    cy.get(".swal2-title").should("contain", "Success"); // Checks the title
    cy.get(".swal2-html-container").should(
      "contain",
      "added to database successfully"
    ); // Checks the content

    // Optionally, assert it redirects back to voucher list
    cy.url().should("include", "/vouchers");
  });
  it("should display validation errors for empty required fields", () => {
    cy.contains("button", "Submit").click();

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

    // Adjusted error messages to match model validation
    cy.contains("Voucher Name is required").should("be.visible");
    cy.contains("Voucher Code is required").should("be.visible");
    cy.contains("This must be a valid number").should("be.visible"); // From your number regex check
  });

  it("should display validation error for quantity less than 0", () => {
    cy.get('input[name="voucherQuantity"]').type("-1");
    cy.contains("button", "Submit").click();
    cy.get('input[name="voucherQuantity"]').should(
      "have.attr",
      "aria-invalid",
      "true"
    );
    // Adjusted to match model message
    cy.contains("Voucher Quantity must be bigger than 0").should("be.visible");
  });

  it("should display validation error for discount less than 0", () => {
    cy.get('input[name="voucherDiscount"]').type("-5");
    cy.contains("button", "Submit").click();
    cy.get('input[name="voucherDiscount"]').should(
      "have.attr",
      "aria-invalid",
      "true"
    );
    // Adjusted to match model message
    cy.contains("Voucher Discount must be between 1 and 100").should(
      "be.visible"
    );
  });

  it("should display validation error for maximum discount less than 0", () => {
    cy.get('input[name="voucherMaximum"]').type("-10");
    cy.contains("button", "Submit").click();
    cy.get('input[name="voucherMaximum"]').should(
      "have.attr",
      "aria-invalid",
      "true"
    );
    // Adjusted to match model message
    cy.contains("Voucher Maximum must be bigger than 0").should("be.visible");
  });

  it("should display validation error for minimum spend less than 0", () => {
    cy.get('input[name="voucherMinimumSpend"]').type("-20");
    cy.contains("button", "Submit").click();
    cy.get('input[name="voucherMinimumSpend"]').should(
      "have.attr",
      "aria-invalid",
      "true"
    );
    // Adjusted to match model message
    cy.contains("Voucher Minimum Spend must be bigger than 0").should(
      "be.visible"
    );
  });

  it("should display validation error for end date before start date", () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() - 7);

    const formatDate = (date) => date.toISOString().split("T")[0];

    cy.get('input[name="voucherStartDate"]').type(formatDate(startDate));
    cy.get('input[name="voucherEndDate"]').type(formatDate(endDate));
    cy.contains("button", "Submit").click();
    cy.get('input[name="voucherEndDate"]').should(
      "have.attr",
      "aria-invalid",
      "true"
    );
    // Adjusted to match model message
    cy.contains(
      "Voucher End Date must be later than Voucher Start Date"
    ).should("be.visible");
  });

  // New test for duplicate voucher name
  it("should display error when adding voucher with existing voucher name", () => {
    // Fill out the form with the same voucher name but different code
    cy.get('input[name="voucherName"]').type(testVoucherName); // Same name as existing voucher
    cy.get('input[name="voucherCode"]').type("DIFFERENT123");

    cy.get('input[name="voucherQuantity"]').type("50");
    cy.get('input[name="voucherDiscount"]').type("20");
    cy.get('input[name="voucherMaximum"]').type("500");
    cy.get('input[name="voucherMinimumSpend"]').type("100");

    // Date pickers
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);
    const formatDate = (date) => date.toISOString().split("T")[0];

    cy.get('input[name="voucherStartDate"]').type(formatDate(startDate));
    cy.get('input[name="voucherEndDate"]').type(formatDate(endDate));

    cy.get('input[name="voucherDescription"]').type("Duplicate name test.");

    // Optional checkboxes/switches
    cy.get('[data-testid="isGift"]').parent().click();
    cy.contains("li", "Yes").click();

    // Submit
    cy.contains("button", "Submit").click();

    // Check for error message
    cy.get(".swal2-title").should("contain", "Error");
    cy.get(".swal2-html-container").should(
      "contain",
      testVoucherName + " already added"
    );
    cy.get(".swal2-confirm").click();
  });

  // Keep your existing validation tests below...
  it("should display validation errors for empty required fields", () => {
    // Existing test code...
  });
});
