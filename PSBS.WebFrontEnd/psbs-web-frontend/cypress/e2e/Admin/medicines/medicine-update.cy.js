describe("Update Medicine E2E Tests", () => {
    const testMedicineName = "Antibiotic A";
    const updatedMedicineName = "Updated Antibiotic";
    const testTreatmentName = "Infection";
    const testMedicineId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
  
    before(() => {
      cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
      
      // Create test fixture files
      cy.writeFile('cypress/fixtures/test-medicine.jpg', 'binary-image-content', 'binary');
      cy.writeFile('cypress/fixtures/updated-medicine.jpg', 'updated-binary-image-content', 'binary');
      cy.writeFile('cypress/fixtures/invalid-file.txt', 'This is not an image file');
    });
  
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
      
      // Mock API responses
      cy.intercept('GET', 'http://localhost:5050/api/Treatment/available', {
        statusCode: 200,
        body: {
          flag: true,
          data: [
            {
              treatmentId: "1",
              treatmentName: testTreatmentName,
              isDeleted: false
            },
            {
              treatmentId: "2",
              treatmentName: "Pain Relief",
              isDeleted: false
            }
          ]
        }
      }).as('getTreatments');
  
      cy.intercept('GET', `http://localhost:5050/Medicines/all-data/${testMedicineId}`, {
        statusCode: 200,
        body: {
          flag: true,
          data: {
            medicineId: testMedicineId,
            medicineName: testMedicineName,
            treatmentId: "1",
            medicineImage: "/images/medicines/test-medicine.jpg",
            medicineStatus: false,
            isDelete: false
          }
        }
      }).as('getMedicineDetail');
  
      // Visit the update page
      cy.visit(`http://localhost:3000/medicines/update/${testMedicineId}`);
      cy.wait('@getTreatments');
      cy.wait('@getMedicineDetail');
    });
  
    afterEach(() => {
      cy.saveLocalStorage();
    });
  
    it("should load medicine details correctly and update successfully", () => {
      // Verify form is pre-filled with existing data
      cy.get('label').contains('Medicine Name').parent().find('input')
        .should('have.value', testMedicineName);
      
      cy.get('label').contains('Treatment For').parent().find('input')
        .should('have.value', testTreatmentName);
      
      cy.get('label').contains('Medicine Status').parent().find('input')
        .should('have.value', 'Active');
  
      // Verify image is loaded
      cy.get('img[alt="Preview"]').should('be.visible');
      cy.get('img[alt="Preview"]').should('have.attr', 'src').and('include', 'test-medicine.jpg');
  
      // Mock the API response for updating medicine
      cy.intercept('PUT', 'http://localhost:5050/Medicines', {
        statusCode: 200,
        body: {
          flag: true,
          message: "Medicine updated successfully",
          data: {
            medicineId: testMedicineId,
            medicineName: updatedMedicineName,
            treatmentId: "1",
            medicineImage: "/images/medicines/updated-medicine.jpg",
            medicineStatus: false,
            isDelete: false
          }
        }
      }).as('updateMedicine');
  
      // Update form fields
      cy.get('label').contains('Medicine Name').parent().find('input')
        .clear().type(updatedMedicineName);
      
      // Select different treatment
      cy.get('label').contains('Treatment For').parent().find('input')
        .clear().type('Pain Relief');
      cy.contains('Pain Relief').click();
  
      // Upload new image
      cy.get('#fileInput').selectFile('cypress/fixtures/updated-medicine.jpg');
      
      // Submit the form
      cy.contains('button', 'Submit').click();
      cy.wait('@updateMedicine');
      
      // Check for success message
      cy.get('.swal2-title').should('contain', 'Success');
      cy.get('.swal2-confirm').click();
      
      // Verify redirect back to medicine list
      cy.url().should('include', '/medicines');
    });
  
    it("should handle validation errors correctly", () => {
      // Clear required fields
      cy.get('label').contains('Medicine Name').parent().find('input').clear();
      cy.get('label').contains('Treatment For').parent().find('input').clear();
      
      // Submit the form
      cy.contains('button', 'Submit').click();
      
      // Check for validation errors
      cy.contains('Medicine Name is required').should('be.visible');
      cy.contains('Please select a valid treatment').should('be.visible');
    });
  
    it("should handle image validation correctly", () => {
      // Try uploading invalid file
      cy.get('#fileInput').selectFile('cypress/fixtures/invalid-file.txt', { force: true });
      
      // Check for validation error
      cy.contains('Please select a valid image file').should('be.visible');
    });
  
    it("should navigate back to list when Cancel button is clicked", () => {
      // Click the Cancel button
      cy.contains('button', 'Cancel').click();
      
      // Verify redirect back to medicine list
      cy.url().should('include', '/medicines');
      cy.url().should('not.include', '/update');
    });
  
    it("should handle API errors gracefully", () => {
      // Mock API to return error
      cy.intercept('PUT', 'http://localhost:5050/Medicines', {
        statusCode: 500,
        body: {
          flag: false,
          message: "Server error occurred"
        }
      }).as('updateMedicineError');
      
      // Make a small change
      cy.get('label').contains('Medicine Name').parent().find('input')
        .clear().type('Error Test Medicine');
      
      // Submit the form
      cy.contains('button', 'Submit').click();
      cy.wait('@updateMedicineError');
      
      // Check for error message
      cy.get('.swal2-title').should('contain', 'Warning');
      cy.get('.swal2-confirm').click();
    });
  
    it("should toggle medicine status correctly", () => {
      // Mock API response for status update
      cy.intercept('PUT', 'http://localhost:5050/Medicines', {
        statusCode: 200,
        body: {
          flag: true,
          message: "Medicine status updated successfully",
          data: {
            medicineId: testMedicineId,
            medicineName: testMedicineName,
            treatmentId: "1",
            medicineImage: "/images/medicines/test-medicine.jpg",
            medicineStatus: true, 
            isDelete: false
          }
        }
      }).as('updateMedicineStatus');
  
      // Change status to Inactive
      cy.get('#medicineStatus').click();
      cy.contains('Inactive').click(); 


      
      // Submit the form
      cy.contains('button', 'Submit').click();
      cy.wait('@updateMedicineStatus');
      
      // Check for success message
      cy.get('.swal2-title').should('contain', 'Success');
      cy.get('.swal2-confirm').click();
      
      // Verify redirect back to medicine list
      cy.url().should('include', '/medicines');
    });
  
    it("should show new image preview when uploading new image", () => {
      // Upload new image
      cy.get('#fileInput').selectFile('cypress/fixtures/updated-medicine.jpg');
      
      // Verify new preview appears
      cy.contains('New Image Preview').should('be.visible');
      cy.get('img[alt="Preview"]').should('be.visible');
    });
  });