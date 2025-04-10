describe("Customer Voucher Detail E2E Tests", () => {
  // Test voucher data
  const testVoucherName = "Test Detail Voucher";
  const testVoucherCode = "DETAILTEST123";
  let testVoucherId;

  before(() => {
    // Create a test voucher as admin that we'll use for detail testing
    cy.login("user6@example.com", "123456");
    cy.visit("http://localhost:3000/vouchers");
    cy.contains("button", "NEW").click();
    
    // Fill out the voucher form
    cy.get('input[name="voucherName"]').type(testVoucherName);
    cy.get('input[name="voucherCode"]').type(testVoucherCode);
    cy.get('input[name="voucherQuantity"]').type("100");
    cy.get('input[name="voucherDiscount"]').type("25");
    cy.get('input[name="voucherMaximum"]').type("200");
    cy.get('input[name="voucherMinimumSpend"]').type("50");
    
    // Set dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);
    const formatDate = (date) => date.toISOString().split("T")[0];
    cy.get('input[name="voucherStartDate"]').type(formatDate(startDate));
    cy.get('input[name="voucherEndDate"]').type(formatDate(endDate));
    cy.get('input[name="voucherDescription"]').type("Test voucher for detail view testing");
    
    // Set isGift to No
    cy.get('[data-testid="isGift"]').parent().click();
    cy.contains("li", "No").click({ force: true });
    cy.get('body').click(0, 0); // Close dropdown
    
    // Submit the form
    cy.contains("button", "Submit").click({ force: true });
    
    // Handle success message
    cy.get(".swal2-title", { timeout: 10000 }).should("contain", "Success");
    cy.get(".swal2-confirm").click();
    
    // Get the voucher ID for direct navigation
    cy.get(".MuiDataGrid-cell")
      .contains(testVoucherCode)
      .closest(".MuiDataGrid-row")
      .invoke("attr", "data-id")
      .then((id) => {
        testVoucherId = id;
      });
  });

  beforeEach(() => {
    cy.login("431straight@ptct.net", "123456");
  });

  after(() => {
    // Clean up - delete the test voucher
    cy.login("user6@example.com", "123456");
    cy.deleteVoucher(testVoucherCode);
  });

  it("should navigate to voucher detail from voucher list", () => {
    // Start from voucher list
    cy.visit("http://localhost:3000/customer/vouchers");
    
    // Find and click on the test voucher
    cy.contains(testVoucherName).click();
    
    // Verify URL contains detail path
    cy.url().should("include", "/customer/vouchers/detail/");
    
    // Verify page title
    cy.contains("h4", "Voucher Details").should("be.visible");
    
    // Verify voucher name is displayed
    cy.contains("h4", testVoucherName).should("be.visible");
  });

  it("should display all voucher information correctly", () => {
    // Direct navigation to voucher detail
    cy.visit(`http://localhost:3000/customer/vouchers/detail/${testVoucherId}`);
    
    // Verify basic voucher information
    cy.contains(testVoucherName).should("be.visible");
    cy.contains("25%").should("be.visible"); // Discount percentage
    cy.contains("DISCOUNT").should("be.visible");
    
    // Verify voucher code section
    cy.contains("Voucher Code").should("be.visible");
    cy.contains(testVoucherCode).should("be.visible");
    
    // Verify validity period section
    cy.contains("Validity Period").should("be.visible");
    cy.contains("Start Date").should("be.visible");
    cy.contains("End Date").should("be.visible");
    
    // Verify discount details section
    cy.contains("Discount Details").should("be.visible");
    cy.contains("Discount").should("be.visible");
    cy.contains("25%").should("be.visible");
    cy.contains("Minimum Spend").should("be.visible");
    cy.contains("$50").should("be.visible");
    cy.contains("Maximum Discount").should("be.visible");
    cy.contains("$200").should("be.visible");
    cy.contains("Quantity").should("be.visible");
    cy.contains("100").should("be.visible");
    
    // Verify terms & conditions section
    cy.contains("Terms & Conditions").should("be.visible");
    
    // Verify voucher status
    cy.contains("Active").should("be.visible");
  });

  it("should copy voucher code to clipboard when clicked", () => {
    cy.visit(`http://localhost:3000/customer/vouchers/detail/${testVoucherId}`);
    
    // Mock the clipboard API
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, "writeText").resolves();
    });
    
    // Click on the voucher code
    cy.contains(testVoucherCode).click();
    
    // Verify snackbar notification appears
    cy.contains("Voucher code copied to clipboard!").should("be.visible");
    
    // Verify clipboard API was called with the correct code
    cy.window().then((win) => {
      expect(win.navigator.clipboard.writeText).to.be.calledWith(testVoucherCode);
    });
  });

  it("should handle loading state correctly", () => {
    // Intercept the API call to delay it
    cy.intercept("GET", `**/api/Voucher/${testVoucherId}`, (req) => {
      req.on("response", (res) => {
        // Delay the response to show loading state
        res.setDelay(1000);
      });
    }).as("getVoucherDetails");
    
    // Visit the page
    cy.visit(`http://localhost:3000/customer/vouchers/detail/${testVoucherId}`);
    
    // Verify loading state is shown
    cy.contains("Loading Voucher Details").should("be.visible");
    cy.get(".animate-pulse").should("exist");
    
    // Wait for data to load
    cy.wait("@getVoucherDetails");
    
    // Verify content is shown after loading
    cy.contains(testVoucherName).should("be.visible");
  });

  it("should handle error state correctly", () => {
    // Intercept the API call to simulate an error
    cy.intercept("GET", "**/api/Voucher/*", {
      statusCode: 500,
      body: {
        flag: false,
        message: "Server error occurred"
      }
    }).as("getVoucherError");
    
    // Visit the page with a non-existent voucher ID
    cy.visit("http://localhost:3000/customer/vouchers/detail/05c1ca4b-dccc-4469-a6fc-08dd75f3bddd");
    
    // Verify error state is shown
    cy.contains("Unable to Load Voucher").should("be.visible");
    cy.contains("Server error occurred").should("be.visible");
  });

  it("should handle non-existent voucher correctly", () => {
   
    // Visit the page with a non-existent voucher ID
    cy.visit("http://localhost:3000/customer/vouchers/detail/05c1ca4b-dccc-4469-a6fc-08dd75f3bddd");
    cy.get(".swal2-confirm").click();
    // Verify no voucher found state is shown
    cy.contains("voucher requested not found");
  });

  it("should display correct chip based on voucher type", () => {
    // First check regular voucher
    cy.visit(`http://localhost:3000/customer/vouchers/detail/${testVoucherId}`);
    cy.contains("Regular Voucher").should("be.visible");
    
    // Now create a gift voucher as admin
    cy.login("user6@example.com", "123456");
    cy.visit("http://localhost:3000/vouchers");
    cy.contains("button", "NEW").click();
    
    const giftVoucherName = "Gift Voucher Test";
    const giftVoucherCode = "GIFTDETAIL123";
    
    cy.get('input[name="voucherName"]').type(giftVoucherName);
    cy.get('input[name="voucherCode"]').type(giftVoucherCode);
    cy.get('input[name="voucherQuantity"]').type("50");
    cy.get('input[name="voucherDiscount"]').type("30");
    cy.get('input[name="voucherMaximum"]').type("100");
    cy.get('input[name="voucherMinimumSpend"]').type("20");
    
    // Set dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);
    const formatDate = (date) => date.toISOString().split("T")[0];
    cy.get('input[name="voucherStartDate"]').type(formatDate(startDate));
    cy.get('input[name="voucherEndDate"]').type(formatDate(endDate));
    cy.get('input[name="voucherDescription"]').type("Test voucher for detail view testing");
    // Set isGift to Yes
    cy.get('[data-testid="isGift"]').parent().click();
    cy.contains("li", "Yes").click({ force: true });
    cy.get('body').click(0, 0); // Close dropdown
    
  
    // Submit the form
    cy.contains("button", "Submit").click({ force: true });
    
    // Handle success message
    cy.get(".swal2-title", { timeout: 10000 }).should("contain", "Success");
    cy.get(".swal2-confirm").click();
    
    // Get the gift voucher ID
    let giftVoucherId;
    cy.get(".MuiDataGrid-cell")
      .contains(giftVoucherCode)
      .closest(".MuiDataGrid-row")
      .invoke("attr", "data-id")
      .then((id) => {
        giftVoucherId = id;
        
        // Login as customer and check gift voucher
        cy.login("431straight@ptct.net", "123456");
        cy.visit(`http://localhost:3000/customer/vouchers/detail/${giftVoucherId}`);
        
        // Verify gift voucher chip is shown
        cy.contains("Gift Voucher").should("be.visible");
        
        // Clean up - delete the gift voucher
        cy.login("user6@example.com", "123456");
        cy.deleteVoucher(giftVoucherCode);
      });
  });

  it("should display expired status for expired vouchers", () => {
    // Create an expired voucher as admin
    cy.login("user6@example.com", "123456");
    cy.visit("http://localhost:3000/vouchers");
    cy.contains("button", "NEW").click();
    
    const expiredVoucherName = "Expired Voucher Test";
    const expiredVoucherCode = "EXPIREDTEST123";
    
    cy.get('input[name="voucherName"]').type(expiredVoucherName);
    cy.get('input[name="voucherCode"]').type(expiredVoucherCode);
    cy.get('input[name="voucherQuantity"]').type("50");
    cy.get('input[name="voucherDiscount"]').type("15");
    cy.get('input[name="voucherMaximum"]').type("100");
    cy.get('input[name="voucherMinimumSpend"]').type("20");
    cy.get('input[name="voucherDescription"]').type("Test voucher for detail view testing");
    // Set dates in the past
    const pastStartDate = new Date();
    pastStartDate.setDate(pastStartDate.getDate() - 30);
    const pastEndDate = new Date();
    pastEndDate.setDate(pastEndDate.getDate() - 1);
    const formatDate = (date) => date.toISOString().split("T")[0];
    
    cy.get('input[name="voucherStartDate"]').type(formatDate(pastStartDate));
    cy.get('input[name="voucherEndDate"]').type(formatDate(pastEndDate));
    
    // Set isGift to No
    cy.get('[data-testid="isGift"]').parent().click();
    cy.contains("li", "No").click({ force: true });
    cy.get('body').click(0, 0); // Close dropdown
    
    
    // Submit the form
    cy.contains("button", "Submit").click({ force: true });
    
    // Handle success message
    cy.get(".swal2-title", { timeout: 10000 }).should("contain", "Success");
    cy.get(".swal2-confirm").click();
    
    // Get the expired voucher ID
    let expiredVoucherId;
    cy.get(".MuiDataGrid-cell")
      .contains(expiredVoucherCode)
      .closest(".MuiDataGrid-row")
      .invoke("attr", "data-id")
      .then((id) => {
        expiredVoucherId = id;
        
        // Login as customer and check expired voucher
        cy.login("431straight@ptct.net", "123456");
        cy.visit(`http://localhost:3000/customer/vouchers/detail/${expiredVoucherId}`);
        
        // Verify expired status is shown
        cy.contains("Expired").should("be.visible");
        
        // Clean up - delete the expired voucher
        cy.login("user6@example.com", "123456");
        cy.deleteVoucher(expiredVoucherCode);
      });
  });
});
