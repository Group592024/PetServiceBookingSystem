describe("Update Pet Type", () => {
  const petTypeId = "550e8400-e29b-41d4-a716-446655440000";

  beforeEach(() => {
    cy.login();

    cy.intercept("GET", `**/api/PetType/${petTypeId}`, {
      statusCode: 200,
      body: {
        data: {
          petType_ID: petTypeId,
          petType_Name: "Dog",
          petType_Description: "Domestic dog",
          isDelete: false,
          petType_Image:
            "/images/20250320052525813_d8dc4fdd-4ec6-4236-bd52-4657b9ebb4ae.jpg",
        },
      },
    }).as("fetchPetType");

    cy.visit(`http://localhost:3000/petType/edit/${petTypeId}`);
    cy.wait("@fetchPetType");
  });

  it("Should load and display pet type data", () => {
    cy.get('[data-testid="petType-name-input"] input').should(
      "have.value",
      "Dog"
    );
    cy.get('[data-testid="petType-description-input"] textarea').should(
      "have.value",
      "Domestic dog"
    );
    cy.get("img").should("be.visible");
  });

  it("Should update pet type and submit the form", () => {
    cy.intercept("PUT", `**/api/PetType/${petTypeId}`, {
      statusCode: 200,
      body: {
        message: "Pet Type Updated Successfully",
      },
    }).as("updatePetType");

    cy.get('[data-testid="petType-name-input"] input')
      .clear()
      .type("Updated Dog");
    cy.get('[data-testid="petType-description-input"] textarea[rows="7"]')
      .clear()
      .type("Updated dog description");

    // Change status
    cy.get('[data-testid="petType-isDelete-true"]').check();

    // Upload image
    const fileName = "sampleImage.png";
    cy.get('input[type="file"]').selectFile(
      `cypress/fixtures/images/${fileName}`,
      {
        force: true,
      }
    );

    // Submit
    cy.contains("button", "Save").click();

    cy.wait("@updatePetType");

    // Redirect assertion
    cy.url().should("include", "/petType");
  });

  it("Should show validation errors when fields are empty", () => {
    cy.get('input[type="text"]').clear();
    cy.get('[data-testid="petType-description-input"]').clear();

    cy.contains("button", "Save").click();

    cy.contains("Pet Type Name is required.").should("exist");
    cy.contains("Pet Type Description is required.").should("exist");
  });

  it("Should not accept invalid file formats", () => {
    const invalidFile = "test-document-dung-xoa.pdf";
    cy.get('input[type="file"]').selectFile(
      `cypress/fixtures/images/${invalidFile}`,
      {
        force: true,
      }
    );

    cy.contains("Only accept image files!").should("exist");
  });

  it("Should cancel and navigate back to list", () => {
    cy.get("button").contains("Cancel").click({ force: true });
    cy.url().should("include", "/petType");
  });
});
