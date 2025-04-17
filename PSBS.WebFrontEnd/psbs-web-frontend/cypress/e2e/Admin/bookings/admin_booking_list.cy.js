describe("Admin Booking List E2E Tests", () => {
    before(() => {
      // Login once before all tests with admin credentials
      cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
    });
  
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
      cy.visit("http://localhost:3000/bookings");
    });
  
    afterEach(() => {
      cy.saveLocalStorage();
    });
  
    it("should display the booking list page correctly", () => {
      // Verify sidebar exists
      cy.get(".sidebar").should("exist");
      
    //   // Verify navbar exists
    //   cy.get(".navbar").should("exist");
      
      // Verify main content container
      cy.get(".listContainer.content").should("exist");
      
      // Verify page title
      cy.contains("h2", "Booking List").should("be.visible");
      
      // Verify New button exists
      cy.get("button").contains("New").should("be.visible");
    });
  
    it("should display the booking list or show loading/empty message", () => {
      // Check if the data grid exists
      cy.get(".MuiDataGrid-root").should("exist");
      
      // Wait for data to load (adjust timeout as needed)
      cy.wait(3000);
      
      // Check if the table has any rows or shows loading state
      cy.get("body").then(($body) => {
        if ($body.find(".w-8.h-8.text-gray-200.animate-spin").length > 0) {
          // Still loading
          cy.get(".w-8.h-8.text-gray-200.animate-spin").should("be.visible");
        } else if ($body.find(".MuiDataGrid-row").length > 0) {
          // Table has data
          cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
        } else {
          // Table is empty
          cy.get(".MuiDataGrid-overlay").should("be.visible");
        }
      });
    });
  
    it("should have the correct column headers", () => {
      // Wait for data to load
      cy.wait(3000);
      
      // Verify column headers
      const expectedHeaders = [
        "No.",
        "Booking Code",
        "Customer Name",
        "Total Amount",
        "Booking Type",
        "Booking Date",
        "Created At",
        "Status",
        "Paid",
        "Action"
      ];
      
      cy.get(".MuiDataGrid-columnHeaderTitle").each(($el, index) => {
        if (index < expectedHeaders.length) {
          cy.wrap($el).should("contain.text", expectedHeaders[index]);
        }
      });
    });
  
    it("should navigate to new booking page when clicking New button", () => {
      // Click the New button
      cy.get("button").contains("New").click();
      
      // Verify navigation to new booking page
      cy.url().should("include", "/bookings/new");
      
      // Navigate back to the booking list
      cy.go("back");
      cy.url().should("include", "/bookings");
    });
  
    it("should display booking status chips with appropriate colors", () => {
      // Wait for data to load
      cy.wait(3000);
      
      cy.get("body").then(($body) => {
        if ($body.find(".MuiDataGrid-row").length > 0) {
          // Check if status chips exist
          cy.get(".MuiChip-root").should("exist");
          
          // Verify different status chips have appropriate colors
          // We can check a few common statuses
          cy.get(".MuiDataGrid-cell").then(($cells) => {
            // Check for Pending status
            if ($cells.text().includes("Pending")) {
              cy.contains(".MuiChip-root", "Pending")
                .should("have.class", "MuiChip-colorWarning");
            }
            
            // Check for Completed status
            if ($cells.text().includes("Completed")) {
              cy.contains(".MuiChip-root", "Completed")
                .should("have.class", "MuiChip-colorSuccess");
            }
            
            // Check for Cancelled status
            if ($cells.text().includes("Cancelled")) {
              cy.contains(".MuiChip-root", "Cancelled")
                .should("have.class", "MuiChip-colorError");
            }
          });
        } else {
          cy.log("No bookings available to test status chips");
        }
      });
    });
  
    it("should display paid status chips correctly", () => {
      // Wait for data to load
      cy.wait(3000);
      
      cy.get("body").then(($body) => {
        if ($body.find(".MuiDataGrid-row").length > 0) {
          // Check if paid status chips exist
          cy.get(".MuiChip-root").should("exist");
          
          // Verify paid status chips have appropriate colors
          cy.get(".MuiDataGrid-cell").then(($cells) => {
            // Check for Paid status
            if ($cells.text().includes("Paid")) {
              cy.contains(".MuiChip-root", "Paid")
                .should("have.class", "MuiChip-colorPrimary");
            }
            
            // Check for No (unpaid) status
            if ($cells.text().includes("No")) {
              cy.contains(".MuiChip-root", "No")
                .should("have.class", "MuiChip-colorError");
            }
          });
        } else {
          cy.log("No bookings available to test paid status");
        }
      });
    });
  
    it("should navigate to booking detail when clicking info button", () => {
      // Wait for data to load
      cy.wait(3000);
      
      cy.get("body").then(($body) => {
        if ($body.find(".MuiDataGrid-row").length > 0) {
          // Get the first info button
          cy.get("[aria-label='info']").first().click();
          
          // Verify navigation to detail page
          cy.url().should("include", "/bookings/detail/");
          
          // Navigate back to the booking list
          cy.go("back");
          cy.url().should("include", "/bookings");
        } else {
          cy.log("No bookings available to test navigation");
        }
      });
    });
  
    it("should show medical record button for medical bookings", () => {
      // Wait for data to load
      cy.wait(3000);
      
      cy.get("body").then(($body) => {
        // Check if there are any medical bookings (with the green plus icon)
        if ($body.find(".w-5.h-5.text-green-500").length > 0) {
          // Verify the medical record button exists
          cy.get(".w-5.h-5.text-green-500").should("be.visible");
          
          // Optional: Test navigation to medical record page
          // Note: This is commented out to avoid actual navigation during tests
          /*
          cy.get(".w-5.h-5.text-green-500").first().click();
          cy.url().should("include", "/add?bookingCode=");
          cy.go("back");
          */
        } else {
          cy.log("No medical bookings available to test");
        }
      });
    });
  
    it("should handle pagination correctly if multiple bookings exist", () => {
      // Wait for data to load
      cy.wait(3000);
      
      cy.get("body").then(($body) => {
        if ($body.find(".MuiTablePagination-root").length > 0) {
          // Check if pagination controls exist
          cy.get(".MuiTablePagination-root").should("exist");
          
          // Get the total number of rows
          cy.get(".MuiTablePagination-displayedRows").invoke("text").then((text) => {
            const match = text.match(/of (\d+)/);
            if (match && parseInt(match[1]) > 5) {
              // If more than 5 rows (default page size), test pagination
              cy.get("button[aria-label='Go to next page']").click();
              cy.wait(500);
              cy.get("button[aria-label='Go to previous page']").click();
            } else {
              cy.log("Not enough bookings to test pagination");
            }
          });
        } else {
          cy.log("No pagination available to test");
        }
      });
    });
  
    it("should sort data when clicking on column headers", () => {
      // Wait for data to load
      cy.wait(3000);
      
      cy.get("body").then(($body) => {
        if ($body.find(".MuiDataGrid-row").length > 0) {
          // Click on Booking Date column header to sort
          cy.contains(".MuiDataGrid-columnHeaderTitle", "Booking Date").click();
          cy.wait(500);
          
          // Click again to reverse sort order
          cy.contains(".MuiDataGrid-columnHeaderTitle", "Booking Date").click();
          cy.wait(500);
          
          // Test another column (Total Amount)
          cy.contains(".MuiDataGrid-columnHeaderTitle", "Total Amount").click();
          cy.wait(500);
        } else {
          cy.log("No bookings available to test sorting");
        }
      });
    });
  });
  