Cypress.Commands.add("login", () => {
  cy.clearLocalStorage();
  cy.clearCookies();

  cy.intercept("POST", "**/api/Account/Login").as("loginRequest");

  cy.visit("http://localhost:3000/login");

  cy.get("#email", { timeout: 10000 }).should("be.visible").type("b@gmail.com");
  cy.get("#password").type("123456");
  cy.get('button[type="submit"]').click();

  cy.wait("@loginRequest", { timeout: 15000 }).then((interception) => {
    expect(interception.response.body).to.have.property("data");
    const token = interception.response.body.data;
    expect(token).to.be.a("string");

    cy.window().then((win) => {
      win.sessionStorage.setItem("token", token);
    });
  });

  cy.url().should("not.include", "/login", { timeout: 10000 });

  cy.window().then((win) => {
    const token = win.sessionStorage.getItem("token");
    expect(token).to.not.be.null;
    expect(token).to.not.be.undefined;
  });
});

describe("Pet Type List", () => {
  beforeEach(() => {
    cy.login();

    cy.intercept("GET", "**/api/PetType", {
      statusCode: 200,
      body: {
        data: [
          {
            petType_ID: "550e8400-e29b-41d4-a716-446655440000",
            petType_Name: "Dog",
            petType_Description: "Domestic dog",
            isDelete: false,
            petType_Image: "/dog-image.jpg",
          },
          {
            petType_ID: "d46a2ff5-8c5c-4d1b-a5f7-2b8fdd65781a",
            petType_Name: "Cat",
            petType_Description: "Domestic cat",
            isDelete: false,
            petType_Image: "/cat-image.jpg",
          },
        ],
      },
    }).as("fetchPetTypes");

    cy.visit("http://localhost:3000/petType");
    cy.wait("@fetchPetTypes"); // Ensure API call finishes
  });

  it("Should load the Pet Type List page", () => {
    cy.contains("Pet Type List");
  });

  it("Should display pet types", () => {
    cy.contains("Dog");
    cy.contains("Cat");
  });

  it("Should navigate to add pet type page", () => {
    cy.get(".report").click();
    cy.url().should("include", "/petType/add");
  });

  it("Should handle delete confirmation", () => {
    cy.intercept(
      "DELETE",
      "**/api/PetType/550e8400-e29b-41d4-a716-446655440000",
      { statusCode: 200 }
    ).as("deletePet");

    cy.get('[data-testid="delete-icon-button"]')
      .first()
      .should("be.visible")
      .click();
    cy.contains("Do you want to delete this item?").should("exist");
    cy.contains("Delete").click();
    cy.wait("@deletePet");
  });

  it("Should navigate to edit pet type page", () => {
    cy.intercept("GET", "**/api/PetType/550e8400-e29b-41d4-a716-446655440000", {
      statusCode: 200,
      body: {
        data: {
          petType_ID: "550e8400-e29b-41d4-a716-446655440000",
          petType_Name: "Dog",
          petType_Description: "Domestic dog",
          isDelete: false,
          petType_Image:
            "/images/20250320052525813_d8dc4fdd-4ec6-4236-bd52-4657b9ebb4ae.jpg",
        },
      },
    }).as("fetchPetTypeDetails");

    cy.get('[data-testid="edit-icon-button"]').first().click();

    cy.url().should(
      "include",
      "/petType/edit/550e8400-e29b-41d4-a716-446655440000"
    );

    cy.wait("@fetchPetTypeDetails");

    cy.get("img").should("be.visible");
    cy.get('[data-testid="petType-description-input"]').should("exist");
    cy.get('[data-testid="petType-isDelete-true"]')
      .should("exist")
      .wait(500)
      .and("not.be.checked");

    cy.get('[data-testid="petType-isDelete-false"]')
      .should("exist")
      .wait(500)
      .and("be.checked");
  });

  it("Should navigate to pet type details page when clicking Info icon", () => {
    cy.intercept("GET", "**/api/PetType/550e8400-e29b-41d4-a716-446655440000", {
      statusCode: 200,
      body: {
        data: {
          petType_ID: "550e8400-e29b-41d4-a716-446655440000",
          petType_Name: "Dog",
          petType_Description: "Domestic dog",
          isDelete: false,
          petType_Image:
            "/images/20250320052525813_d8dc4fdd-4ec6-4236-bd52-4657b9ebb4ae.jpg",
        },
      },
    }).as("fetchPetTypeDetails");
    cy.get('[data-testid="info-icon-button"]').first().click();
    cy.url().should("include", "/petType/550e8400-e29b-41d4-a716-446655440000");

    // Wait for API response
    cy.wait("@fetchPetTypeDetails");

    // Ensure the pet type name and description are displayed
    cy.contains("Dog").should("exist");
    cy.contains("Domestic dog").should("exist");

    cy.get("img").should("be.visible");
  });

  it("Should handle delete error when pet type has pet breed", () => {
    cy.intercept(
      "DELETE",
      "**/api/PetType/550e8400-e29b-41d4-a716-446655440000",
      {
        statusCode: 409,
        body: {
          message: "Can not delete this pet type because it has pet breed",
        },
      }
    ).as("deletePetTypeError");

    cy.get('[data-testid="delete-icon-button"]').first().click();

    // Confirm deletion in SweetAlert2 modal
    cy.get(".swal2-confirm").click();
    cy.wait("@deletePetTypeError");

    cy.contains("Can not delete this pet type because it has pet breed").should(
      "exist"
    );
  });

  it("Should display a message when pet type list is empty", () => {
    cy.intercept("GET", "**/api/PetType", {
      statusCode: 200,
      body: {
        data: [],
      },
    }).as("fetchEmptyPetTypes");

    cy.visit("http://localhost:3000/petType");
    cy.wait("@fetchEmptyPetTypes");

    // Check if DataGrid is empty
    cy.get(".MuiDataGrid-virtualScroller").should("exist");
    cy.contains("No rows").should("exist"); // Default MUI message when no data
  });
});
