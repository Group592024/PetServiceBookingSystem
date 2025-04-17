describe("Medicine List E2E Tests", () => {
    before(() => {
      // Login before all tests
      cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
    });
  
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
  
      // Mock treatments and medicines API
      cy.intercept('GET', 'http://localhost:5050/api/Treatment/available', {
        statusCode: 200,
        body: {
          flag: true,
          data: [
            { treatmentId: "t1", treatmentName: "Vaccination" },
            { treatmentId: "t2", treatmentName: "Surgery" }
          ]
        }
      }).as('getTreatments');
  
      cy.intercept('GET', 'http://localhost:5050/Medicines/all', {
        statusCode: 200,
        body: {
          flag: true,
          data: [
            {
              id: "1",
              medicineName: "Antibiotic A",
              medicineImg: "/images/meds/antibiotic.jpg",
              treatmentId: "t1",
              isDeleted: false
            },
            {
              id: "2",
              medicineName: "Painkiller B",
              medicineImg: "/images/meds/painkiller.jpg",
              treatmentId: "t2",
              isDeleted: true
            }
          ]
        }
      }).as('getMedicines');
  
      cy.visit("http://localhost:3000/medicines");
      cy.wait('@getTreatments');
      cy.wait('@getMedicines');
    });
  
    afterEach(() => {
      cy.saveLocalStorage();
    });
  
    it("should display the medicine list correctly", () => {
      cy.get(".MuiDataGrid-root").should("exist");
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      cy.contains("button", "New").should("be.visible");
  
      const expectedHeaders = ["ID", "Name", "Treatment", "Active", "Action"];
      cy.get(".MuiDataGrid-columnHeaderTitle").each(($el, index) => {
        cy.wrap($el).should("contain.text", expectedHeaders[index]);
      });
    });
  
    it("should render medicine data correctly", () => {
      cy.get(".MuiDataGrid-row").first().within(() => {
        cy.contains("Antibiotic A").should("exist");
        cy.contains("Vaccination").should("exist");
      });
    });
  
    it("should navigate to create new medicine page on New button click", () => {
      cy.contains("button", "New").click();
      cy.url().should("include", "/medicines/new");
    });
  
    it("should show action buttons for each medicine", () => {
      cy.get(".MuiDataGrid-row").first().within(() => {
        cy.get("[aria-label='info']").should("exist");
        cy.get("[aria-label='edit']").should("exist");
        cy.get("[aria-label='delete']").should("exist");
      });
    });
  
    it("should navigate to medicine detail page on info button click", () => {
      cy.get(".MuiDataGrid-row").first().within(() => {
        cy.get("[aria-label='info']").click();
      });
      cy.url().should("include", "/medicines/detail/");
    });
  
    it("should navigate to medicine update page on edit button click", () => {
      cy.get(".MuiDataGrid-row").first().within(() => {
        cy.get("[aria-label='edit']").click();
      });
      cy.url().should("include", "/medicines/update/");
    });
  
    it("should show confirmation dialog when clicking delete button", () => {
      cy.intercept('DELETE', 'http://localhost:5050/Medicines/*', {
        statusCode: 200,
        body: {
          flag: true,
          message: "Medicine deleted successfully!"
        }
      }).as('deleteMedicine');
  
      cy.get(".MuiDataGrid-row").first().within(() => {
        cy.get("[aria-label='delete']").click();
      });
  
      cy.get(".swal2-popup").should("be.visible");
      cy.get(".swal2-title").should("contain", "Are you sure?");
      cy.get(".swal2-confirm").should("contain", "Yes, delete it!");
      cy.get(".swal2-confirm").click();
      cy.wait('@deleteMedicine');
    });
  });
  