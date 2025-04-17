describe("Add Camera Tests", () => {
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
  
    it("should successfully add a new camera with Free status", () => {
      // Generate unique camera code
      const uniqueCameraCode = "CAM-TEST-" + Date.now().toString().slice(-6);
      
      // Click the NEW button to open the create modal
      cy.contains("button", "NEW").click();
      
      // Fill in the form fields
      cy.get('input[name="cameraType"]').type("IP Camera");
      cy.get('input[name="cameraCode"]').type(uniqueCameraCode);
      cy.get('input[name="rtspUrl"]').type("rtsp://admin:password@192.168.1.100:554/stream");
      cy.get('input[name="cameraAddress"]').type("Main Entrance");
      
      // Select Free status
      cy.get('[id="cameraStatus"]').click();
      cy.get('[data-value="Free"]').click();
      
      // Submit the form
      cy.contains("button", "Save Camera").click();
      
      // Verify success message
      cy.get(".swal2-container").should("be.visible");
      cy.get(".swal2-title").should("contain", "Success");
      cy.get(".swal2-confirm").click();
      
      // Verify the new camera appears in the table
      cy.get(".MuiDataGrid-virtualScrollerRenderZone .MuiDataGrid-row")
        .should("contain", uniqueCameraCode);
    });
  
    it("should successfully add a new camera with Under Repair status", () => {
      // Generate unique camera code
      const uniqueCameraCode = "CAM-REPAIR-" + Date.now().toString().slice(-6);
      
      // Click the NEW button to open the create modal
      cy.contains("button", "NEW").click();
      
      // Fill in the form fields
      cy.get('input[name="cameraType"]').type("Dome Camera");
      cy.get('input[name="cameraCode"]').type(uniqueCameraCode);
      cy.get('input[name="rtspUrl"]').type("rtsp://admin:password@192.168.1.101:554/stream");
      cy.get('input[name="cameraAddress"]').type("Parking Area");
      
      // Select Under Repair status
      cy.get('[id="cameraStatus"]').click();
      cy.get('[data-value="UnderRepair"]').click();
      
      // Submit the form
      cy.contains("button", "Save Camera").click();
      
      // Verify success message
      cy.get(".swal2-container").should("be.visible");
      cy.get(".swal2-title").should("contain", "Success");
      cy.get(".swal2-confirm").click();
      
      // Verify the new camera appears in the table with Under Repair status
      cy.get(".MuiDataGrid-virtualScrollerRenderZone .MuiDataGrid-row")
        .contains(uniqueCameraCode)
        .parents(".MuiDataGrid-row")
        .find('[data-field="cameraStatus"] .MuiChip-colorWarning')
        .should("be.visible");
    });
  
    it("should validate RTSP URL format", () => {
      // Click the NEW button to open the create modal
      cy.contains("button", "NEW").click();
      
      // Fill in the form fields with invalid RTSP URL
      cy.get('input[name="cameraType"]').type("Test Camera");
      cy.get('input[name="cameraCode"]').type("CAM-INVALID");
      cy.get('input[name="rtspUrl"]').type("invalid-url-format");
      cy.get('input[name="cameraAddress"]').type("Test Location");
      
      // Try to submit the form
      cy.contains("button", "Save Camera").click();
      
      // Verify validation error for RTSP URL
      cy.contains("Invalid RTSP URL format").should("be.visible");
      
      // Fix the RTSP URL
      cy.get('input[name="rtspUrl"]').clear().type("rtsp://admin:pass@192.168.1.102:554/stream");
      
      // Submit the form
      cy.contains("button", "Save Camera").click();
      
      // Verify success message
      cy.get(".swal2-container").should("be.visible");
      cy.get(".swal2-confirm").click();
    });
  
    it("should cancel adding a camera", () => {
      // Click the NEW button to open the create modal
      cy.contains("button", "NEW").click();
      
      // Fill in some form fields
      cy.get('input[name="cameraType"]').type("Cancelled Camera");
      cy.get('input[name="cameraCode"]').type("CAM-CANCEL");
      
      // Click Cancel button
      cy.contains("button", "Cancel").click();
      
      // Verify modal is closed
      cy.get(".MuiModal-root").should("not.exist");
      
      // Open modal again to verify form is reset
      cy.contains("button", "NEW").click();
      cy.get('input[name="cameraType"]').should("have.value", "");
      cy.get('input[name="cameraCode"]').should("have.value", "");
      
      // Close modal again
      cy.contains("button", "Cancel").click();
    });
  
    it("should validate all required fields", () => {
      // Click the NEW button to open the create modal
      cy.contains("button", "NEW").click();
      
      // Submit empty form
      cy.contains("button", "Save Camera").click();
      
      // Verify validation errors for all required fields
      cy.contains("Camera type is required").should("be.visible");
      cy.contains("Camera code is required").should("be.visible");
      cy.contains("RTSP URL is required").should("be.visible");
      cy.contains("Address is required").should("be.visible");
      
      // Fill in only one field
      cy.get('input[name="cameraType"]').type("Partial Camera");
      
      // Submit form with missing fields
      cy.contains("button", "Save Camera").click();
      
      // Verify remaining validation errors
      cy.contains("Camera code is required").should("be.visible");
      cy.contains("RTSP URL is required").should("be.visible");
      cy.contains("Address is required").should("be.visible");
      
      // Close modal
      cy.contains("button", "Cancel").click();
    });
  });
  