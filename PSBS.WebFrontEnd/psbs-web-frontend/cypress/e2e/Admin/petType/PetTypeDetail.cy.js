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

describe("PetTypeDetail Page", () => {
  const mockPetType = {
    petType_ID: "550e8400-e29b-41d4-a716-446655440000",
    petType_Name: "Dog",
    petType_Description: "Friendly domestic dog",
    isDelete: false,
    petType_Image:
      "/images/20250320052525813_d8dc4fdd-4ec6-4236-bd52-4657b9ebb4ae.jpg",
  };

  beforeEach(() => {
    cy.login(); // log in with real API

    cy.intercept("GET", "**/api/PetType/550e8400-e29b-41d4-a716-446655440000", {
      statusCode: 200,
      body: {
        data: mockPetType,
      },
    }).as("getPetTypeDetail");

    cy.visit(
      "http://localhost:3000/petType/550e8400-e29b-41d4-a716-446655440000"
    );
    cy.wait("@getPetTypeDetail");
  });

  it("Should render pet type details correctly", () => {
    cy.contains("Pet Type Detail").should("exist");
    cy.contains(mockPetType.petType_Name).should("exist");
    cy.contains(mockPetType.petType_Description).should("exist");
    cy.get("img");
  });

  it("Should use fallback image if image path is missing", () => {
    cy.intercept("GET", "**/api/PetType/550e8400-e29b-41d4-a716-446655440000", {
      statusCode: 200,
      body: {
        data: {
          ...mockPetType,
          petType_Image: null,
        },
      },
    }).as("getPetTypeNoImage");

    cy.visit("http://localhost:3000/petType/550e8400-e29b-41d4-a716-446655440000");
    cy.wait("@getPetTypeNoImage");

    cy.get("img");
  });

  it("Should handle missing data gracefully", () => {
    cy.intercept("GET", "**/api/PetType/550e8400-e29b-41d4-a716-446655440000", {
      statusCode: 200,
      body: {
        data: null,
      },
    }).as("getPetTypeMissing");

    cy.visit("http://localhost:3000/petType/550e8400-e29b-41d4-a716-446655440000");
    cy.wait("@getPetTypeMissing");

    cy.get("img");
    cy.contains("Pet Type Detail").should("exist");
  });

  it("Should show error in console on fetch failure", () => {
    cy.intercept("GET", "**/api/PetType/550e8400-e29b-41d4-a716-446655440000", {
      statusCode: 500,
    }).as("getPetTypeError");

    cy.visit("http://localhost:3000/petType/550e8400-e29b-41d4-a716-446655440000");
    cy.wait("@getPetTypeError");

    cy.contains("Pet Type Detail").should("exist");
  });
});
