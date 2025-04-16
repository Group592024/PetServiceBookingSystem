describe("Customer Booking List E2E Tests", () => {
  before(() => {
    // Login once before all tests
    cy.loginByHien("linhdo@gmail.com", "linhlinh99");
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.loginByHien("linhdo@gmail.com", "linhlinh99");
    cy.visit("http://localhost:3000/customer/bookings");
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it("should display the page header correctly", () => {
    // Verify header exists
    cy.get(".flex.flex-col.sm\\:flex-row.justify-between.items-center.mb-8").should("exist");
    
    // Verify page title
    cy.contains("h1", "Your Booking History").should("be.visible");
    cy.contains("p", "Manage and view all your service appointments").should("be.visible");
    
    // Verify New Booking button exists
    cy.get("button").contains("New Booking").should("be.visible");
  });

  it("should navigate to new booking page when clicking New Booking button", () => {
    // Click the New Booking button
    cy.get("button").contains("New Booking").click();
    
    // Verify navigation to new booking page
    cy.url().should("include", "/customer/bookings/new");
    
    // Navigate back to the booking list
    cy.go("back");
    cy.url().should("include", "/customer/bookings");
  });

  it("should display the data grid or empty message", () => {
    // Wait for data to load
    cy.wait(2000);
    
    // Check if bookings exist or loading is shown
    cy.get("body").then(($body) => {
      if ($body.find(".MuiDataGrid-root").length > 0) {
        // Bookings exist - verify data grid components
        cy.get(".MuiDataGrid-columnHeaders").should("be.visible");
        cy.get(".MuiDataGrid-columnHeader").should("have.length.at.least", 8);
        
        // Verify column headers
        cy.contains(".MuiDataGrid-columnHeaderTitle", "No.").should("exist");
        cy.contains(".MuiDataGrid-columnHeaderTitle", "Customer Name").should("exist");
        cy.contains(".MuiDataGrid-columnHeaderTitle", "Total Amount").should("exist");
        cy.contains(".MuiDataGrid-columnHeaderTitle", "Booking Type").should("exist");
        cy.contains(".MuiDataGrid-columnHeaderTitle", "Booking Date").should("exist");
        cy.contains(".MuiDataGrid-columnHeaderTitle", "Created At").should("exist");
        cy.contains(".MuiDataGrid-columnHeaderTitle", "Status").should("exist");
        cy.contains(".MuiDataGrid-columnHeaderTitle", "Paid").should("exist");
        cy.contains(".MuiDataGrid-columnHeaderTitle", "Action").should("exist");
        
        // Check if at least one row exists
        cy.get(".MuiDataGrid-row").should("have.length.at.least", 1);
      } else if ($body.find(".w-12.h-12.text-blue-500.animate-spin").length > 0) {
        // Loading state is shown
        cy.get(".w-12.h-12.text-blue-500.animate-spin").should("be.visible");
        cy.contains("Loading your bookings, please wait...").should("be.visible");
      } else if ($body.find(".text-center.py-12").length > 0) {
        // No bookings message is shown
        cy.contains("No Bookings Yet").should("be.visible");
        cy.contains("Schedule your first service appointment for your pet").should("be.visible");
      }
    });
  });

  it("should navigate to booking detail when clicking info button", () => {
    // Wait for data to load
    cy.wait(2000);
    
    cy.get("body").then(($body) => {
      if ($body.find(".MuiDataGrid-row").length > 0) {
        // Find the first info button and click it
        cy.get("[aria-label='info']").first().click();
        
        // Verify navigation to detail page
        cy.url().should("include", "/customer/bookings/detail/");
        
        // Navigate back to the booking list
        cy.go("back");
        cy.url().should("include", "/customer/bookings");
      } else {
        cy.log("No bookings available to test navigation");
      }
    });
  });

  it("should display correct status pills for different booking statuses", () => {
    // Wait for data to load
    cy.wait(2000);
    
    cy.get("body").then(($body) => {
      if ($body.find(".MuiDataGrid-row").length > 0) {
        // Check if status pills exist
        cy.get(".status-pill").should("exist");
        
        // Verify different status pills have appropriate classes
        cy.get(".status-pill").each(($el) => {
          const statusText = $el.text().trim().toLowerCase().replace(/\s+/g, '-');
          cy.wrap($el).should("have.class", statusText);
        });
      } else {
        cy.log("No bookings available to test status pills");
      }
    });
  });

  it("should display correct paid status indicators", () => {
    // Wait for data to load
    cy.wait(2000);
    
    cy.get("body").then(($body) => {
      if ($body.find(".MuiDataGrid-row").length > 0) {
        // Check if paid status indicators exist
        cy.get(".paid-status").should("exist");
        
        // Verify paid status indicators have appropriate classes
        cy.get(".paid-status").each(($el) => {
          const isPaid = $el.text().trim() === "Paid";
          if (isPaid) {
            cy.wrap($el).should("have.class", "paid");
          } else {
            cy.wrap($el).should("have.class", "unpaid");
          }
        });
      } else {
        cy.log("No bookings available to test paid status");
      }
    });
  });

  it("should handle pagination correctly if multiple bookings exist", () => {
    // Wait for data to load
    cy.wait(2000);
    
    cy.get("body").then(($body) => {
      if ($body.find(".MuiDataGrid-footerContainer").length > 0) {
        // Check if pagination controls exist
        cy.get(".MuiTablePagination-root").should("exist");
        
        // Get the total number of rows
        cy.get(".MuiTablePagination-displayedRows").invoke("text").then((text) => {
          const match = text.match(/of (\d+)/);
          if (match && parseInt(match[1]) > 10) {
            // If more than 10 rows, test pagination
            cy.get(".MuiTablePagination-actions button[aria-label='Go to next page']").click();
            cy.wait(500);
            cy.get(".MuiTablePagination-actions button[aria-label='Go to previous page']").click();
          } else {
            cy.log("Not enough bookings to test pagination");
          }
        });
      } else {
        cy.log("No pagination available to test");
      }
    });
  });
});
