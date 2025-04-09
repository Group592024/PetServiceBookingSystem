describe("Voucher Detail View Tests", () => {
  // Use a fixed voucher code for easy cleanup
  const voucherCode = "DETAIL-TEST-VOUCHER";
  const voucherName = "Detail Test Voucher";

  before(() => {
    // Login first
    cy.login("user6@example.com", "123456");

    // Create voucher through UI
    cy.visit("http://localhost:3000/vouchers");
    cy.contains("button", "NEW").click();

    // Fill out the form fields
    cy.get('input[name="voucherName"]').type(voucherName);
    cy.get('input[name="voucherCode"]').type(voucherCode);
    cy.get('input[name="voucherQuantity"]').type("5");
    cy.get('input[name="voucherDiscount"]').type("20");
    cy.get('input[name="voucherMaximum"]').type("200");
    cy.get('input[name="voucherMinimumSpend"]').type("100");

    // Date pickers
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 14);

    const formatDate = (date) => date.toISOString().split("T")[0]; // format: YYYY-MM-DD

    cy.get('input[name="voucherStartDate"]').type(formatDate(startDate));
    cy.get('input[name="voucherEndDate"]').type(formatDate(endDate));

    cy.get('input[name="voucherDescription"]').type(
      "This is a test voucher for detail view testing"
    );

    // Set isGift to Yes
    cy.get('[data-testid="isGift"]').parent().click();
    cy.contains("li", "Yes").click();

    // Submit the form
    cy.contains("button", "Submit").click();

    // Handle potential duplicate error
    cy.get("body").then(($body) => {
      // If we get an error about duplicate voucher code
      if (
        $body.text().includes("already exists") ||
        $body.text().includes("duplicate")
      ) {
        cy.log("Voucher already exists, proceeding with tests");
        cy.get(".swal2-confirm").click();
        cy.go("back"); // Go back to voucher list
      } else {
        // Wait for success message and confirm
        cy.get(".swal2-title").should("contain", "Success");
        cy.get(".swal2-confirm").click();
      }

      // Wait for redirect back to voucher list
      cy.url().should("include", "/vouchers");
    });
  });

  beforeEach(() => {
    cy.login("user6@example.com", "123456");
    cy.visit("http://localhost:3000/vouchers");
  });
  after(() => {
    // Delete the test voucher
    cy.deleteVoucher(voucherCode);
  });
  it("should navigate to and display voucher details correctly", () => {
    // Find the row containing our voucher code
    cy.contains(".MuiDataGrid-cell", voucherCode)
      .should("be.visible")
      .then(($cell) => {
        // Get the row ID from the parent row
        const rowId = $cell.closest(".MuiDataGrid-row").attr("data-id");
        cy.log(`Found voucher row with ID: ${rowId}`);

        // Now find the action column in this row
        // This assumes there's a column with action buttons (view, edit, delete)
        // We'll look for any button that might be the view button
        cy.get(`[data-id="${rowId}"]`)
          .find("button")
          .then(($buttons) => {
            cy.log(`Found ${$buttons.length} buttons in this row`);

            // Try to find a button with a view icon or text
            let viewButton = null;

            // Look for common view button indicators
            $buttons.each((i, el) => {
              const $el = Cypress.$(el);
              const html = $el.html().toLowerCase();
              const ariaLabel = $el.attr("aria-label")?.toLowerCase();

              if (
                html.includes("visibility") ||
                html.includes("eye") ||
                html.includes("view") ||
                ariaLabel === "view" ||
                ariaLabel?.includes("view")
              ) {
                viewButton = $el;
                return false; // break the loop
              }
            });

            if (viewButton) {
              cy.wrap(viewButton).click();
            } else {
              // If we can't identify the view button specifically, click the first button
              // (often the first is view, second is edit, third is delete)
              cy.log(
                "Could not identify view button specifically, clicking first button"
              );
              cy.wrap($buttons[0]).click();
            }
          });
      });

    // Verify we're on the details page
    cy.url().should("include", "/vouchers/detail/");

    // Check that the details are displayed correctly in read-only fields
    cy.get('input[name="voucherName"][readonly]').should(
      "have.value",
      voucherName
    );
    cy.get('input[name="voucherCode"][readonly]').should(
      "have.value",
      voucherCode
    );
    cy.get('input[name="voucherQuantity"][readonly]').should("have.value", "5");
    cy.get('input[name="voucherDiscount"][readonly]').should(
      "have.value",
      "20"
    );
    cy.get('input[name="voucherMaximum"][readonly]').should(
      "have.value",
      "200"
    );
    cy.get('input[name="voucherMinimumSpend"][readonly]').should(
      "have.value",
      "100"
    );

    // Check dates - we'll just verify they exist since the exact dates will vary
    cy.get('input[name="voucherStartDate"][readonly]').should("exist");
    cy.get('input[name="voucherEndDate"][readonly]').should("exist");

    // Check description
    cy.get('input[name="voucherDescription"][readonly]').should(
      "have.value",
      "This is a test voucher for detail view testing"
    );

    // Check Gift status (Yes)
    cy.get("#isGift").should("contain.text", "Yes");

    // Check Voucher Status (Active/No for isDeleted)
    cy.get("#isDeleted").should("contain.text", "No");
  });

  it("should have a working back button", () => {
    // First navigate to the detail page using the same approach as above
    cy.contains(".MuiDataGrid-cell", voucherCode)
      .should("be.visible")
      .then(($cell) => {
        const rowId = $cell.closest(".MuiDataGrid-row").attr("data-id");
        cy.get(`[data-id="${rowId}"]`)
          .find("button")
          .first() // Assuming first button is view
          .click();
      });

    // Check that the back button works
    cy.get("button").contains("Back").click();
    cy.url().should("include", "/vouchers");
    cy.url().should("not.include", "/detail");
  });

  it("should display not found for invalid voucher ID", () => {
    cy.visit(
      "http://localhost:3000/vouchers/detail/b1d1f7a2-4484-4b07-9e10-9e7c7f85566c"
    );
    cy.contains("voucher requested not found").should("exist");
  });
});
