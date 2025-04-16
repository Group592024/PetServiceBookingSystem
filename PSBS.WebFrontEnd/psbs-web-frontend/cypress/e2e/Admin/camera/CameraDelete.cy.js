describe("Delete Camera Tests", () => {
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
  
    it("should successfully delete a camera with Free status", () => {
      // Find a camera with Free status to delete
      let cameraToDelete;
      let cameraCode;
      
      cy.get(".MuiDataGrid-row").each(($row) => {
        const $statusCell = $row.find('[data-field="cameraStatus"]');
        if ($statusCell.text().includes("Free")) {
          cameraToDelete = $row;
          cameraCode = $row.find('[data-field="cameraCode"]').text();
          return false; // Break the each loop
        }
      }).then(() => {
        if (cameraToDelete) {
          // Click the delete button on the Free camera
          cy.wrap(cameraToDelete).find('[aria-label="delete"]').click({force: true});
          
          // Verify the confirmation dialog appears
          cy.get(".swal2-container").should("be.visible");
          cy.get(".swal2-title").should("contain", "Are you sure?");
          cy.get(".swal2-html-container").should("contain", "You won't be able to revert this!");
          
          // Confirm deletion
          cy.get(".swal2-confirm").click({force: true});
          
          // Verify success message
          cy.get(".swal2-container").should("be.visible");
          cy.get(".swal2-title").should("contain", "Success");
          cy.get(".swal2-confirm").click({force: true});
          
          // Verify the camera is no longer in the table or is marked as deleted
          cy.get(".MuiDataGrid-virtualScrollerRenderZone").then(($table) => {
            if ($table.text().includes(cameraCode)) {
              // If still in table, it should be marked as inactive
              cy.contains(cameraCode)
                .parents(".MuiDataGrid-row")
                .find('[data-field="isDeleted"]')
                .should("contain", "Inactive");
            } else {
              // Or it might be completely removed from the table
              cy.contains(cameraCode).should("not.exist");
            }
          });
        } else {
          // If no Free camera found, log a message
          cy.log("No camera with Free status found to delete");
        }
      });
    });
  
    it("should cancel camera deletion when Cancel is clicked", () => {
      // Find a camera with Free status that can be deleted
      let cameraToDelete;
      let cameraCode;
      
      cy.get(".MuiDataGrid-row").each(($row) => {
        const $statusCell = $row.find('[data-field="cameraStatus"]');
        if ($statusCell.text().includes("Free")) {
          cameraToDelete = $row;
          cameraCode = $row.find('[data-field="cameraCode"]').text();
          return false; // Break the each loop
        }
      }).then(() => {
        if (cameraToDelete) {
          // Click the delete button
          cy.wrap(cameraToDelete).find('[aria-label="delete"]').click({force: true});
          
          // Verify the confirmation dialog appears
          cy.get(".swal2-container").should("be.visible");
          cy.get(".swal2-title").should("contain", "Are you sure?");
          
          // Click Cancel
          cy.get(".swal2-cancel").click({force: true});
          
          // Verify the dialog is closed
          cy.get(".swal2-container").should("not.exist");
          
          // Verify the camera is still in the table and not deleted
          cy.contains(cameraCode)
            .parents(".MuiDataGrid-row")
            .find('[data-field="isDeleted"]')
            .should("contain", "Active");
        } else {
          // If no Free camera found, log a message
          cy.log("No camera with Free status found to test cancel deletion");
        }
      });
    });
  
    it("should not allow deleting cameras with In Use status", () => {
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
          // Verify the delete button is disabled (has default color)
          cy.wrap(inUseCamera)
            .find('[aria-label="delete"] svg')
            .should("have.class", "MuiSvgIcon-colorDefault");
          
          // Try to click it anyway (should not open dialog)
          cy.wrap(inUseCamera).find('[aria-label="delete"]').click({ force: true });
          
          // Verify no confirmation dialog appears
          cy.get(".swal2-container").should("not.exist");
        } else {
          // If no In Use camera found, log a message
          cy.log("No camera with In Use status found");
        }
      });
    });
  
    it("should handle error case when deletion fails", () => {
      // This test simulates a server error during deletion
      // We'll use cy.intercept to mock a failed API response
      
      // Find a camera with Free status to delete
      let cameraToDelete;
      
      cy.get(".MuiDataGrid-row").each(($row) => {
        const $statusCell = $row.find('[data-field="cameraStatus"]');
        if ($statusCell.text().includes("Free")) {
          cameraToDelete = $row;
          return false; // Break the each loop
        }
      }).then(() => {
        if (cameraToDelete) {
          // Extract camera ID from the row (assuming it's available in the DOM or data attributes)
          // If not directly available, we can use a generic pattern for the intercept
          
          // Intercept the DELETE request and return an error
          cy.intercept('DELETE', '**/api/Camera/*', {
            statusCode: 500,
            body: {
              flag: false,
              message: "Server error occurred during deletion"
            }
          }).as('deleteRequest');
          
          // Click the delete button
          cy.wrap(cameraToDelete).find('[aria-label="delete"]').click({force: true});
          
          // Verify the confirmation dialog appears
          cy.get(".swal2-container").should("be.visible");
          cy.get(".swal2-confirm").click({force: true});
          
          // Wait for the intercepted request
          cy.wait('@deleteRequest');
          
          // Verify error message appears
          cy.get(".swal2-container").should("be.visible");
          cy.get(".swal2-title").should("contain", "Error");
          cy.get(".swal2-html-container").should("contain", "Server error occurred during deletion");
          cy.get(".swal2-confirm").click({force: true});
        } else {
          // If no Free camera found, log a message
          cy.log("No camera with Free status found to test error handling");
        }
      });
    });
  
    it("should delete a camera with Under Repair status", () => {
      // Find a camera with Under Repair status to delete
      let cameraToDelete;
      let cameraCode;
      
      cy.get(".MuiDataGrid-row").each(($row) => {
        const $statusCell = $row.find('[data-field="cameraStatus"]');
        if ($statusCell.text().includes("Under Repair")) {
          cameraToDelete = $row;
          cameraCode = $row.find('[data-field="cameraCode"]').text();
          return false; // Break the each loop
        }
      }).then(() => {
        if (cameraToDelete) {
          // Click the delete button
          cy.wrap(cameraToDelete).find('[aria-label="delete"]').click({force: true});
          
          // Verify the confirmation dialog appears
          cy.get(".swal2-container").should("be.visible");
          
          // Confirm deletion
          cy.get(".swal2-confirm").click({force: true});
          
          // Verify success message
          cy.get(".swal2-container").should("be.visible");
          cy.get(".swal2-title").should("contain", "Deleted");
          cy.get(".swal2-confirm").click({force: true});
          
          // Verify the camera is no longer in the table or is marked as deleted
          cy.get(".MuiDataGrid-virtualScrollerRenderZone").then(($table) => {
            if ($table.text().includes(cameraCode)) {
              // If still in table, it should be marked as inactive
              cy.contains(cameraCode)
                .parents(".MuiDataGrid-row")
                .find('[data-field="isDeleted"]')
                .should("contain", "Inactive");
            } else {
              // Or it might be completely removed from the table
              cy.contains(cameraCode).should("not.exist");
            }
          });
        } else {
          // If no Under Repair camera found, log a message
          cy.log("No camera with Under Repair status found to delete");
        }
      });
    });
  
  
  });
  