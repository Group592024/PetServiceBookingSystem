describe("Admin Booking Detail E2E Tests", () => {
    let serviceBookingId;
    let roomBookingId;
  
    before(() => {
      // Login once before all tests with admin credentials
      cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
      
      // Find a service booking and room booking ID to use in tests
      cy.visit("http://localhost:3000/bookings");
      cy.wait(3000); // Wait for bookings to load
      
      // Get booking IDs for testing
      cy.get("body").then(($body) => {
        if ($body.find(".MuiDataGrid-row").length > 0) {
          // Find a service booking
          cy.get(".MuiDataGrid-cell").contains("Service").parents(".MuiDataGrid-row").find("[aria-label='info']")
            .first()
            .click();
          
          // Extract booking ID from URL
          cy.url().then((url) => {
            serviceBookingId = url.split('/').pop();
            cy.go('back');
          });
          
          // Find a hotel booking
          cy.get(".MuiDataGrid-cell").contains("Hotel").parents(".MuiDataGrid-row").find("[aria-label='info']")
            .first()
            .click();
          
          // Extract booking ID from URL
          cy.url().then((url) => {
            roomBookingId = url.split('/').pop();
            cy.go('back');
          });
        }
      });
    });
  
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
    });
  
    afterEach(() => {
      cy.saveLocalStorage();
    });
  
    describe("Service Booking Detail Tests", () => {
      beforeEach(() => {
        // Skip tests if no service booking ID was found
        if (!serviceBookingId) {
          cy.log("No service booking found to test");
          return;
        }
        
        cy.visit(`http://localhost:3000/bookings/detail/ServiceBookingDetailPage/${serviceBookingId}`);
        cy.wait(2000); // Wait for details to load
      });
  
      it("should display the admin layout components", () => {
        if (!serviceBookingId) {
          cy.log("Test skipped - no service booking found");
          return;
        }
        
        // Verify sidebar exists
        cy.get(".sidebar").should("exist");
        
        // Verify content container
        cy.get(".content").should("exist");
      });
  
      it("should display the service booking header and status correctly", () => {
        if (!serviceBookingId) {
          cy.log("Test skipped - no service booking found");
          return;
        }
        
        // Verify page title
        cy.contains("h2", "Service Booking Details").should("be.visible");
        
      });
  
      it("should display the status control panel for non-completed bookings", () => {
        if (!serviceBookingId) {
          cy.log("Test skipped - no service booking found");
          return;
        }
        
        cy.get("body").then(($body) => {
          const isCompletedOrCancelled = $body.text().includes("Completed") || $body.text().includes("Cancelled");
          
          if (!isCompletedOrCancelled) {
            // Status control panel should exist
            cy.get(".inline-flex.items-center.space-x-6.bg-white.p-6.rounded-xl.shadow-lg").should("exist");
            cy.contains("span", "Current Status:").should("be.visible");
            cy.contains("button", "Move to Next Status").should("be.visible");
          } else {
            cy.log("Booking is already Completed or Cancelled - no status control panel expected");
          }
        });
      });
  
      it("should display the service booking details correctly", () => {
        if (!serviceBookingId) {
          cy.log("Test skipped - no service booking found");
          return;
        }
        
        // Verify booking details section
        cy.get(".space-y-4.p-8.bg-white.shadow-xl.rounded-xl").should("exist");
        
        // Check for key booking information
        cy.contains("span", "Booking Code:").should("be.visible");
        cy.contains("span", "Account Name:").should("be.visible");
        cy.contains("span", "Payment Type:").should("be.visible");
        cy.contains("span", "Total Amount:").should("be.visible");
        cy.contains("span", "Status:").should("be.visible");
        cy.contains("span", "Booking Date:").should("be.visible");
        cy.contains("span", "Notes:").should("be.visible");
        cy.contains("span", "Payment Status:").should("be.visible");
        
        // Verify service items section exists
        cy.contains("h3", "Service Items").should("be.visible");
      });
  
      it("should display service items if available", () => {
        if (!serviceBookingId) {
          cy.log("Test skipped - no service booking found");
          return;
        }
        
        cy.get("body").then(($body) => {
            cy.scrollTo("bottom");

            cy.wait(2000);
          if ($body.find(".p-6.bg-white.rounded-xl.shadow-lg").length > 0) {
            // Service items exist
            cy.get(".p-6.bg-white.rounded-xl.shadow-lg").should("have.length.at.least", 1);
            
            // Check service item details
            cy.get(".p-6.bg-white.rounded-xl.shadow-lg").each(() => {
              cy.contains("Service Item #").should("be.visible");
              cy.contains("span", "Service:").should("exist");
              cy.contains("span", "Content:").should("exist");
              cy.contains("span", "Base Price:").should("exist");
              cy.contains("span", "Pet:").should("exist");
              cy.contains("span", "Final Price:").should("exist");
            });
          } else if ($body.find("p.text-center.text-gray-600.text-lg").length > 0) {
            // No service items message
            cy.contains("No service items found for this booking.").should("be.visible");
          }
        });
      });
  
      it("should display voucher details if a voucher was applied", () => {
        if (!serviceBookingId) {
          cy.log("Test skipped - no service booking found");
          return;
        }
        
        cy.get("body").then(($body) => {
          if ($body.find(".mt-4.p-4.bg-blue-50.rounded-lg").length > 0) {
            // Voucher details exist
            cy.contains("h4", "Applied Voucher").should("be.visible");
            cy.contains("span", "Voucher Name:").should("exist");
            cy.contains("span", "Code:").should("exist");
            cy.contains("span", "Discount:").should("exist");
          } else {
            cy.log("No voucher was applied to this booking");
          }
        });
      });
  
      it("should display action buttons for pending or confirmed bookings", () => {
        if (!serviceBookingId) {
          cy.log("Test skipped - no service booking found");
          return;
        }
        
        cy.get("body").then(($body) => {
          const hasPendingStatus = $body.text().includes("Pending") || $body.text().includes("Confirmed");
          
          if (hasPendingStatus) {
            // Check for Cancel button
            cy.contains("button", "Cancel Booking").should("be.visible");
          } else {
            cy.log("Booking is not in Pending or Confirmed status");
          }
        });
      });
    });
  
    describe("Room Booking Detail Tests", () => {
      beforeEach(() => {
        // Skip tests if no room booking ID was found
        if (!roomBookingId) {
          cy.log("No room booking found to test");
          return;
        }
        
        cy.visit(`http://localhost:3000/bookings/detail/RoomBookingDetailPage/${roomBookingId}`);
        cy.wait(2000); // Wait for details to load
      });
  
      it("should display the admin layout components", () => {
        if (!roomBookingId) {
          cy.log("Test skipped - no room booking found");
          return;
        }
        
        // Verify sidebar exists
        cy.get(".sidebar").should("exist");
        
        // Verify content container
        cy.get(".content").should("exist");
      });
  
      it("should display the room booking header and status correctly", () => {
        if (!roomBookingId) {
          cy.log("Test skipped - no room booking found");
          return;
        }
        // Verify page title
        cy.contains("h2", "Room Booking Details").should("be.visible");
        
      });
  
      it("should display the status control panel for non-completed bookings", () => {
        if (!roomBookingId) {
          cy.log("Test skipped - no room booking found");
          return;
        }
        
        cy.get("body").then(($body) => {
          const isCompletedOrCancelled = $body.text().includes("Checked out") || $body.text().includes("Cancelled");
          
          if (!isCompletedOrCancelled) {
            // Status control panel should exist
            cy.get(".inline-flex.items-center.space-x-6.bg-white.p-6.rounded-xl.shadow-lg").should("exist");
            cy.contains("span", "Current Status:").should("be.visible");
            cy.contains("button", "Move to Next Status").should("be.visible");
          } else {
            cy.log("Booking is already Checked out or Cancelled - no status control panel expected");
          }
        });
      });
  
      it("should display the room booking details correctly", () => {
        if (!roomBookingId) {
          cy.log("Test skipped - no room booking found");
          return;
        }
        
        // Verify booking details section
        cy.get(".space-y-4.p-8.bg-white.shadow-xl.rounded-xl").should("exist");
        
        // Check for key booking information
        cy.contains("span", "Booking Code:").should("be.visible");
        cy.contains("span", "Account Name:").should("be.visible");
        cy.contains("span", "Payment Type:").should("be.visible");
        cy.contains("span", "Total Amount:").should("be.visible");
        cy.contains("span", "Status:").should("be.visible");
        cy.contains("span", "Booking Date:").should("be.visible");
        cy.contains("span", "Notes:").should("be.visible");
        cy.contains("span", "Payment Status:").should("be.visible");
        
        // Verify room bookings section exists
        cy.contains("h3", "Room Bookings").should("be.visible");
      });
  
      it("should display room history if available", () => {
        if (!roomBookingId) {
          cy.log("Test skipped - no room booking found");
          return;
        }
        
        cy.get("body").then(($body) => {
          if ($body.find(".p-6.bg-white.rounded-xl.shadow-lg").length > 0) {
            // Room history exists
            cy.get(".p-6.bg-white.rounded-xl.shadow-lg").should("have.length.at.least", 1);
            
            // Check room history details
            cy.get(".p-6.bg-white.rounded-xl.shadow-lg").first().within(() => {
              cy.contains("Room Booking #").should("be.visible");
              cy.contains("span", "Room Name:").should("exist");
              cy.contains("span", "Pet:").should("exist");
              cy.contains("span", "Booking Period:").should("exist");
              cy.contains("span", "Check-in:").should("exist");
              cy.contains("span", "Check-out:").should("exist");
              cy.contains("span", "Camera:").should("exist");
            });
          } else if ($body.find("p.text-center.text-gray-600.text-lg").length > 0) {
            // No room history message
            cy.contains("No room history found for this booking.").should("be.visible");
          }
        });
      });
  
      it("should display camera settings button for rooms with camera", () => {
        if (!roomBookingId) {
          cy.log("Test skipped - no room booking found");
          return;
        }
        
        cy.get("body").then(($body) => {
          const hasCamera = $body.text().includes("Included");
          
          if (hasCamera) {
            // Look for camera settings button
            cy.get("button[title='Camera Settings']").should("exist");
            
            // Test camera assignment modal (optional)
            cy.get("button[title='Camera Settings']").first().click();
            cy.wait(1000);
            cy.get('#cameraId').click();
            cy.get('.MuiStack-root > .MuiTypography-root').click({force: true});
            cy.get('.MuiButton-contained').contains('Assign Camera').click({force: true});
            cy.wait(1000);
          } else {
            cy.log("No rooms with camera found");
          }
        });
      });
  

it("should show confirmation dialog when attempting to move to next status", () => {
  if (!roomBookingId) {
    cy.log("Test skipped - no room booking found");
    return;
  }
  
  cy.get("body").then(($body) => {
    const isCompletedOrCancelled = $body.text().includes("Checked out") || $body.text().includes("Cancelled");
    
    if (!isCompletedOrCancelled) {
      // Click the "Move to Next Status" button
      cy.contains("button", "Move to Next Status").click();
      
      // Verify confirmation dialog appears
      cy.get(".swal2-popup").should("be.visible");
      cy.contains("Are you sure?").should("be.visible");
      
      // Click "No" to avoid actually changing status
      cy.get(".swal2-cancel").click();
    } else {
      cy.log("Booking is already Checked out or Cancelled - no status change possible");
    }
  });
});
});

// Test cancel booking functionality (optional - commented out to avoid actually cancelling bookings)
it("should show confirmation dialog when cancelling a booking", () => {
  // Visit a booking detail page
  cy.visit(`http://localhost:3000/bookings/detail/ServiceBookingDetailPage/${serviceBookingId}`);
  cy.wait(2000);
  
  if (!serviceBookingId) {
    cy.log("Test skipped - no service booking found");
    return;
  }

  cy.get("body").then(($body) => {
    const hasPendingStatus = $body.text().includes("Pending") || $body.text().includes("Confirmed");
    
    if (hasPendingStatus) {
      // Check for Cancel button
      cy.contains("button", "Cancel Booking").should("be.visible");
      cy.contains("button", "Cancel Booking").click();

      // Verify confirmation dialog appears
      cy.get(".swal2-popup").should("be.visible");
      cy.contains("Are you sure?").should("be.visible");
      
      // Click "No" to avoid actually cancelling
      cy.get(".swal2-cancel").click();
    } else {
      cy.log("Booking is not in Pending or Confirmed status");
    }
  });
});
});
