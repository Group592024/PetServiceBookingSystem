describe("Camera List E2E Tests", () => {
    before(() => {
      // Login once before all tests
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
  
    it("should display the Camera list correctly", () => {
      // Verify table structure
      cy.get(".MuiDataGrid-root").should("exist");
      cy.get(".MuiDataGrid-virtualScrollerRenderZone").should("exist");
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
  
      // Verify UI elements
      cy.get(".datatableTitle")
        .should("contain", "Camera List")
        .and("be.visible");
      cy.contains("button", "NEW").should("be.visible");
  
      // Verify column headers based on the CamList.jsx columns configuration
      const expectedHeaders = [
        "No.",
        "Camera Code",
        "Camera Type",
        "Address",
        "Status",
        "Active",
        "Action"
      ];
      cy.get(".MuiDataGrid-columnHeaderTitle").each(($el, index) => {
        cy.wrap($el).should("contain.text", expectedHeaders[index]);
      });
    });
  
    it("should display the camera list or show empty message", () => {
      cy.get(".MuiDataGrid-root").should("exist");
      
      // Check if the table has any rows
      cy.get("body").then(($body) => {
        if ($body.find(".MuiDataGrid-virtualScrollerRenderZone .MuiDataGrid-row").length > 0) {
          // ✅ Table has rows
          cy.log("Table has data");
          cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
        } else {
          // ❌ Table is empty
          cy.log("Table is empty");
          cy.get(".MuiDataGrid-overlay").should("be.visible");
        }
      });
  
      // Still verify the title and NEW button regardless
      cy.get(".datatableTitle")
        .should("contain", "Camera List")
        .and("be.visible");
      cy.contains("button", "NEW").should("be.visible");
    });
  
   
  
   
  
    it("should show video feed when clicking the visibility button", () => {
      // Wait for the table to load
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      
      // Click on the first visibility button
      cy.get(".MuiDataGrid-row")
        .first()
        .find('[aria-label="push"]')
        .click();
      
      // Verify the video feed modal is displayed - using the specific structure from CameraModal
      cy.get(".MuiModal-root").should("be.visible");
      cy.contains("Live Camera Feed").should("be.visible");
      
      // Check for video element
      cy.get("video").should("exist");
      
      // Close the modal using the close button in the header
      cy.get(".MuiModal-root").find("button").first().click();
    });
  
    it("should open the create camera form when clicking NEW button", () => {
      // Click the NEW button
      cy.contains("button", "NEW").click();
      
      // Verify the create modal is displayed - using the specific structure from CreateCameraModal
      cy.get(".MuiModal-root").should("be.visible");
      cy.contains("Add New Camera").should("be.visible");
      
      // Check for form fields in the create modal
      cy.get('input[name="cameraType"]').should("exist");
      cy.get('input[name="cameraCode"]').should("exist");
      cy.get('input[name="rtspUrl"]').should("exist");
      cy.get('input[name="cameraAddress"]').should("exist");
      
      // Close the modal using the Cancel button
      cy.contains("button", "Cancel").click();
    });
  
    it("should display correct status chips for different camera statuses", () => {
      // Wait for the table to load
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      
      // Check status chips
      cy.get('[data-field="cameraStatus"] .MuiChip-root').each(($chip) => {
        const statusText = $chip.text();
        
        if (statusText.includes("In Use")) {
          cy.wrap($chip).should("have.class", "MuiChip-colorPrimary");
        } else if (statusText.includes("Free")) {
          cy.wrap($chip).should("have.class", "MuiChip-colorInfo");
        } else if (statusText.includes("Discarded")) {
          cy.wrap($chip).should("have.class", "MuiChip-colorDefault");
        } else if (statusText.includes("Under Repair")) {
          cy.wrap($chip).should("have.class", "MuiChip-colorWarning");
        }
      });
    });
  
    it("should display correct active status chips", () => {
      // Wait for the table to load
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      
      // Check active status chips
      cy.get('[data-field="isDeleted"] .MuiChip-root').each(($chip) => {
        const statusText = $chip.text();
        
        if (statusText.includes("Active")) {
          cy.wrap($chip).should("have.class", "MuiChip-colorSuccess");
        } else if (statusText.includes("Inactive")) {
          cy.wrap($chip).should("have.class", "MuiChip-colorError");
        }
      });
    });
  
    it("should have disabled edit and delete buttons for cameras with 'InUse' status", () => {
      // Wait for the table to load
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      
      // Find rows with "In Use" status
      cy.get(".MuiDataGrid-row").each(($row) => {
        const $statusCell = $row.find('[data-field="cameraStatus"]');
        if ($statusCell.text().includes("In Use")) {
          // Check if edit button is disabled (has default color)
          cy.wrap($row)
            .find('[aria-label="edit"] svg')
            .should("have.class", "MuiSvgIcon-colorDefault");
          
          // Check if delete button is disabled (has default color)
          cy.wrap($row)
            .find('[aria-label="delete"] svg')
            .should("have.class", "MuiSvgIcon-colorDefault");
        }
      });
    });
  
    // Additional test for form validation in create camera modal
    it("should validate required fields in create camera form", () => {
      // Click the NEW button
      cy.contains("button", "NEW").click();
      
      // Verify the create modal is displayed
      cy.get(".MuiModal-root").should("be.visible");
      
      // Try to submit the form without filling required fields
      cy.contains("button", "Save Camera").click();
      
      // Check for validation error messages
      cy.contains("Camera type is required").should("be.visible");
      cy.contains("Camera code is required").should("be.visible");
      cy.contains("RTSP URL is required").should("be.visible");
      cy.contains("Address is required").should("be.visible");
      
      // Close the modal
      cy.contains("button", "Cancel").click();
    });
  });
  