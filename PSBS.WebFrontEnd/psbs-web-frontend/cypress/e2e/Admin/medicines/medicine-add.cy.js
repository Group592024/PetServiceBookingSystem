describe("Create Medicine E2E Tests", () => {
    const testMedicineName = "Test Medicine Item";
    const testTreatmentId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
    
    before(() => {
      cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
      // Create test fixture files
      cy.writeFile('cypress/fixtures/test-medicine.jpg', 'binary-image-content', 'binary');
      cy.writeFile('cypress/fixtures/invalid-file.txt', 'This is not an image file');
    });
    
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
      
      // Mock initial API responses
      cy.intercept('GET', 'http://localhost:5050/api/Treatment/available', {
        statusCode: 200,
        body: {
          flag: true,
          data: [
            {
              treatmentId: testTreatmentId,
              treatmentName: "Headache",
              isDeleted: false
            },
            {
              treatmentId: "4fa85f64-5717-4562-b3fc-2c963f66afa7",
              treatmentName: "Fever",
              isDeleted: false
            }
          ]
        }
      }).as('getTreatments');
      
      cy.visit("http://localhost:3000/medicines");
      cy.wait('@getTreatments');
      cy.contains("button", "New").click();
    });
    
    afterEach(() => {
      cy.saveLocalStorage();
    });
    
    after(() => {
    //   cy.deleteMedicine(testMedicineName);
    });
    
    it("should successfully create a new medicine with valid data", () => {
      cy.intercept('POST', 'http://localhost:5050/Medicines', {
        statusCode: 200,
        body: {
          flag: true,
          message: "Medicine added successfully",
          data: {
            medicineId: "5fa85f64-5717-4562-b3fc-2c963f66afa8",
            medicineName: testMedicineName,
            treatmentId: testTreatmentId,
            medicineImage: "/images/medicines/test-medicine.jpg",
            medicineStatus: false,
            isDelete: false
          }
        }
      }).as('createMedicine');
      
      // Fill form
      cy.get('label').contains('Medicine Name').parent().find('input')
        .type(testMedicineName);
      
      cy.get('label').contains('Treatment For').parent().find('input')
        .type('Headache');
      cy.contains('Headache').click();
      
      cy.get('#fileInput').selectFile('cypress/fixtures/test-medicine.jpg');
      cy.get('img[alt="Preview"]').should('be.visible');
      
      // Submit form
      cy.contains("button", "Submit").click();
      cy.wait('@createMedicine');
      
      // Verify success
      cy.get('.swal2-title').should('contain', 'Success');
      cy.get('.swal2-confirm').click();
      cy.url().should("include", "/medicines");
    });
    
    it("should show validation errors for empty form submission", () => {
      cy.contains("button", "Submit").click();
      
      // Verify all required field errors
      cy.contains("Medicine Name is required").should("be.visible");
      cy.contains("Please select a valid treatment").should("be.visible");
      cy.contains("Image is required").should("be.visible");
    });
    
    it("should show error when treatment API fails", () => {
      cy.intercept('GET', 'http://localhost:5050/api/Treatment/available', {
        statusCode: 500,
        body: {
          flag: false,
          message: "Server error"
        }
      }).as('failedTreatments');
      
      // Reload to trigger failed API call
      cy.reload();
      cy.wait('@failedTreatments');
      
      // Verify error toast
      cy.get('.swal2-title').should('contain', 'Warning');
      cy.get('.swal2-confirm').click();
      
      // Verify treatment dropdown is empty
      cy.get('label').contains('Treatment For').parent().find('input').click();
      cy.contains('No options').should('exist');
    });
    
    it("should validate image file type", () => {
      cy.get('#fileInput').selectFile('cypress/fixtures/invalid-file.txt', { force: true });
      cy.contains("Please select a valid image file").should("be.visible");
      cy.get('img[alt="Preview"]').should('not.exist');
    });
    
    it("should handle medicine creation failure", () => {
      cy.intercept('POST', 'http://localhost:5050/Medicines', {
        statusCode: 400,
        body: {
          flag: false,
          message: "Invalid medicine data"
        }
      }).as('failedCreate');
      
      // Fill valid form
      cy.get('label').contains('Medicine Name').parent().find('input')
        .type(testMedicineName);
      cy.get('label').contains('Treatment For').parent().find('input')
        .type('Headache');
      cy.contains('Headache').click();
      cy.get('#fileInput').selectFile('cypress/fixtures/test-medicine.jpg');
      
      // Submit and verify error handling
      cy.contains("button", "Submit").click();
      cy.wait('@failedCreate');
      cy.get('.swal2-title').should('contain', 'Warning');
      cy.get('.swal2-confirm').click();
      
      // Verify form maintains state
      cy.get('label').contains('Medicine Name').parent().find('input')
        .should('have.value', testMedicineName);
      cy.get('label').contains('Treatment For').parent().find('input')
        .should('have.value', 'Headache');
      cy.get('img[alt="Preview"]').should('be.visible');
    });
    
    it("should clear form when Cancel is clicked", () => {
      // Fill some fields
      cy.get('label').contains('Medicine Name').parent().find('input')
        .type("Medicine To Cancel");
      cy.get('label').contains('Treatment For').parent().find('input')
        .type('Headache');
      cy.contains('Headache').click();
      cy.get('#fileInput').selectFile('cypress/fixtures/test-medicine.jpg');
      
      // Click Cancel
      cy.contains("button", "Cancel").click();
      
      // Verify redirect and form reset
      cy.url().should("include", "/medicines");
      cy.url().should("not.include", "/new");
    });
    
    it("should show image preview when valid image is selected", () => {
      cy.get('#fileInput').selectFile('cypress/fixtures/test-medicine.jpg');
      cy.get('img[alt="Preview"]').should('be.visible');
      cy.contains('Image Preview').should('be.visible');
    });
  });