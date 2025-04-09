describe("Service List", () => {
    beforeEach(() => {
      cy.login();
      cy.intercept("GET", "**/api/Service?showAll=true", {
        statusCode: 200,
        body: {
          data: [
            {
              serviceId: "550e8400-e29b-41d4-a716-446655440000",
              serviceName: "Grooming",
              serviceType: {
                typeName: "Pet Care",
              },
              isDeleted: false,
            },
            {
              serviceId: "d46a2ff5-8c5c-4d1b-a5f7-2b8fdd65781a",
              serviceName: "Vaccination",
              serviceType: {
                typeName: "Veterinary",
              },
              isDeleted: true,
            },
          ],
        },
      }).as("fetchServices");
  
      cy.visit("http://localhost:3000/service");
      cy.wait("@fetchServices");
    });
  
    it("Should load the Service List page", () => {
      cy.contains("Service List");
    });
  
    it("Should display service data", () => {
      cy.contains("Grooming");
      cy.contains("Pet Care");
      cy.contains("Vaccination");
      cy.contains("Veterinary");
    });
  
    it("Should navigate to Add Service page", () => {
      cy.get(".report").click();
      cy.url().should("include", "/service/add");
    });
  
    it("Should navigate to Service Details page when clicking Info icon", () => {
      cy.get('[data-testid="info-icon-button"]').first().click();
      cy.url().should("include", "/service/550e8400-e29b-41d4-a716-446655440000");
    });
  
    it("Should navigate to Edit Service page when clicking Edit icon", () => {
      cy.get('[data-testid="edit-icon-button"]').first().click();
      cy.url().should("include", "/service/edit/550e8400-e29b-41d4-a716-446655440000");
    });
  
    it("Should delete a service and display success message", () => {
      cy.intercept("DELETE", "**/api/Service/550e8400-e29b-41d4-a716-446655440000", {
        statusCode: 200,
      }).as("deleteService");
  
      cy.get('[data-testid="delete-icon-button"]').first().click();
      cy.get(".swal2-confirm").click();
      cy.wait("@deleteService");
      cy.contains("Deleted!");
    });
  
    it("Should show error if trying to delete a service with dependency", () => {
      cy.intercept("DELETE", "**/api/Service/550e8400-e29b-41d4-a716-446655440000", {
        statusCode: 409,
        body: {
          message: "Can not delete this service because it has service variant",
        },
      }).as("deleteError");
  
      cy.get('[data-testid="delete-icon-button"]').first().click();
      cy.get(".swal2-confirm").click();
      cy.wait("@deleteError");
      cy.contains("Can not delete this service because it has service variant").should("exist");
    });
  
    it("Should show message when service list is empty", () => {
      cy.intercept("GET", "**/api/Service?showAll=true", {
        statusCode: 200,
        body: {
          data: [],
        },
      }).as("fetchEmptyServices");
  
      cy.visit("http://localhost:3000/service");
      cy.wait("@fetchEmptyServices");
  
      cy.contains("No rows").should("exist");
    });
  });