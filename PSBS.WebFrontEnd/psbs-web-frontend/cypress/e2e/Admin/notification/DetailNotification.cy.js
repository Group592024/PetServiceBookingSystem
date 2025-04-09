describe("Notification Detail Modal E2E Tests", () => {
  // Test notification data
  const testNotificationTitle = "Test Detail Notification";
  const testNotificationContent = "This is a test notification content for detail view testing.";

  before(() => {
    // Login as admin
    cy.loginByHien("user6@example.com", "123456");
    
    // Create a test notification that we'll use for detail testing
    cy.visit("http://localhost:3000/notification");
    cy.contains("button", "NEW").click({force: true});
    
    // Select notification type
    cy.get('#NotiTypeId').click({force: true});
    cy.contains("li", "Common").click({force: true});
    
    // Fill out the form fields
    cy.get('input[name="NotificationTitle"]').type(testNotificationTitle);
    cy.get('textarea[name="NotificationContent"]').type(testNotificationContent);
    
    // Submit
    cy.contains("button", "Create Notification").click({force: true});
    
    // Handle success message
    cy.get(".swal2-title", { timeout: 10000 }).should("contain", "Success");
    cy.get(".swal2-confirm").click({force: true});
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
    cy.deleteNotification(testNotificationTitle);
    cy.deleteNotification(testNotificationTitle);
  });

  it("should open the notification detail modal when clicking the info button", () => {
    // Find the notification in the list
    cy.get(".MuiDataGrid-cell")
      .contains(testNotificationTitle)
      .closest(".MuiDataGrid-row")
      .find('[aria-label="info"]') // Info button
      .click({force: true});
    
    // Verify the modal is open
    cy.contains("Notification Details").should("be.visible");
  });

  it("should display correct notification details in the modal", () => {
    // Find and open the notification detail
    cy.get(".MuiDataGrid-cell")
      .contains(testNotificationTitle)
      .closest(".MuiDataGrid-row")
      .find('[aria-label="info"]')
      .click({force: true});
    
    // Verify notification details are displayed correctly
    cy.contains("Notification Details").should("be.visible");
    
    // Use more specific selectors to check for elements that might be covered
    cy.contains("h6", "Title").should("exist");
    cy.contains("p", testNotificationTitle).should("exist");
    
    cy.contains("h6", "Content").should("exist");
    cy.contains("p", testNotificationContent).should("exist");
    
    cy.contains("h6", "Notification ID").should("exist");
    cy.contains("h6", "Created Date").should("exist");
    
    // Check status section
    cy.contains("Notification Status").should("exist");
    cy.contains("p", "Type:").should("exist");
    
    // Check for the type chip
    cy.get(".MuiChip-root").contains("Common").should("exist");
    
    cy.contains("p", "Push:").should("exist");
    cy.get(".MuiChip-root").contains("Pending").should("exist");
    
    cy.contains("p", "Status:").should("exist");
    cy.get(".MuiChip-root").contains("Active").should("exist");
  });

  it("should close the modal when clicking the close button", () => {
    // Find and open the notification detail
    cy.get(".MuiDataGrid-cell")
      .contains(testNotificationTitle)
      .closest(".MuiDataGrid-row")
      .find('[aria-label="info"]')
      .click({force: true});
    
    // Verify the modal is open
    cy.contains("Notification Details").should("be.visible");
    
    // Click the close button (X in the corner) - use force if needed
    cy.get('[data-testid="CloseIcon"]').click({force: true});
    
    // Verify the modal is closed
    cy.contains("Notification Details").should("not.exist");
  });

  it("should close the modal when clicking the Close button at the bottom", () => {
    // Find and open the notification detail
    cy.get(".MuiDataGrid-cell")
      .contains(testNotificationTitle)
      .closest(".MuiDataGrid-row")
      .find('[aria-label="info"]')
      .click({force: true});
    
    // Verify the modal is open
    cy.contains("Notification Details").should("be.visible");
    
    // Click the Close button at the bottom - use force if needed
    cy.contains("button", "Close").click({force: true});
    
    // Verify the modal is closed
    cy.contains("Notification Details").should("not.exist");
  });

  it("should verify notification status changes after deletion", () => {
    // Create a temporary notification to delete
    cy.visit("http://localhost:3000/notification");
    cy.contains("button", "NEW").click({force: true});
    
    // Select notification type
    cy.get('#NotiTypeId').click({force: true});
    cy.contains("li", "Common").click({force: true});
    
    // Fill out the form fields
    const tempTitle = "Temp Delete Test Notification";
    cy.get('input[name="NotificationTitle"]').type(tempTitle);
    cy.get('textarea[name="NotificationContent"]').type("This notification will be deleted");
    
    // Submit
    cy.contains("button", "Create Notification").click({force: true});
    cy.get(".swal2-confirm").click({force: true});
    
    // Delete the notification
    cy.get(".MuiDataGrid-cell")
      .contains(tempTitle)
      .closest(".MuiDataGrid-row")
      .find('[aria-label="delete"]')
      .click({force: true});
    
    // Confirm deletion
    cy.get(".swal2-confirm").click({force: true});
    
    // Wait for success toast
    cy.contains("Deleted successfully").should("be.visible");
    
    // Find the notification again (it should still be in the list but marked as inactive)
    cy.get(".MuiDataGrid-cell")
      .contains(tempTitle)
      .closest(".MuiDataGrid-row")
      .find('[aria-label="info"]')
      .click({force: true});
    
    // Verify the status is now Inactive - use contains with the element type
    cy.get(".MuiChip-root").contains("Inactive").should("exist");
    
    // Close the modal
    cy.contains("button", "Close").click({force: true});
  });
});
