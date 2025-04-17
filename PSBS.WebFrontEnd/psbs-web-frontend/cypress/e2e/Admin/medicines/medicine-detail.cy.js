describe("Medicine Detail Page E2E Tests", () => {
    // Test medicine data
    const testMedicineName = "Paracetamol";
    const testTreatmentName = "Pain Relief";
    let testMedicineId = "med123"; // Using a fixed ID for our test medicine
  
    // Custom command for login
    Cypress.Commands.add('loginAsAdmin', () => {
      cy.session('adminLogin', () => {
        cy.visit('http://localhost:3000/login');
        cy.get('#email').type('se.rn.a.vill.ar.es@gmail.com');
        cy.get('#password').type('minh1234');
        cy.get('button[type="submit"]').click();
        cy.url().should('not.include', '/login', { timeout: 10000 });
      });
    });
  
    beforeEach(() => {
      cy.loginAsAdmin();
  
      // Create a stub for the medicine detail API
      cy.intercept('GET', `http://localhost:5050/Medicines/${testMedicineId}`, {
        statusCode: 200,
        body: {
          flag: true,
          message: "Medicine retrieved successfully!",
          data: {
            medicineId: testMedicineId,
            medicineName: testMedicineName,
            treatmentName: testTreatmentName,
            medicineImage: '/images/medicines/paracetamol.jpg',
            isDeleted: false,
            medicineStatus: false // Active status
          }
        }
      }).as('getMedicineDetail');
    });
  
    it("should display medicine details correctly", () => {
      // Visit the medicine detail page
      cy.visit(`http://localhost:3000/medicines/detail/${testMedicineId}`);
      cy.wait('@getMedicineDetail');
  
      // Handle SweetAlert2 success popup
      cy.get('.swal2-confirm').click();
  
      // Verify page title
      cy.contains('Medicine Detail').should('be.visible');
  
      // Verify all form fields have correct values
      
      cy.get('#medicineName').should('have.value', testMedicineName);
      cy.get('#treatmentName').should('have.value', testTreatmentName);
      cy.get('#treatmentStatus').should('have.value', 'Active');
  
      // Verify image is displayed
      cy.get('img[alt="Medicine"]')
        .should('be.visible')
        .and('have.attr', 'src', `http://localhost:5003/images/medicines/paracetamol.jpg`);
    });
  
    it("should navigate back to medicine list when clicking Back to List button", () => {
      // Visit the medicine detail page
      cy.visit(`http://localhost:3000/medicines/detail/${testMedicineId}`);
      cy.wait('@getMedicineDetail');
  
      // Handle SweetAlert2 success popup
      cy.get('.swal2-confirm').click();
  
      // Click the Back to List button
      cy.contains('button', 'Back to List').click();
  
      // Verify navigation to the medicine list page
      cy.url().should('include', '/medicines');
      cy.url().should('not.include', '/detail');
    });
  
    it("should display default image or handle no image scenario", () => {
      // Create a stub for a medicine with no image
      cy.intercept('GET', 'http://localhost:5050/Medicines/no-image-med', {
        statusCode: 200,
        body: {
          flag: true,
          message: "Medicine retrieved successfully!",
          data: {
            medicineId: 'no-image-med',
            medicineName: 'Aspirin',
            treatmentName: 'Headache',
            medicineImage: '',
            isDeleted: false,
            medicineStatus: false
          }
        }
      }).as('medicineWithNoImage');
  
      // Visit the medicine detail page
      cy.visit('http://localhost:3000/medicines/detail/no-image-med');
      cy.wait('@medicineWithNoImage');
  
      // Handle SweetAlert2 success popup
      cy.get('.swal2-confirm').click();
  
      // Depending on how your component handles no image, you might check for:
      // 1. The absence of the <img> tag.
      cy.get('img[alt="Medicine"]').should('not.exist');
      // 2. The presence of a placeholder image or text.
      //    You'll need to adjust the selector based on your implementation.
      // cy.contains('No Image Available').should('be.visible');
    });
  
    it("should handle loading state correctly", () => {
      // Intercept the API call to delay it
      cy.intercept('GET', `http://localhost:5050/Medicines/${testMedicineId}`, (req) => {
        req.on('response', (res) => {
          // Delay the response to show loading state
          res.setDelay(1000);
        });
      }).as('delayedMedicineDetail');
  
      // Visit the medicine detail page
      cy.visit(`http://localhost:3000/medicines/detail/${testMedicineId}`);
  
      // Verify loading spinner is displayed
      cy.get('svg.animate-spin').should('be.visible');
  
      // Wait for data to load
      cy.wait('@delayedMedicineDetail');
  
      // Handle SweetAlert2 success popup
      cy.get('.swal2-confirm').click();
  
      // Verify content is shown after loading and spinner is gone
      cy.contains('Medicine Detail').should('be.visible');
      cy.get('svg.animate-spin').should('not.exist');
    });
  
  
    it("should display 'Inactive' status for inactive medicine", () => {
      // Create a stub for an inactive medicine
      cy.intercept('GET', 'http://localhost:5050/Medicines/inactive-med', {
        statusCode: 200,
        body: {
          flag: true,
          message: "Medicine retrieved successfully!",
          data: {
            medicineId: 'inactive-med',
            medicineName: 'Old Medicine',
            treatmentName: 'Past Treatment',
            medicineImage: '/images/medicines/old.jpg',
            isDeleted: true,
            medicineStatus: true // Inactive status
          }
        }
      }).as('inactiveMedicine');
  
      // Visit the medicine detail page
      cy.visit('http://localhost:3000/medicines/detail/inactive-med');
      cy.wait('@inactiveMedicine');
  
      // Handle SweetAlert2 success popup
      cy.get('.swal2-confirm').click();
  
      // Verify inactive status is shown
      cy.get('#treatmentStatus').should('have.value', 'Inactive');
    });
  });