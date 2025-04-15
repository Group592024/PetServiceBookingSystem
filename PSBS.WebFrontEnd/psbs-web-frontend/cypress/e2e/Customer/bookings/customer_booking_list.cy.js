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
  
    it("should display the page title and new booking button", () => {
      // Verify page title
      cy.contains("h1", "Your Booking History").should("be.visible");
  
      // Verify new booking button exists
      cy.get("button").contains("New Booking").should("exist");
  
      // Test new booking button navigation
      cy.get("button").contains("New Booking").click();
      cy.url().should("include", "/customer/bookings/new");
  
      // Navigate back to the booking list
      cy.go("back");
      cy.url().should("include", "/customer/bookings");
    });
  
    it("should display the booking datatable or empty state", () => {
      // Check if bookings exist
      cy.get("body").then(($body) => {
        if ($body.find(".MuiDataGrid-row").length > 0) {
          // Bookings exist
          cy.get(".MuiDataGrid-row").should("have.length.at.least", 1);
  
          // Check booking row elements
          cy.get(".MuiDataGrid-row").first().within(() => {
            // Check columns like Customer Name, Total Amount, etc.
            cy.get('[data-field="customerName"]').should("exist");
            cy.get('[data-field="formattedAmount"]').should("exist");
            cy.get('[data-field="bookingTypeName"]').should("exist");
            cy.get('[data-field="formattedDate"]').should("exist");
            cy.get('[data-field="formattedCreateAt"]').should("exist");
            cy.get('[data-field="bookingStatusName"]').should("exist");
          });
        } else {
          cy.contains("No Bookings Yet").should("be.visible");
        }
      });
    });
  
    it("should navigate to booking detail when clicking the info button", () => {
      cy.get("body").then(($body) => {
        if ($body.find(".MuiDataGrid-row").length > 0) {
          // Get the first booking row and click the info button
          cy.get(".MuiDataGrid-row").first().within(() => {
            cy.get('button[aria-label="info"]').click();
          });
  
          // Verify navigation to detail page
          cy.url().should("include", "/customer/bookings/detail/");
  
          // Verify detail page elements (basic check)
          cy.get("body").should("exist");
  
          // Navigate back to the booking list
          cy.go("back");
          cy.url().should("include", "/customer/bookings");
        } else {
          cy.log("No bookings available to test navigation");
        }
      });
    });
  
    it("should sort bookings by Created At in descending order", () => {
      cy.get("body").then(($body) => {
        if ($body.find(".MuiDataGrid-row").length > 1) {
          // Verify the rows are sorted by rawCreateAt in descending order
          const dates = [];
          cy.get(".MuiDataGrid-row").each(($row) => {
            cy.wrap($row)
              .find('[data-field="formattedCreateAt"]')
              .invoke("text")
              .then((text) => {
                dates.push(new Date(text));
              });
          }).then(() => {
            const sortedDates = [...dates].sort((a, b) => b - a);
            expect(dates).to.deep.equal(sortedDates);
          });
        } else {
          cy.log("Not enough bookings to test sorting");
        }
      });
    });
  
    it("should show 'No bookings found' when there are no bookings", () => {
      // Simulate no bookings by intercepting the API response
      cy.intercept("GET", "**/Bookings/list/**", {
        statusCode: 200,
        body: { flag: false, message: "No bookings found", data: [] },
      }).as("getBookings");
  
      // Reload the page
      cy.reload();
  
      // Wait for the API call
      cy.wait("@getBookings");
  
      // Verify the empty state message
      cy.contains('button', 'OK').should('be.visible');
      cy.contains("No Bookings Yet").should("be.visible");
    });
  });