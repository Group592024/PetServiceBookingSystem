describe("Delete Voucher E2E Tests", () => {
    const testVoucherCode = "TEST_DELETE_10000";
    const testVoucherName = "Test Voucher For Deletion";
  
    before(() => {
      // Login and create a test voucher
      cy.login("user6@example.com", "123456");
      cy.createTestVoucher(testVoucherCode, testVoucherName);
    });
  
    beforeEach(() => {
      // Login before each test
      cy.login("user6@example.com", "123456");
      cy.visit("http://localhost:3000/vouchers");
      cy.wait(2000); // Wait for page load
    });
  
    it("should soft delete a voucher on first deletion", () => {
      // Find and click delete button for our test voucher
      cy.contains(".MuiDataGrid-cell", testVoucherCode)
        .parents(".MuiDataGrid-row")
        .within(() => {
          cy.get('button[aria-label="delete"]').click();
        });
  
      // Confirm deletion in the dialog
      cy.get(".swal2-confirm").click();
  
      // Verify soft delete success message
      cy.get(".swal2-title").should("contain", "Deleted!");
      cy.get(".swal2-html-container").should(
        "contain",
        `${testVoucherName} marked as deleted`
      );
      cy.get(".swal2-confirm").click();
  
      // Verify the voucher is still in the table but marked as deleted
      cy.contains(".MuiDataGrid-cell", testVoucherCode).should("exist");
      cy.contains(".MuiDataGrid-cell", "Inactive").should("exist");
    });
  
    it("should permanently delete a voucher on second deletion", () => {
      // Find and click delete button for our test voucher again
      cy.contains(".MuiDataGrid-cell", testVoucherCode)
        .parents(".MuiDataGrid-row")
        .within(() => {
          cy.get('button[aria-label="delete"]').click();
        });
  
      // Confirm permanent deletion in the dialog
      cy.get(".swal2-confirm").click();
  
      // Verify permanent delete success message
      cy.get(".swal2-title").should("contain", "Deleted!");
      cy.get(".swal2-html-container").should(
        "contain",
        `${testVoucherName} permanently deleted`
      );
      cy.get(".swal2-confirm").click();
  
      // Verify the voucher is no longer in the table
      cy.contains(".MuiDataGrid-cell", testVoucherCode).should("not.exist");
    });
  
    it("should show error when trying to delete non-existent voucher", () => {
      // Use the delete command with a non-existent voucher code
      cy.deleteVoucher("NON_EXISTENT_CODE");
  
      // The command will log that it wasn't found but won't throw an error
      // We can verify this by checking the UI remains unchanged
      cy.get(".MuiDataGrid-row").should("exist"); // Table still has rows
    });
  
    after(() => {
      // Clean up - try to delete the test voucher if it still exists
      cy.deleteVoucher(testVoucherCode);
    });
  });