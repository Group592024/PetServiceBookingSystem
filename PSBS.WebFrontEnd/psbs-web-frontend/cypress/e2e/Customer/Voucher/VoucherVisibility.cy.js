describe("Voucher Visibility Tests", () => {
  const testVoucherName = "Visibility Test Voucher";
  const testVoucherCode = "VISTEST123";
  
  before(() => {
    // Clean up any existing test vouchers
    cy.login("user6@example.com", "123456");
    cy.deleteVoucher(testVoucherCode);
  });

  it("should create a voucher as admin and verify it appears for customers", () => {
    // 1. Login as admin and create a voucher
    cy.login("user6@example.com", "123456");
    cy.visit("http://localhost:3000/vouchers");
    cy.contains("button", "NEW").click();
    
    // Fill out the voucher form
    cy.get('input[name="voucherName"]').type(testVoucherName);
    cy.get('input[name="voucherCode"]').type(testVoucherCode);
    cy.get('input[name="voucherQuantity"]').type("100");
    cy.get('input[name="voucherDiscount"]').type("15");
    cy.get('input[name="voucherMaximum"]').type("200");
    cy.get('input[name="voucherMinimumSpend"]').type("50");
    
    // Set dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);
    const formatDate = (date) => date.toISOString().split("T")[0];
    cy.get('input[name="voucherStartDate"]').type(formatDate(startDate));
    cy.get('input[name="voucherEndDate"]').type(formatDate(endDate));
    cy.get('input[name="voucherDescription"]').type("Visibility test voucher");
    
    // Set isGift to No (since backend filters out gift vouchers for customers)
    cy.get('[data-testid="isGift"]').parent().click();
    cy.contains("li", "No").click({ force: true });
    
    
    // Submit the form
  cy.contains("button", "Submit").click({ force: true });

    
    // Handle success message
    cy.get(".swal2-title", { timeout: 10000 }).should("contain", "Success");
    cy.get(".swal2-confirm").click();
    
    // 2. Logout and login as customer
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login("431straight@ptct.net", "123456");
    
    // 3. Visit customer voucher page
    cy.visit("http://localhost:3000/customer/vouchers");
    
    // 4. Verify the voucher is visible
    cy.contains(testVoucherName).should("be.visible");
    cy.contains("15%").should("be.visible"); // Verify discount percentage
  });

  it("should update voucher to inactive and verify it disappears for customers", () => {
    // 1. Login as admin
    cy.login("user6@example.com", "123456");
    cy.visit("http://localhost:3000/vouchers");
    
    // 2. Find and edit the test voucher
    cy.get(".MuiDataGrid-cell")
      .contains(testVoucherCode)
      .should("exist")
      .then(() => {
        // Find the edit button in the same row
        cy.get('button[aria-label="edit"]').first().click();
      });
    
    // 3. Change status to inactive (No)
    cy.get('[data-testid="isDeleted"]').parent().click();
    cy.contains("li", "No").click({ force: true });
    
    // 4. Submit the update
  cy.contains("button", "Submit").click({ force: true });

    
    // 5. Handle success message
    cy.get(".swal2-title", { timeout: 10000 }).should("contain", "Success");
    cy.get(".swal2-confirm").click();
    
    // 6. Logout and login as customer
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login("431straight@ptct.net", "123456");
    
    // 7. Visit customer voucher page
    cy.visit("http://localhost:3000/customer/vouchers");
    
    // 8. Verify the voucher is NOT visible
    cy.contains(testVoucherName).should("not.exist");
  });

  it("should verify gift vouchers are not visible to customers", () => {
    // 1. Login as admin and create a gift voucher
    cy.login("user6@example.com", "123456");
    cy.visit("http://localhost:3000/vouchers");
    cy.contains("button", "NEW").click();
    
    // Fill out the voucher form for a gift voucher
    const giftVoucherName = "Gift Voucher Test";
    const giftVoucherCode = "GIFTTEST123";
    
    cy.get('input[name="voucherName"]').type(giftVoucherName);
    cy.get('input[name="voucherCode"]').type(giftVoucherCode);
    cy.get('input[name="voucherQuantity"]').type("50");
    cy.get('input[name="voucherDiscount"]').type("25");
    cy.get('input[name="voucherMaximum"]').type("300");
    cy.get('input[name="voucherMinimumSpend"]').type("100");
    
    // Set dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);
    const formatDate = (date) => date.toISOString().split("T")[0];
    cy.get('input[name="voucherStartDate"]').type(formatDate(startDate));
    cy.get('input[name="voucherEndDate"]').type(formatDate(endDate));
    cy.get('input[name="voucherDescription"]').type("Gift voucher test");
    
    // Set isGift to Yes
    cy.get('[data-testid="isGift"]').parent().click();
    cy.contains("li", "Yes").click();
    cy.get('body').click(0, 0); 
    // Set status to Active (Yes)
    // Submit the form
  cy.contains("button", "Submit").click({ force: true });

    
    // Handle success message
    cy.get(".swal2-title", { timeout: 10000 }).should("contain", "Success");
    cy.get(".swal2-confirm").click();
    
    // 2. Logout and login as customer
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login("431straight@ptct.net", "123456");
    
    // 3. Visit customer voucher page
    cy.visit("http://localhost:3000/customer/vouchers");
    
    // 4. Verify the gift voucher is NOT visible (based on backend filter)
    cy.contains(giftVoucherName).should("not.exist");
    
    // 5. Clean up - login as admin and delete the gift voucher
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login("user6@example.com", "123456");
    cy.deleteVoucher(giftVoucherCode);
  });

  it("should verify search functionality for customer vouchers", () => {
    // 1. Login as admin and create another active voucher
    cy.login("user6@example.com", "123456");
    cy.visit("http://localhost:3000/vouchers");
    cy.contains("button", "NEW").click();
    
    const searchTestVoucherName = "SearchableVoucher";
    const searchTestVoucherCode = "SEARCH123";
    
    cy.get('input[name="voucherName"]').type(searchTestVoucherName);
    cy.get('input[name="voucherCode"]').type(searchTestVoucherCode);
    cy.get('input[name="voucherQuantity"]').type("75");
    cy.get('input[name="voucherDiscount"]').type("10");
    cy.get('input[name="voucherMaximum"]').type("150");
    cy.get('input[name="voucherMinimumSpend"]').type("30");
    
    // Set dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);
    const formatDate = (date) => date.toISOString().split("T")[0];
    cy.get('input[name="voucherStartDate"]').type(formatDate(startDate));
    cy.get('input[name="voucherEndDate"]').type(formatDate(endDate));
    cy.get('input[name="voucherDescription"]').type("Search test voucher");
    
    // Set isGift to No
    cy.get('[data-testid="isGift"]').parent().click();
    cy.contains("li", "No").click({ force: true });
    cy.get('body').type('{esc}');
    // Submit the form
  cy.contains("button", "Submit").click({ force: true });

    
    // Handle success message
    cy.get(".swal2-title", { timeout: 10000 }).should("contain", "Success");
    cy.get(".swal2-confirm").click();
    
    // 2. Logout and login as customer
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login("431straight@ptct.net", "123456");
    
    // 3. Visit customer voucher page
    cy.visit("http://localhost:3000/customer/vouchers");
    
    // 4. Test search functionality
    cy.get("input[placeholder='Search vouchers...']").type("Search");
    cy.wait(500);
    
    // 5. Verify only the searchable voucher is visible
    cy.contains(searchTestVoucherName).should("be.visible");
    cy.contains(testVoucherName).should("not.exist"); // The inactive voucher
    
    // 6. Clear search and verify all active vouchers are visible
    cy.get("input[placeholder='Search vouchers...']").clear();
    cy.wait(500);
    cy.contains(searchTestVoucherName).should("be.visible");
    
    // 7. Clean up - login as admin and delete the search test voucher
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.login("user6@example.com", "123456");
    cy.deleteVoucher(searchTestVoucherCode);
  });

  after(() => {
    // Clean up all test vouchers
    cy.login("user6@example.com", "123456");
    cy.deleteVoucher(testVoucherCode);
  });
});
