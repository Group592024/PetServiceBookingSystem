describe("Edit Camera Tests", () => {
    before(() => {
      cy.loginByHien("user6@example.com", "123456");
    });
  
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("user6@example.com", "123456");
      cy.visit("http://localhost:3000/camera");
    });
  
    afterEach(() => {
      cy.saveLocalStorage();
    });
  
    it("should successfully edit a camera with Free status", () => {
      // Wait for the table to load
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      
      // Find a camera with Free status to edit
      let cameraToEdit;
      cy.get(".MuiDataGrid-row").each(($row) => {
        const $statusCell = $row.find('[data-field="cameraStatus"]');
        if ($statusCell.text().includes("Free")) {
          cameraToEdit = $row;
          return false; // Break the each loop
        }
      }).then(() => {
        if (cameraToEdit) {
          // Click the edit button on the Free camera
          cy.wrap(cameraToEdit).find('[aria-label="edit"]').click();
          
          // Verify the edit modal is displayed
          cy.get(".MuiModal-root").should("be.visible");
          cy.contains("Update Camera").should("be.visible");
          
          // Generate a new address with timestamp
          const newAddress = "Updated Location " + Date.now().toString().slice(-6);
          
          // Update the camera address
          cy.get('input[name="cameraAddress"]').clear().type(newAddress);
          
          // Submit the form
          cy.contains("button", "Update Camera").click();
          
          // Verify success message
          cy.get(".swal2-container").should("be.visible");
          cy.get(".swal2-title").should("contain", "Success");
          cy.get(".swal2-confirm").click();
          
          // Verify the camera was updated in the table
          cy.contains(newAddress).should("be.visible");
        } else {
          // If no Free camera found, log a message
          cy.log("No camera with Free status found to edit");
        }
      });
    });
  
    it("should change camera status from Free to Under Repair", () => {
      // Wait for the table to load
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      
      // Find a camera with Free status to edit
      let cameraToEdit;
      cy.get(".MuiDataGrid-row").each(($row) => {
        const $statusCell = $row.find('[data-field="cameraStatus"]');
        if ($statusCell.text().includes("Free")) {
          cameraToEdit = $row;
          return false; // Break the each loop
        }
      }).then(() => {
        if (cameraToEdit) {
          // Store the camera code for later verification
          const cameraCode = cameraToEdit.find('[data-field="cameraCode"]').text();
          
          // Click the edit button on the Free camera
          cy.wrap(cameraToEdit).find('[aria-label="edit"]').click();
          
          // Verify the edit modal is displayed
          cy.get(".MuiModal-root").should("be.visible");
          
          // Change status to Under Repair
          cy.get('[id="cameraStatus"]').click();
          cy.get('[data-value="UnderRepair"]').click();
          
          // Submit the form
          cy.contains("button", "Update Camera").click();
          
          // Verify success message
          cy.get(".swal2-container").should("be.visible");
          cy.get(".swal2-title").should("contain", "Success");
          cy.get(".swal2-confirm").click();
          
          // Verify the camera status was updated in the table
          cy.contains(cameraCode)
            .parents(".MuiDataGrid-row")
            .find('[data-field="cameraStatus"] .MuiChip-colorWarning')
            .should("be.visible");
        } else {
          // If no Free camera found, log a message
          cy.log("No camera with Free status found to edit");
        }
      });
    });
  
    it("should validate RTSP URL format when editing", () => {
      // Wait for the table to load
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      
      // Find a camera that's not In Use to edit
      let cameraToEdit;
      cy.get(".MuiDataGrid-row").each(($row) => {
        const $statusCell = $row.find('[data-field="cameraStatus"]');
        if (!$statusCell.text().includes("In Use")) {
          cameraToEdit = $row;
          return false; // Break the each loop
        }
      }).then(() => {
        if (cameraToEdit) {
          // Click the edit button
          cy.wrap(cameraToEdit).find('[aria-label="edit"]').click();
          
          // Verify the edit modal is displayed
          cy.get(".MuiModal-root").should("be.visible");
          
          // Enter invalid RTSP URL
          cy.get('input[name="rtspUrl"]').clear().type("invalid-url-format");
          
          // Try to submit the form
          cy.contains("button", "Update Camera").click();
          
          // Verify validation error for RTSP URL
          cy.contains("Invalid RTSP URL format").should("be.visible");
          
          // Fix the RTSP URL
          cy.get('input[name="rtspUrl"]').clear().type("rtsp://admin:pass@192.168.1.200:554/stream");
          
          // Submit the form
          cy.contains("button", "Update Camera").click();
          
          // Verify success message
          cy.get(".swal2-container").should("be.visible");
          cy.get(".swal2-confirm").click();
        } else {
          // If no editable camera found, log a message
          cy.log("No editable camera found");
        }
      });
    });
  
    it("should toggle camera active status", () => {
      // Wait for the table to load
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      
      // Find a camera that's not In Use to edit
      let cameraToEdit;
      cy.get(".MuiDataGrid-row").each(($row) => {
        const $statusCell = $row.find('[data-field="cameraStatus"]');
        if (!$statusCell.text().includes("In Use")) {
          cameraToEdit = $row;
          return false; // Break the each loop
        }
      }).then(() => {
        if (cameraToEdit) {
          // Store the camera code and current active status
          const cameraCode = cameraToEdit.find('[data-field="cameraCode"]').text();
          const isCurrentlyActive = cameraToEdit.find('[data-field="isDeleted"]').text().includes("Active");
          
          // Click the edit button
          cy.wrap(cameraToEdit).find('[aria-label="edit"]').click();
          
          // Verify the edit modal is displayed
          cy.get(".MuiModal-root").should("be.visible");
          
          // Toggle the active status switch
          cy.get('input[name="isDeleted"]').parent().click();
          
          // Submit the form
          cy.contains("button", "Update Camera").click();
          
          // Verify success message
          cy.get(".swal2-container").should("be.visible");
          cy.get(".swal2-confirm").click();
          
          // Verify the active status was toggled in the table
          if (isCurrentlyActive) {
            // Should now be inactive
            cy.contains(cameraCode)
              .parents(".MuiDataGrid-row")
              .find('[data-field="isDeleted"] .MuiChip-colorError')
              .should("be.visible");
          } else {
            // Should now be active
            cy.contains(cameraCode)
              .parents(".MuiDataGrid-row")
              .find('[data-field="isDeleted"] .MuiChip-colorSuccess')
              .should("be.visible");
          }
        } else {
          // If no editable camera found, log a message
          cy.log("No editable camera found");
        }
      });
    });
  
    it("should cancel editing a camera", () => {
      // Wait for the table to load
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      
      // Find a camera that's not In Use to edit
      let cameraToEdit;
      cy.get(".MuiDataGrid-row").each(($row) => {
        const $statusCell = $row.find('[data-field="cameraStatus"]');
        if (!$statusCell.text().includes("In Use")) {
          cameraToEdit = $row;
          return false; // Break the each loop
        }
      }).then(() => {
        if (cameraToEdit) {
          // Store the original camera address
          const originalAddress = cameraToEdit.find('[data-field="cameraAddress"]').text();
          
          // Click the edit button
          cy.wrap(cameraToEdit).find('[aria-label="edit"]').click();
          
          // Verify the edit modal is displayed
          cy.get(".MuiModal-root").should("be.visible");
          
          // Change the address
          cy.get('input[name="cameraAddress"]').clear().type("This change will be cancelled");
          
          // Click Cancel button
          cy.contains("button", "Cancel").click();
          
          // Verify modal is closed
          cy.get(".MuiModal-root").should("not.exist");
          
          // Verify the address was not changed in the table
          cy.contains(originalAddress).should("be.visible");
        } else {
          // If no editable camera found, log a message
          cy.log("No editable camera found");
        }
      });
    });
  
    it("should not allow editing cameras with In Use status", () => {
      // Wait for the table to load
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      
      // Find a camera with In Use status
      let inUseCamera;
      cy.get(".MuiDataGrid-row").each(($row) => {
        const $statusCell = $row.find('[data-field="cameraStatus"]');
        if ($statusCell.text().includes("In Use")) {
          inUseCamera = $row;
          return false; // Break the each loop
        }
      }).then(() => {
        if (inUseCamera) {
          // Verify the edit button is disabled (has default color)
          cy.wrap(inUseCamera)
            .find('[aria-label="edit"] svg')
            .should("have.class", "MuiSvgIcon-colorDefault");
          
          // Try to click it anyway (should not open modal)
          cy.wrap(inUseCamera).find('[aria-label="edit"]').click({ force: true });
          
          // Verify no modal appears
          cy.get(".MuiModal-root").should("not.exist");
        } else {
          // If no In Use camera found, log a message
          cy.log("No camera with In Use status found");
        }
      });
    });
  });
  