describe("Create Notification E2E Tests", () => {
    const testNotificationTitle = "Test Notification Title";
    const testNotificationContent = "This is a test notification content created by Cypress.";
  
    before(() => {
      cy.loginByHien("user6@example.com", "123456"); // loginByHien function defined in commands
    });
  
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("user6@example.com", "123456");
      cy.visit("http://localhost:3000/notification");
      cy.contains("button", "NEW").click();
    });
  
    afterEach(() => {
      cy.saveLocalStorage();
    });
  
    after(() => {
      // Delete the test notification
      cy.deleteNotification(testNotificationTitle);
      cy.deleteNotification(testNotificationTitle);
    });
  
    it("should open the create notification form and submit successfully", () => {
      // Select notification type
      cy.get('#NotiTypeId').click();
      cy.contains("li", "Common").click({force: true});
  
      // Fill out the form fields
      cy.get('input[name="NotificationTitle"]').type(testNotificationTitle);
      cy.get('textarea[name="NotificationContent"]').type(testNotificationContent);
  
      // Submit
      cy.contains("button", "Create Notification").click();
  
      // Check for success message from SweetAlert2
      cy.get(".swal2-title").should("contain", "Success!");
      cy.get(".swal2-html-container").should("be.visible");
      cy.get(".swal2-confirm").click();
  
      // Verify the notification appears in the table
      cy.contains(".MuiDataGrid-cell", testNotificationTitle).should("be.visible");
    });
  
    it("should display validation errors for empty required fields", () => {
      // Submit without filling any fields
      cy.contains("button", "Create Notification").click();
  
      // Check for invalid fields
      cy.get('input[name="NotificationTitle"]').should("have.attr", "aria-invalid", "true");
      cy.get('textarea[name="NotificationContent"]').should("have.attr", "aria-invalid", "true");
  
      // Check error messages
      cy.contains("Title is required").should("be.visible");
      cy.contains("Content is required").should("be.visible");
    });
  
  
  
    it("should show character count for notification content", () => {
      const testContent = "This is a test content";
      cy.get('textarea[name="NotificationContent"]').type(testContent);
      
      // Check if the character count is displayed correctly
      cy.contains(`${testContent.length}/1000`).should("be.visible");
    });
  
    it("should close the modal when cancel button is clicked", () => {
      // Fill some data first
      cy.get('input[name="NotificationTitle"]').type("Test Title");
      
      // Click cancel
      cy.contains("button", "Cancel").click();
      
      // Verify modal is closed
      cy.get('input[name="NotificationTitle"]').should("not.exist");
    });
  
    it("should handle API error responses appropriately", () => {
      // Intercept the API call to mock an error
      cy.intercept('POST', '**/api/Notification', {
        statusCode: 400,
        body: {
          flag: false,
          message: "Error creating notification"
        }
      }).as('createNotificationError');
  
      // Select notification type
      cy.get('#NotiTypeId').click();
      cy.contains("li", "Common").click();
  
      // Fill out the form fields
      cy.get('input[name="NotificationTitle"]').type(testNotificationTitle);
      cy.get('textarea[name="NotificationContent"]').type(testNotificationContent);
  
      // Submit
      cy.contains("button", "Create Notification").click();
      
      // Wait for the request to complete
      cy.wait('@createNotificationError');
      
      // Check for error message from SweetAlert2
      cy.get(".swal2-title").should("contain", "Error!");
      cy.get(".swal2-html-container").should("contain", "Error creating notification");
      cy.get(".swal2-confirm").click();
    });
  });
  