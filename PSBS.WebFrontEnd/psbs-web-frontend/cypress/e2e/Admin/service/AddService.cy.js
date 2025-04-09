describe("Add New Service", () => {
  const serviceTypeId = "123e4567-e89b-12d3-a456-426614174000"; // mock GUID
  const newServiceId = "123e4567-e89b-12d3-a456-426614174111"; // mock GUID
  const serviceTypesResponse = {
    data: [
      {
        serviceTypeId: serviceTypeId,
        typeName: "Grooming",
      },
    ],
  };

  beforeEach(() => {
    cy.login(); // ensure you have a custom Cypress command for login

    cy.intercept("GET", "**/api/Service/serviceTypes", {
      statusCode: 200,
      body: serviceTypesResponse,
    }).as("getServiceTypes");

    cy.visit("http://localhost:3000/service/add");
    cy.wait("@getServiceTypes");
  });

  it("Should render form correctly with default values", () => {
    cy.get('input[type="text"]').should("exist");
    cy.get("textarea").should("exist");
    cy.get("img").should("be.visible");
    cy.get("button").contains("Save").should("be.visible");
  });

  it("Should show validation errors if fields are empty", () => {
    cy.get('[data-testid="save-button-service"]').click();

    cy.contains("Service Name is required.").should("exist");
    cy.contains("Service Description is required.").should("exist");
  });

  it("Should not accept invalid file formats", () => {
    cy.get('[data-testid="image-button-service"]').click(); // open file input
    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/images/test-document-dung-xoa.pdf",
      {
        force: true,
      }
    );

    cy.contains("Only accept image files!").should("exist");
  });

  it("Should submit valid form and show success modal", () => {
    // Intercept POST for service
    cy.intercept("POST", "**/api/Service", {
      statusCode: 200,
      body: {
        data: {
          serviceId: newServiceId,
        },
      },
    }).as("postService");

    // Fill form
    cy.get('input[type="text"]').first().type("Nail Clipping");
    cy.get('[data-testid="description-textarea-service"]').type(
      "Basic nail clipping for small pets"
    );

    // Upload image
    cy.get('[data-testid="image-button-service"]').click();
    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/images/sampleImage.png",
      {
        force: true,
      }
    );

    // Submit form
    cy.get('[data-testid="save-button-service"]').click();
    cy.wait("@postService");

    // Wait for SweetAlert2 success message to appear and then disappear
    cy.get(".swal2-popup").should("be.visible");
    cy.get(".swal2-confirm").click();

    // Now assert modal is visible
    cy.get('[data-testid="add-variant-modal"]').should("be.visible");
  });

  it("Should cancel form and go back to list", () => {
    cy.contains("button", "Cancel").click({ force: true });
    cy.url().should("include", "/service");
  });
});
