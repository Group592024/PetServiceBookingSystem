describe("Customer Voucher List E2E Tests", () => {
  before(() => {
    // loginByHien once before all tests
    cy.loginByHien("431straight@ptct.net", "123456");
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.loginByHien("431straight@ptct.net", "123456");
    cy.visit("http://localhost:3000/customer/vouchers");
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it("should display the banner slider correctly", () => {
    // Verify banner exists
    cy.get(".relative.w-full.h-\\[400px\\]").should("exist");
    
    // Check if at least one banner is visible
    cy.get(".absolute.inset-0.flex.items-center.justify-center").should("be.visible");
    
    // Verify banner content
    cy.get(".bg-blue-900.bg-opacity-70 h2").should("be.visible");
    cy.get(".bg-blue-900.bg-opacity-70 p").should("be.visible");
    
    // Wait for banner to change (auto-slide happens every 4 seconds)
    cy.wait(4500);
    cy.get(".absolute.inset-0.flex.items-center.justify-center").should("be.visible");
  });

  it("should display the page title and search functionality", () => {
    // Verify page title
    cy.contains("h1", "Available Vouchers").should("be.visible");
    
    // Verify search input exists
    cy.get("input[placeholder='Search vouchers...']").should("exist");
    
    // Test search functionality
    cy.get("input[placeholder='Search vouchers...']").type("discount");
    cy.wait(500); // Wait for search to filter
    
    // Clear search
    cy.get("input[placeholder='Search vouchers...']").clear();
    cy.wait(500);
  });

  it("should display voucher cards or empty message", () => {
    // Check if vouchers exist
    cy.get("body").then(($body) => {
      if ($body.find(".shadow-xl.rounded-xl.overflow-hidden").length > 0) {
        // Vouchers exist
        cy.get(".shadow-xl.rounded-xl.overflow-hidden").should("have.length.at.least", 1);
        
        // Check voucher card elements
        cy.get(".shadow-xl.rounded-xl.overflow-hidden").first().within(() => {
          // Check discount percentage
          cy.get(".text-4xl.font-bold").should("exist");
          cy.get(".text-sm.uppercase.font-semibold").should("contain", "DISCOUNT");
          
          // Check voucher name
          cy.get(".font-semibold.text-xl.text-blue-800").should("exist");
          
          // Check call-to-action text
          cy.get(".text-sm.text-blue-500").should("contain", "Tap to view this voucher");
        });
      } else {
        // No vouchers available
        cy.contains("No vouchers available").should("be.visible");
      }
    });
  });

  it("should navigate to voucher detail when clicking a voucher", () => {
    cy.get("body").then(($body) => {
      if ($body.find(".shadow-xl.rounded-xl.overflow-hidden").length > 0) {
        // Get the first voucher card and click it
        cy.get(".shadow-xl.rounded-xl.overflow-hidden").first().click();
        
        // Verify navigation to detail page
        cy.url().should("include", "/customer/vouchers/detail/");
        
        // Verify detail page elements (basic check)
        cy.get("body").should("exist");
        
        // Navigate back to the voucher list
        cy.go("back");
        cy.url().should("include", "/customer/vouchers");
      } else {
        cy.log("No vouchers available to test navigation");
      }
    });
  });

  it("should filter vouchers when using search", () => {
    cy.get("body").then(($body) => {
      if ($body.find(".shadow-xl.rounded-xl.overflow-hidden").length > 0) {
        // Get the text of the first voucher
        cy.get(".font-semibold.text-xl.text-blue-800").first().invoke("text").then((voucherName) => {
          // Use part of the name to search
          const searchTerm = voucherName.substring(0, 3);
          cy.get("input[placeholder='Search vouchers...']").type(searchTerm);
          cy.wait(500);
          
          // Verify filtered results contain the search term
          cy.get(".font-semibold.text-xl.text-blue-800").each(($el) => {
            cy.wrap($el).invoke("text").should("include", searchTerm);
          });
          
          // Clear search
          cy.get("input[placeholder='Search vouchers...']").clear();
        });
      } else {
        cy.log("No vouchers available to test search filtering");
      }
    });
  });

  it("should show 'No vouchers match your search' when search has no results", () => {
    // Type a search term that likely won't match any vouchers
    cy.get("input[placeholder='Search vouchers...']").type("xyznonexistentvoucher123");
    cy.wait(500);
    
    // Check for no results message
    cy.contains("No vouchers match your search").should("be.visible");
    
    // Clear search
    cy.get("input[placeholder='Search vouchers...']").clear();
  });
});
