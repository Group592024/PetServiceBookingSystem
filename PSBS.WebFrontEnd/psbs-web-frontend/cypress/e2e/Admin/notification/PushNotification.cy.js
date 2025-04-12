describe("Select Receiver Modal E2E Tests", () => {
  // Test notification data with timestamp to ensure uniqueness
  const timestamp = Date.now();
  const testNotificationTitle = `Test Notification ${timestamp}`;
  let notificationId;

  before(() => {
    // Login as admin
    cy.loginByHien("user6@example.com", "123456");
    
    // Create a test notification that we'll use for testing
    cy.visit("http://localhost:3000/notification");
    cy.contains("button", "NEW").click({force: true});
    
    // Select notification type
    cy.get('#NotiTypeId').click({force: true});
    cy.contains("li", "Common").click({force: true});
    
    // Fill out the form fields
    cy.get('input[name="NotificationTitle"]').type(testNotificationTitle);
    cy.get('textarea[name="NotificationContent"]').type("This is a test notification content");
    
    // Submit
    cy.contains("button", "Create Notification").click({force: true});
    
    // Handle success message
    cy.get(".swal2-title", { timeout: 10000 }).should("contain", "Success");
    cy.get(".swal2-confirm").click({force: true});
    
    // Wait for the grid to refresh
    cy.wait(2000);
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
  });
  it("should handle API errors when pushing notification", () => {
   
      // Open the push modal
    cy.get(".MuiDataGrid-cell")
      .contains(testNotificationTitle)
      .closest(".MuiDataGrid-row")
      .find('[aria-label="push"]')
     .click({force: true});
      
      // Intercept the API call to mock an error
      cy.intercept('POST', '**/api/Notification/push', {
        statusCode: 400,
        body: {
          flag: false,
          message: "Error pushing notification"
        }
      }).as('pushNotificationError');
      
      // Select "All Users" option
      cy.get('#pushSelect').click({force: true});
      cy.contains("li", "All Users").click({force: true});
      
      // Submit the form
      cy.contains("button", "Confirm Selection").click({force: true});
      
      // Wait for the request to complete
      cy.wait('@pushNotificationError');
      
      // Check for error message from SweetAlert2
      cy.get(".swal2-title").should("contain", "Error");
      cy.get(".swal2-html-container").should("contain", "Error pushing notification");
      cy.get(".swal2-confirm").click({force: true});
      
      // Close the modal
      cy.contains("button", "Cancel").click({force: true});
    });
 it("should close the modal when cancel button is clicked", () => {
  
  cy.get(".MuiDataGrid-cell")
    .contains(testNotificationTitle)
    .closest(".MuiDataGrid-row")
    .find('[aria-label="push"]')
   .click({force: true});
    
    // Select some users
    cy.get('#pushSelect').click({force: true});
    cy.contains("li", "All Users").click({force: true});
    
    // Click cancel
    cy.contains("button", "Cancel").click({force: true});
    
    // Verify modal is closed
    cy.contains("Select Notification Receivers").should("not.exist");
  });
  it("should open the select receiver modal when clicking the push button", () => {
    // Find the notification in the list
    cy.contains(".MuiDataGrid-row", testNotificationTitle)
      .find('[aria-label="push"]') // Push button
      .click({force: true});
    
    // Verify the modal is open
    cy.contains("Select Notification Receivers").should("be.visible");
    
    // Close the modal
    cy.contains("button", "Cancel").click({force: true});
  });

  it("should display the email toggle switch", () => {
    // Open the push modal
  
  cy.get(".MuiDataGrid-cell")
    .contains(testNotificationTitle)
    .closest(".MuiDataGrid-row")
    .find('[aria-label="push"]')
   .click({force: true});
    
    // Verify the email toggle is present and initially unchecked
    cy.contains("Include Sending Email").should("be.visible");
    cy.get('input[type="checkbox"]').should("not.be.checked");
    
    // Toggle the switch and verify it changes
    cy.contains("Include Sending Email").click({force: true});
    cy.get('input[type="checkbox"]').should("be.checked");
    
    // Close the modal
    cy.contains("button", "Cancel").click({force: true});
  });

  it("should display receiver type dropdown with all options", () => {
    // Open the push modal
  cy.get(".MuiDataGrid-cell")
    .contains(testNotificationTitle)
    .closest(".MuiDataGrid-row")
    .find('[aria-label="push"]')
   .click({force: true});
    
    // Click the dropdown
    cy.get('#pushSelect').click({force: true});
    cy.wait(4000);
    // Verify all options are present
    cy.contains("li", "All Users").should("be.visible");
    cy.contains("li", "Regular Users Only").should("be.visible");
    cy.contains("li", "Employees Only").should("be.visible");
    cy.contains("li", "Custom Selection").should("be.visible");
    
    // Close the dropdown by clicking outside
    cy.get("body").click(0, 0);
    
    // Close the modal
    cy.contains("button", "Cancel").click({force: true});
  });

  it("should select all users when 'All Users' option is chosen", () => {
    // Open the push modal
  cy.get(".MuiDataGrid-cell")
    .contains(testNotificationTitle)
    .closest(".MuiDataGrid-row")
    .find('[aria-label="push"]')
   .click({force: true});
    
    // Select "All Users" option
    cy.get('#pushSelect').click({force: true});
    cy.contains("li", "All Users").click({force: true});
    
    // Verify that users are selected (chips are displayed)
    cy.contains("Selected Receivers").should("be.visible");
    cy.get(".MuiChip-root").should("have.length.at.least", 1);
    
    // Close the modal
    cy.contains("button", "Cancel").click({force: true});
  });

  it("should select only regular users when 'Regular Users Only' option is chosen", () => {
    // Open the push modal
  cy.get(".MuiDataGrid-cell")
    .contains(testNotificationTitle)
    .closest(".MuiDataGrid-row")
    .find('[aria-label="push"]')
   .click({force: true});
    
    // Select "Regular Users Only" option
    cy.get('#pushSelect').click({force: true});
    cy.contains("li", "Regular Users Only").click({force: true});
    
    // Verify that users are selected (chips are displayed)
    cy.contains("Selected Receivers").should("be.visible");
    cy.get(".MuiChip-root").should("have.length.at.least", 1);
    
    // Close the modal
    cy.contains("button", "Cancel").click({force: true});
  });

  it("should select only employees when 'Employees Only' option is chosen", () => {
    // Open the push modal
    cy.wait(4000);
  cy.get(".MuiDataGrid-cell")
    .contains(testNotificationTitle)
    .closest(".MuiDataGrid-row")
    .find('[aria-label="push"]')
   .click({force: true});
    
    // Select "Employees Only" option
    cy.get('#pushSelect').click({force: true});
    cy.contains("li", "Employees Only").click({force: true});
    
    // Verify that users are selected (chips are displayed)

    cy.get(".MuiChip-root").should("have.length.at.least", 1);
    
    // Close the modal
    cy.contains("button", "Cancel").click({force: true});
  });

 
 

  
  it("should successfully push notification to selected receivers", () => {
    // Open the push modal
  cy.get(".MuiDataGrid-cell")
    .contains(testNotificationTitle)
    .closest(".MuiDataGrid-row")
    .find('[aria-label="push"]')
   .click({force: true});
    
    // Select "Regular Users Only" option
    cy.get('#pushSelect').click({force: true});
    cy.contains("li", "Regular Users Only").click({force: true});
    
    // Enable email sending
    cy.contains("Include Sending Email").click({force: true});
    
    // Submit the form
    cy.contains("button", "Confirm Selection").click({force: true});
    
    // Verify success message
    cy.get(".swal2-title", { timeout: 10000 }).should("contain", "Success");
    cy.get(".swal2-confirm").click({force: true});
  cy.get('.MuiDataGrid-virtualScroller').scrollTo('left', { ensureScrollable: false });
    // Verify the notification status is updated in the list (IsPushed should be true)
    cy.contains(".MuiDataGrid-row", testNotificationTitle)
      .find(".MuiDataGrid-cell")
      .contains("Pushed")
      .should("exist");
  });

  

 
});
