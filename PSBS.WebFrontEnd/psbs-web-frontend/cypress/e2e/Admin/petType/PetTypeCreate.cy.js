import "../../../support/commands.js";

describe("Add Pet Type Page", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("http://localhost:3000/petType/add");
  });

  it("Should render the Add Pet Type form properly", () => {
    cy.contains("Add New Pet Type").should("exist");
    cy.contains("Pet Type Name").should("exist");
    cy.contains("Pet Type Description").should("exist");
    cy.get('button[type="submit"]').should("exist");
  });

  it("Should validate required fields and show alerts", () => {
    cy.get('[data-testid="submit-button"]').first().click();

    cy.contains("Pet Type Name is required.").should("exist");
    cy.contains("Pet Type Description is required.").should("exist");
  });

  it("Should reject unsupported image types", () => {
    const invalidFile = new File(["dummy"], "not-image.txt", {
      type: "text/plain",
    });

    cy.get('input[type="file"]').selectFile(
      {
        contents: invalidFile,
        fileName: "not-image.txt",
      },
      { force: true }
    );

    cy.contains("Only accept image files!").should("exist");
  });

  it("Should allow submission with valid form and image", () => {
    cy.intercept("POST", "**/api/PetType", {
      statusCode: 200,
      body: {},
    }).as("addPetType");

    cy.get('[data-testid="pet-type-file-input"]').selectFile(
      "cypress/fixtures/images/sampleImage.png",
      {
        force: true,
      }
    );

    cy.get('[data-testid="name-input"]').eq(0).type("Turtle");
    cy.get('[data-testid="description-input"]').type("Slow but steady");

    cy.get('[data-testid="submit-button"]').first().click();
    cy.wait("@addPetType");

    cy.contains("Pet Type Added Successfully!").should("exist");
  });

  it("Should show error alert if submission fails", () => {
    cy.intercept("POST", "**/api/PetType", {
      statusCode: 500,
    }).as("addPetTypeFail");

    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/images/sampleImage.png",
      {
        force: true,
      }
    );

    cy.get('[data-testid="name-input"]').eq(0).type("Rabbit");
    cy.get('[data-testid="description-input"]').type("Fast and fluffy");

    cy.get('[data-testid="submit-button"]').first().click();
    cy.wait("@addPetTypeFail");

    cy.contains("Failed To Add Pet Type!").should("exist");
  });

  it("Should navigate back when cancel button is clicked", () => {
    cy.get('[data-testid="cancel-button"]')
      .should("be.visible")
      .click({ force: true });

    cy.url().should("include", "/petType");
  });
});
