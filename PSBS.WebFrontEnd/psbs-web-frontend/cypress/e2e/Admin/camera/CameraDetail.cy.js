describe("Camera Detail Modal Tests", () => {
    before(() => {
      cy.loginByHien("user6@example.com", "123456");
    });
  
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("user6@example.com", "123456");
      cy.visit("http://localhost:3000/camera");
      
      // Wait for the table to load
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
    });
  
    afterEach(() => {
      cy.saveLocalStorage();
    });
  
    it("should open camera detail modal when view button is clicked", () => {
      // Click the view button on the first camera
      cy.get(".MuiDataGrid-row")
        .first()
        .find('[aria-label="info"]')
        .click({force: true});
      
      // Verify the detail modal is displayed
      cy.get(".MuiModal-root").should("be.visible");
      cy.contains("Camera Details").should("be.visible");
    });
  
    it("should display correct camera information in detail modal", () => {
      // Get details from the first row in the table
      let cameraDetails = {};
      
      cy.get(".MuiDataGrid-row")
        .first()
        .then(($row) => {
          cameraDetails.cameraCode = $row.find('[data-field="cameraCode"]').text();
          cameraDetails.cameraType = $row.find('[data-field="cameraType"]').text();
          cameraDetails.cameraAddress = $row.find('[data-field="cameraAddress"]').text();
          cameraDetails.cameraStatus = $row.find('[data-field="cameraStatus"]').text();
          
          // Click the view button
          cy.wrap($row).find('[aria-label="info"]').click({force: true});
        });
      
      // Verify the details in the modal match the row data
      cy.get(".MuiModal-root").within(() => {
        cy.contains(cameraDetails.cameraCode).should("be.visible");
        cy.contains(cameraDetails.cameraType).should("be.visible");
        cy.contains(cameraDetails.cameraAddress).should("be.visible");
        
        // Status might be displayed differently in the modal vs. table
        if (cameraDetails.cameraStatus.includes("In Use")) {
          cy.contains("In Use").should("be.visible");
        } else if (cameraDetails.cameraStatus.includes("Free")) {
          cy.contains("Free").should("be.visible");
        } else if (cameraDetails.cameraStatus.includes("Under Repair")) {
          cy.contains("Under Repair").should("be.visible");
        } else if (cameraDetails.cameraStatus.includes("Discarded")) {
          cy.contains("Discarded").should("be.visible");
        }
      });
    });
  
    
    it("should display RTSP URL as a clickable link", () => {
      // Click the view button on the first camera
      cy.get(".MuiDataGrid-row")
        .first()
        .find('[aria-label="info"]')
        .click({force: true});
      
      // Verify the RTSP URL is displayed as a link
      cy.get(".MuiModal-root").within(() => {
        cy.contains("RTSP URL").should("be.visible");
        cy.get('a[href^="rtsp://"]')
          .should("be.visible")
          .and("have.attr", "target", "_blank")
          .and("have.attr", "rel", "noopener");
      });
    });
  
    it("should display correct status chips for different camera statuses", () => {
      // Test for each status type if available
      const statusesToTest = ["In Use", "Free", "Under Repair", "Discarded"];
      
      for (const statusToTest of statusesToTest) {
        // Find a camera with the current status to test
        cy.get(".MuiDataGrid-row").each(($row) => {
          const statusText = $row.find('[data-field="cameraStatus"]').text();
          
          if (statusText.includes(statusToTest)) {
            // Click the view button
            cy.wrap($row).find('[aria-label="info"]').click({force: true});
            
            // Verify the status chip in the modal
            cy.get(".MuiModal-root").within(() => {
              cy.contains("Operational Status:").should("be.visible");
              
              // Check for the correct chip based on status
              if (statusToTest === "In Use") {
                cy.get('.MuiChip-colorPrimary').contains("In Use").should("be.visible");
              } else if (statusToTest === "Free") {
                cy.get('.MuiChip-colorInfo').contains("Free").should("be.visible");
              } else if (statusToTest === "Under Repair") {
                cy.get('.MuiChip-colorWarning').contains("Under Repair").should("be.visible");
              } else if (statusToTest === "Discarded") {
                cy.get('.MuiChip-colorDefault').contains("Discarded").should("be.visible");
              }
              
              // Close the modal
              cy.contains("button", "Close").click({force: true});
            });
            
            // Break the each loop
            return false;
          }
        });
      }
    });
  
    it("should display correct system status chip (Active/Deleted)", () => {
      // Test for both active and deleted cameras if available
      
      // First test an active camera
      cy.get(".MuiDataGrid-row").each(($row) => {
        const isActiveText = $row.find('[data-field="isDeleted"]').text();
        
        if (isActiveText.includes("Active")) {
          // Click the view button
          cy.wrap($row).find('[aria-label="info"]').click({force: true});
          
          // Verify the active status chip in the modal
          cy.get(".MuiModal-root").within(() => {
            cy.contains("System Status:").should("be.visible");
            cy.get('.MuiChip-colorSuccess').contains("Active").should("be.visible");
            
            // Close the modal
            cy.contains("button", "Close").click({force: true});
          });
          
          // Break the each loop
          return false;
        }
      });
      
      // Then test a deleted camera if available
      cy.get(".MuiDataGrid-row").each(($row) => {
        const isActiveText = $row.find('[data-field="isDeleted"]').text();
        
        if (isActiveText.includes("Inactive")) {
          // Click the view button
          cy.wrap($row).find('[aria-label="info"]').click({force: true});
          
          // Verify the deleted status chip in the modal
          cy.get(".MuiModal-root").within(() => {
            cy.contains("System Status:").should("be.visible");
            cy.get('.MuiChip-colorError').contains("Deleted").should("be.visible");
            
            // Close the modal
            cy.contains("button", "Close").click({force: true});
          });
          
          // Break the each loop
          return false;
        }
      });
    });
  
    it("should close the detail modal when close button is clicked", () => {
      // Click the view button on the first camera
      cy.get(".MuiDataGrid-row")
        .first()
        .find('[aria-label="info"]')
        .click({force: true});
      
      // Verify the modal is displayed
      cy.get(".MuiModal-root").should("be.visible");
      
      // Click the close button
      cy.contains("button", "Close").click({force: true});
      
      // Verify the modal is closed
      cy.get(".MuiModal-root").should("not.exist");
    });
  
    it("should close the detail modal when X icon is clicked", () => {
      // Click the view button on the first camera
      cy.get(".MuiDataGrid-row")
        .first()
        .find('[aria-label="info"]')
        .click({force: true});
      
      // Verify the modal is displayed
      cy.get(".MuiModal-root").should("be.visible");
      
      // Click the X icon button
      cy.get(".MuiModal-root")
        .find("button")
        .first()
        .click({force: true});
      
      // Verify the modal is closed
      cy.get(".MuiModal-root").should("not.exist");
    });
  
    it("should handle modal backdrop click to close", () => {
      // Click the view button on the first camera
      cy.get(".MuiDataGrid-row")
        .first()
        .find('[aria-label="info"]')
        .click({force: true});
      
      // Verify the modal is displayed
      cy.get(".MuiModal-root").should("be.visible");
      
      // Click outside the modal (on the backdrop)
      cy.get(".MuiBackdrop-root").click({ force: true });
      
      // Verify the modal is closed
      cy.get(".MuiModal-root").should("not.exist");
    });
  });
  