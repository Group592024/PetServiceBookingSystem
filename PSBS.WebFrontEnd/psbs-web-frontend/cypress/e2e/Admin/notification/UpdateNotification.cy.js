describe("Update Notification E2E Tests", () => {
    // Test notification data
    const testNotificationTitle = "Test Update Notification";
    const testNotificationContent = "This is a test notification content for update testing.";
    const updatedTitle = "Updated Notification Title";
    const updatedContent = "This is the updated content for the notification.";
  
    before(() => {
      // Login as admin
      cy.loginByHien("user6@example.com", "123456");
      
      // Create a test notification that we'll use for update testing
      cy.visit("http://localhost:3000/notification");
      cy.contains("button", "NEW").click();
      
      // Select notification type
      cy.get('#NotiTypeId').click();
      cy.contains("li", "Common").click({force: true});
      
      // Fill out the form fields
      cy.get('input[name="NotificationTitle"]').type(testNotificationTitle);
      cy.get('textarea[name="NotificationContent"]').type(testNotificationContent);
      
      // Submit
      cy.contains("button", "Create Notification").click();
      
      // Handle success message
      cy.get(".swal2-title", { timeout: 10000 }).should("contain", "Success");
      cy.get(".swal2-confirm").click();
    });
  
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("user6@example.com", "123456");
      cy.visit("http://localhost:3000/notification");
    });
  
    afterEach(() => {
      cy.saveLocalStorage();
    });
  
    after(() => {
      // Delete the test notification
      cy.deleteNotification(updatedTitle);
    });
  
    it("should open the update notification modal when clicking the edit button", () => {
      // Find the notification in the list
      cy.get(".MuiDataGrid-cell")
        .contains(testNotificationTitle)
        .closest(".MuiDataGrid-row")
        .find('[aria-label="edit"]') // Edit button
       .click({force: true});
      
      // Verify the modal is open
      cy.contains("Update Notification").should("be.visible");
    });
  
    it("should display the current notification data in the update form", () => {
      // Find and open the notification for editing
      cy.get(".MuiDataGrid-cell")
        .contains(testNotificationTitle)
        .closest(".MuiDataGrid-row")
        .find('[aria-label="edit"]')
       .click({force: true});
      
      // Verify form is pre-filled with correct data
      cy.get('input[name="notificationTitle"]').should("have.value", testNotificationTitle);
      cy.get('textarea[name="notificationContent"]').should("have.value", testNotificationContent);
      
      // Verify notification type is selected
      cy.get('#notiTypeId').should("exist");
      
      // Verify status switch exists
      cy.get('input[name="isDeleted"]').should("exist");
      
      // Close the modal
      cy.contains("button", "Cancel").click();
    });
  
    it("should update notification with new data successfully", () => {
      // Find and open the notification for editing
      cy.get(".MuiDataGrid-cell")
        .contains(testNotificationTitle)
        .closest(".MuiDataGrid-row")
        .find('[aria-label="edit"]')
       .click({force: true});
      
      // Update the notification title and content
      cy.get('input[name="notificationTitle"]').clear().type(updatedTitle);
      cy.get('textarea[name="notificationContent"]').clear().type(updatedContent);
      
      // Change notification type
      cy.get('#notiTypeId').click();
      cy.contains("li", "Booking").click({force: true});
      
      // Submit the form
      cy.contains("button", "Update Notification").click({force: true});
      
      // Verify success message
      cy.get(".swal2-title", { timeout: 10000 }).should("contain", "Success");
      cy.get(".swal2-confirm").click();
      cy.wait(1000);
      cy.get('.MuiDataGrid-virtualScroller').scrollTo('left', { ensureScrollable: false });
      // Verify the notification was updated in the list
      cy.get(".MuiDataGrid-cell").contains(updatedTitle).should("exist");
      
      // Open the detail view to verify all changes
      cy.get(".MuiDataGrid-cell")
        .contains(updatedTitle)
        .closest(".MuiDataGrid-row")
        .find('[aria-label="info"]')
       .click({force: true});
      
      // Verify updated details
      cy.contains("p", updatedTitle).should("exist");
      cy.contains("p", updatedContent).should("exist");
      cy.get(".MuiChip-root").contains("Common").should("exist");
      
      // Close the detail modal
      cy.contains("button", "Close").click({force: true});
    });
  
    it("should toggle notification status between active and inactive", () => {
      // Find and open the notification for editing
      cy.get(".MuiDataGrid-cell")
        .contains(updatedTitle)
        .closest(".MuiDataGrid-row")
        .find('[aria-label="edit"]')
       .click({force: true});
      
      // Get the current status
      cy.get('input[name="isDeleted"]').then(($switch) => {
        const isCurrentlyInactive = $switch.prop('checked');
        
        // Toggle the status
        cy.get('input[name="isDeleted"]')
          .parent()
         .click({force: true});
        
        // Verify the status chip changes
        if (isCurrentlyInactive) {
          cy.contains("Active").should("exist");
        } else {
          cy.contains("Inactive").should("exist");
        }
        
        // Submit the form
        cy.contains("button", "Update Notification").click();
        
        // Verify success message
        cy.get(".swal2-title").should("contain", "Success");
        cy.get(".swal2-confirm").click();
        cy.get('.MuiDataGrid-virtualScroller').scrollTo('left', { ensureScrollable: false });
        // Open the detail view to verify status change
        cy.get(".MuiDataGrid-cell")
          .contains(updatedTitle)
          .closest(".MuiDataGrid-row")
          .find('[aria-label="info"]')
         .click({force: true});
        
        // Verify the status is updated
        if (isCurrentlyInactive) {
          cy.get(".MuiChip-root").contains("Active").should("exist");
        } else {
          cy.get(".MuiChip-root").contains("Inactive").should("exist");
        }
        
        // Close the detail modal
        cy.contains("button", "Close").click({force: true});
      });
    });
  
    it("should validate required fields in the update form", () => {
      // Find and open the notification for editing
      cy.get(".MuiDataGrid-cell")
        .contains(updatedTitle)
        .closest(".MuiDataGrid-row")
        .find('[aria-label="edit"]')
       .click({force: true});
      
      // Clear required fields
      cy.get('input[name="notificationTitle"]').clear();
      cy.get('textarea[name="notificationContent"]').clear();
      
      // Submit the form
      cy.contains("button", "Update Notification").click();
      
      // Verify validation errors
      cy.contains("Title is required").should("be.visible");
      cy.contains("Content is required").should("be.visible");
      
      // Close the modal
      cy.contains("button", "Cancel").click();
    });
  
    it("should show character count for title and content fields", () => {
      // Find and open the notification for editing
      cy.get(".MuiDataGrid-cell")
        .contains(updatedTitle)
        .closest(".MuiDataGrid-row")
        .find('[aria-label="edit"]')
       .click({force: true});
      
      // Check initial character counts
      cy.contains(`${updatedTitle.length}/100`).should("be.visible");
      cy.contains(`${updatedContent.length}/1000`).should("be.visible");
      
      // Type additional text and verify count updates
      const additionalText = " - Extra text for testing character count";
      cy.get('input[name="notificationTitle"]').type(additionalText);
      cy.contains(`${updatedTitle.length + additionalText.length}/100`).should("be.visible");
      
      // Close the modal
      cy.contains("button", "Cancel").click();
    });
  
    it("should close the modal without saving changes when Cancel is clicked", () => {
      // Find and open the notification for editing
      cy.get(".MuiDataGrid-cell")
        .contains(updatedTitle)
        .closest(".MuiDataGrid-row")
        .find('[aria-label="edit"]')
       .click({force: true});
      
      // Make some changes
      const tempTitle = "Temporary title that should not be saved";
      cy.get('input[name="notificationTitle"]').clear().type(tempTitle);
      
      // Click Cancel
      cy.contains("button", "Cancel").click();
      
      // Verify the modal is closed
      cy.contains("Update Notification").should("not.exist");
      cy.get('.MuiDataGrid-virtualScroller').scrollTo('left', { ensureScrollable: false });
      // Verify the changes were not saved
      cy.get(".MuiDataGrid-cell").contains(tempTitle).should("not.exist");
      cy.get(".MuiDataGrid-cell").contains(updatedTitle).should("exist");
    });
  
    it("should handle long text inputs appropriately", () => {
      // Find and open the notification for editing
      cy.get(".MuiDataGrid-cell")
        .contains(updatedTitle)
        .closest(".MuiDataGrid-row")
        .find('[aria-label="edit"]')
       .click({force: true});
      
      // Create a long title (100 characters)
      const longTitle = "A".repeat(100);
      cy.get('input[name="notificationTitle"]').clear().type(longTitle);
      
      // Verify character count shows 100/100
      cy.contains("100/100").should("be.visible");
      
      // Try to type one more character (should be prevented by maxLength)
      cy.get('input[name="notificationTitle"]').type("X");
      cy.contains("100/100").should("be.visible");
      
      // Create a long content (approaching 1000 characters)
      const longContent = "B".repeat(990);
      cy.get('textarea[name="notificationContent"]').clear().type(longContent);
      
      // Verify character count shows 990/1000
      cy.contains("990/1000").should("be.visible");
      
      // Close without saving
      cy.contains("button", "Cancel").click();
    });
  });
  