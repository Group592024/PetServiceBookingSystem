describe("Navbar Notification Dropdown E2E Tests", () => {
    before(() => {
      // Login once before all tests
      cy.loginByHien("user6@example.com", "123456");
    });
  
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("user6@example.com", "123456");
      cy.visit("http://localhost:3000/dashboard");
    });
  
    afterEach(() => {
      cy.saveLocalStorage();
    });
  
    it("should display the navbar with notification bell", () => {
      // Check if navbar is visible
      cy.get(".nav").should("exist");
      
      // Check if notification bell exists
      cy.get(".notifications").first().should("exist");
      
      // Check if notification count is displayed
      cy.get(".count").should("exist");
    });
  
    it("should open notification dropdown when clicking the bell icon", () => {
      // Click on notification bell
      cy.get(".notifications").first().click();
      
      // Check if dropdown header is visible with specific class
      cy.get('.MuiBox-root[class*="css-f9g3jc"]').should("exist");
      cy.contains("Notifications").should("be.visible");
      
      // Check for refresh and close buttons
      cy.get('button[title="Refresh"]').should("exist");
      cy.get('#close-button').should("exist");
    });
  
    it("should display notifications in dropdown", () => {
      // Click on notification bell
      cy.get(".notifications").first().click();
      cy.wait(1000); // Wait for notifications to load
      // Target the specific container with the notifications header
      cy.get('.MuiBox-root[class*="css-f9g3jc"]').should("exist").then($dropdown => {
        // Check if there are notification items
        const notificationItems = $dropdown.find('.MuiBox-root[class*="css-1maq9qn"], .MuiBox-root[class*="css-1uza06l"]');
        
        if (notificationItems.length > 0) {
          // Has notifications
          cy.wrap(notificationItems).should("have.length.at.least", 1);
          
          // Check notification structure
          cy.get('.MuiBox-root[class*="css-1maq9qn"], .MuiBox-root[class*="css-1uza06l"]').first().within(() => {
            // Check for notification icon
            cy.get('svg[data-testid="NotificationsIcon"]').should("exist");
            
            // Check for notification title
            cy.get('h6').should("exist");
            
            // Check for notification type chip
            cy.get('.MuiChip-root').should("exist");
            
            // Check for notification content
            cy.get('p').should("exist");
            
            // Check for timestamp
            cy.get('.MuiTypography-caption').should("exist");
          });
        } else {
          // No notifications
          cy.contains("No notifications available").should("be.visible");
        }
      });
    });
  
    it("should mark notification as read when clicked", () => {
      // Click on notification bell
      cy.get(".notifications").first().click();
      
      // Find the dropdown container
      cy.get('.MuiBox-root[class*="css-f9g3jc"]').should("exist").then($dropdown => {
        // Look for unread notifications (with blue dot)
        const unreadNotifications = $dropdown.find('.MuiBox-root[class*="css-giu28p"]');
        
        if (unreadNotifications.length > 0) {
          // Get the initial unread count
          cy.get(".count").invoke("text").then(initialCount => {
            // Click the first unread notification
            cy.get('.MuiBox-root[class*="css-giu28p"]').first()
              .parents('.MuiBox-root[class*="css-1maq9qn"], .MuiBox-root[class*="css-1uza06l"]')
              .click();
            
            // Reopen dropdown to check count
            cy.get(".notifications").first().click();
            
            // Check if count decreased
            cy.get(".count").invoke("text").then(newCount => {
              if (parseInt(initialCount) > 0) {
                expect(parseInt(newCount)).to.be.at.most(parseInt(initialCount));
              }
            });
          });
        } else {
          cy.log("No unread notifications found to test");
        }
      });
    });
  
    it("should refresh notifications when clicking refresh button", () => {
      // Click on notification bell
      cy.get(".notifications").first().click();
      
      // Find the dropdown container
      cy.get('.MuiBox-root[class*="css-f9g3jc"]').should("exist").within(() => {
        // Click refresh button
        cy.get('button[title="Refresh"]').click();
      });
      
      // Verify that refresh doesn't cause errors
      cy.get('.MuiBox-root[class*="css-f9g3jc"]').should("exist");
      cy.contains("Error").should("not.exist");
    });
  
    it("should close notification dropdown when clicking close button", () => {
      // Click on notification bell
      cy.get(".notifications").first().click();
      
      // Find the dropdown container
      cy.get('.MuiBox-root[class*="css-f9g3jc"]').should("exist").within(() => {
        // Click close button (the one with CloseIcon)
        cy.get('button').last().click();
      });
      
      // Verify dropdown is closed
      cy.get('.MuiBox-root[class*="css-f9g3jc"]').should("not.exist");
    });
  
    it("should delete notification using context menu", () => {
        // Click on notification bell
        cy.get(".notifications").first().click();
        cy.wait(1000); // Wait for notifications to load
        
        // Find the dropdown container
        cy.get('.MuiBox-root[class*="css-f9g3jc"]').should("exist").then($dropdown => {
          // Check if there are notification items
          const notificationItems = $dropdown.find('.MuiBox-root[class*="css-1maq9qn"], .MuiBox-root[class*="css-1uza06l"]');
          const initialCount = notificationItems.length;
          
          if (initialCount > 0) {
            // Store the first notification title for verification
            const firstNotificationTitle = $dropdown.find('h6.MuiTypography-subtitle1').first().text();
            cy.log(`First notification title: ${firstNotificationTitle}`);
            
            // Right-click on the first notification
            cy.get('.MuiBox-root[class*="css-1maq9qn"], .MuiBox-root[class*="css-1uza06l"]').first().rightclick();
            
            // Click delete option in context menu
            cy.contains("Delete Notification").click();
            
            // Wait for the delete operation to complete
            cy.wait(2000);
            
            // Verify success message if it appears
            cy.get('body').then($body => {
              if ($body.find('.swal2-success').length > 0) {
                cy.get('.swal2-confirm').click();
              }
            });
            
            // Reopen dropdown to check if notification was deleted
            cy.get(".notifications").first().click({force: true});
            cy.wait(2000); // Longer wait to ensure dropdown fully loads
            
            // Verify the notification was deleted by checking if the title exists
            cy.get('body').then($body => {
              const titleExists = $body.text().includes(firstNotificationTitle);
              expect(titleExists).to.be.false;
            });
          } else {
            cy.log("No notifications found to delete");
          }
        });
      });
      
  
    it("should display notification type indicators correctly", () => {
      // Click on notification bell
      cy.get(".notifications").first().click();
      
      // Find the dropdown container
      cy.get('.MuiBox-root[class*="css-f9g3jc"]').should("exist").then($dropdown => {
        // Check if there are notification items
        const notificationItems = $dropdown.find('.MuiBox-root[class*="css-1maq9qn"], .MuiBox-root[class*="css-1uza06l"]');
        
        if (notificationItems.length > 0) {
          // Check for notification type chips
          cy.get('.MuiChip-root').should("exist");
          
          // Verify chip styling based on notification type
          cy.get('.MuiChip-root').each($chip => {
            const chipText = $chip.text();
            if (chipText === "Common") {
              cy.wrap($chip).should("have.class", "MuiChip-colorSecondary");
            } else if (chipText === "Booking") {
              cy.wrap($chip).should("have.class", "MuiChip-colorPrimary");
            }
          });
        } else {
          cy.log("No notifications available to test type indicators");
        }
      });
    });
  
    it("should show relative time for notifications", () => {
      // Click on notification bell
      cy.get(".notifications").first().click();
      
      // Find the dropdown container
      cy.get('.MuiBox-root[class*="css-f9g3jc"]').should("exist").then($dropdown => {
        // Check if there are notification items
        const notificationItems = $dropdown.find('.MuiBox-root[class*="css-1maq9qn"], .MuiBox-root[class*="css-1uza06l"]');
        
        if (notificationItems.length > 0) {
          // Check for time indicators
          cy.get('.MuiTypography-caption').should("exist");
          
          // Verify time text format
          cy.get('.MuiTypography-caption').each($time => {
            const timeText = $time.text().toLowerCase();
            expect(timeText).to.match(/ago|just now|today|yesterday/);
          });
        } else {
          cy.log("No notifications available to test time indicators");
        }
      });
    });
  
 
  
    it("should show confirmation dialog when clicking Logout", () => {
      // Go back to dashboard
      cy.visit("http://localhost:3000/dashboard");
      
      // Click on profile avatar
      cy.get(".navbar-profile").click();
      
      // Click on Logout
      cy.contains("Logout").click();
      
      // Verify confirmation dialog appears
      cy.get(".swal2-title").should("contain", "Are you sure?");
      cy.get(".swal2-html-container").should("contain", "log out");
      
      // Click cancel to stay logged in for other tests
      cy.get(".swal2-cancel").click();
    });
  
    it("should toggle sidebar when clicking menu icon", () => {
      // Find the menu icon and click it
      cy.get(".bx-menu").click();
      
      // Check if sidebar has "close" class
      cy.get("body").then($body => {
        const sidebarElement = $body.find(".sidebar");
        if (sidebarElement.length > 0) {
          const initialState = sidebarElement.hasClass("close");
          
          // Click menu icon again
          cy.get(".bx-menu").click();
          
          // Check if sidebar class toggled
          cy.get(".sidebar").should(initialState ? "not.have.class" : "have.class", "close");
        } else {
          cy.log("Sidebar element not found with class .sidebar");
        }
      });
    });
  });
  