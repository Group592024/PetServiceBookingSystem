describe("Customer Booking Detail E2E Tests", () => {
    let serviceBookingId;
    let roomBookingId;
  
    before(() => {
      // Login once before all tests
      cy.loginByHien("linhdo@gmail.com", "linhlinh99");
      
      // Find a service booking and room booking ID to use in tests
      cy.visit("http://localhost:3000/customer/bookings");
      cy.wait(3000); // Wait for bookings to load
      
      // Get booking IDs for testing
      cy.get("body").then(($body) => {
        if ($body.find(".MuiDataGrid-row").length > 0) {
          // Find a service booking
          cy.get(".MuiDataGrid-cell").contains("Service").parents(".MuiDataGrid-row").find("[aria-label='info']")
            .invoke('attr', 'href')
            .then((href) => {
              if (href) {
                serviceBookingId = href.split('/').pop();
              } else {
                // If href not available, try to extract from onclick
                cy.get(".MuiDataGrid-cell").contains("Service").parents(".MuiDataGrid-row")
                  .invoke('attr', 'data-id')
                  .then((id) => {
                    serviceBookingId = id;
                  });
              }
            });
          
          // Find a hotel booking
          cy.get(".MuiDataGrid-cell").contains("Hotel").parents(".MuiDataGrid-row").find("[aria-label='info']")
            .invoke('attr', 'href')
            .then((href) => {
              if (href) {
                roomBookingId = href.split('/').pop();
              } else {
                // If href not available, try to extract from onclick
                cy.get(".MuiDataGrid-cell").contains("Hotel").parents(".MuiDataGrid-row")
                  .invoke('attr', 'data-id')
                  .then((id) => {
                    roomBookingId = id;
                  });
              }
            });
        }
      });
    });
  
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("linhdo@gmail.com", "linhlinh99");
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
        
        cy.visit(`http://localhost:3000/customer/bookings/detail/ServiceBookingDetailPage/${serviceBookingId}`);
        cy.wait(2000); // Wait for details to load
      });
  
      it("should display the service booking header and status correctly", () => {
        if (!serviceBookingId) {
          cy.log("Test skipped - no service booking found");
          return;
        }
        
        // Verify page title
        cy.contains("h2", "Service Booking Details").should("be.visible");
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
          if ($body.find(".p-6.bg-white.rounded-xl.shadow-lg").length > 0) {
            // Service items exist
            cy.get(".p-6.bg-white.rounded-xl.shadow-lg").should("have.length.at.least", 1);
            
            // Check service item details
            cy.get(".p-6.bg-white.rounded-xl.shadow-lg").first().within(() => {
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
          cy.scrollTo('bottom');
          
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
        
        cy.visit(`http://localhost:3000/customer/bookings/detail/RoomBookingDetailPage/${roomBookingId}`);
        cy.wait(2000); // Wait for details to load
      });
  
      it("should display the room booking header and status correctly", () => {
        if (!roomBookingId) {
          cy.log("Test skipped - no room booking found");
          return;
        }
        
        // Verify page title
        cy.contains("h2", "Room Booking Details").should("be.visible");
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
  
      it("should display camera button for checked-in rooms with camera", () => {
        if (!roomBookingId) {
          cy.log("Test skipped - no room booking found");
          return;
        }
        
        cy.get("body").then(($body) => {
          const hasCheckedInRoom = $body.text().includes("Checked in");
          const hasCamera = $body.text().includes("Included");
          
          if (hasCheckedInRoom && hasCamera) {
            // Look for camera settings button
            cy.get("button[title='Camera Settings']").should("exist");
            
            // Test camera modal (optional)
            cy.get("button[title='Camera Settings']").first().click();
            cy.wait(1000);
            // Verify modal appears
            cy.get(".MuiDialog-root").should("exist");
            // Close modal
            cy.get(".MuiDialog-root button").contains("Close").click();
          } else {
            cy.log("No checked-in rooms with camera found");
          }
        });
      });
  
      it("should display action buttons for pending or confirmed bookings", () => {
        if (!roomBookingId) {
          cy.log("Test skipped - no room booking found");
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
  
    // Test cancel booking functionality (optional - commented out to avoid actually cancelling bookings)
    // /*
    it("should show confirmation dialog when cancelling a booking", () => {
        cy.visit("http://localhost:3000/customer/bookings");
      // Visit a booking detail page
      cy.visit(`http://localhost:3000/customer/bookings/detail/ServiceBookingDetailPage/${serviceBookingId}`);
      cy.wait(2000);
      if (!serviceBookingId) {
        cy.log("Test skipped - no service booking found");
        return;
      }

      cy.get("body").then(($body) => {
        const hasPendingStatus = $body.text().includes("Pending") || $body.text().includes("Confirmed");
        cy.scrollTo('bottom');

            if (hasPendingStatus) {
                cy.scrollTo('bottom');
                // Check for Cancel button
                cy.contains("button", "Cancel Booking").should("be.visible");
                cy.contains("button", "Cancel Booking").click();

                // Verify confirmation dialog appears
                cy.get(".swal2-popup").should("be.visible");
                cy.contains("Are you sure?").should("be.visible");
                
                // Click "No" to avoid actually cancelling
                cy.get(".swal2-cancel").click();
              }
        
      });
    });
    // */
  });
  