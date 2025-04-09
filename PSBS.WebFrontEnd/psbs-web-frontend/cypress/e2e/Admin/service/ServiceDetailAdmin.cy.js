/// <reference types="cypress" />

describe("Service Detail Page", () => {
  const serviceId = "a1b2c3d4-e5f6-7890-abcd-1234567890ab"; // example GUID
  const variantId1 = "a1111111-1111-1111-1111-a11111111111"; // GUID for Small Dog Grooming variant
  const variantId2 = "b2222222-2222-2222-2222-b22222222222"; // GUID for Large Dog Grooming variant

  beforeEach(() => {
    cy.login(); // Assuming you have a custom login function

    // Intercept Service Details API call
    cy.intercept("GET", `**/api/Service/${serviceId}`, {
      statusCode: 200,
      body: {
        data: {
          serviceId: serviceId,
          serviceName: "Basic Grooming",
          serviceDescription: "A gentle wash and tidy up for your pet.",
          isDeleted: false,
          serviceType: {
            typeName: "Grooming",
          },
          serviceImage:
            "/images/20250225054436918_0b09350e-8cc7-42ba-b31e-41cace1600fd.jpg",
        },
      },
    }).as("getServiceDetail");

    // Intercept Service Variants API call with GUID variantIds
    cy.intercept("GET", `**/api/ServiceVariant/service/${serviceId}`, {
      statusCode: 200,
      body: {
        data: [
          {
            serviceVariantId: variantId1, // Use GUID for variantId
            serviceContent: "Small Dog Grooming",
            servicePrice: 25.0,
            isDeleted: false,
          },
          {
            serviceVariantId: variantId2, // Use GUID for variantId
            serviceContent: "Large Dog Grooming",
            servicePrice: 40.0,
            isDeleted: true,
          },
        ],
      },
    }).as("getServiceVariants");

    cy.visit(`http://localhost:3000/service/${serviceId}`);
    cy.wait("@getServiceDetail");
    cy.wait("@getServiceVariants");

    cy.contains("Variants of this service").click();
  });

  it("renders the service detail correctly", () => {
    cy.contains("Service Detail").should("exist");
    cy.contains("Basic Grooming").should("exist");
    cy.contains("Grooming").should("exist");
    cy.contains("Active").should("exist");
    cy.contains("A gentle wash and tidy up for your pet.").should("exist");
  });

  it("shows variant data table with correct rows", () => {
    cy.get(".MuiDataGrid-row").should("have.length", 2);
    cy.contains("Small Dog Grooming").should("exist");
    cy.contains("Large Dog Grooming").should("exist");
  });

  it("opens the Add Variant modal", () => {
    cy.contains("Add variant").click();
    cy.get('[data-testid="add-variant-modal"]').should("exist");
  });

  it("shows action icons in variant table", () => {
    cy.get('[data-testid="info-icon-button"]').should("exist");
    cy.get('[data-testid="edit-icon-button-variant"]').should("exist");
    cy.get('[data-testid="delete-icon-button"]').should("exist");
  });

  it("opens variant detail modal when clicking detail button", () => {
    // Mock the detail API response with GUID
    cy.intercept("GET", `**/api/ServiceVariant/${variantId1}`, {
      statusCode: 200,
      body: {
        data: {
          serviceVariantId: variantId1,
          serviceContent: "Small Dog Grooming",
          servicePrice: 25.0,
          isDeleted: false,
        },
      },
    }).as("getVariantDetail");

    // Click on info (detail) button for the first variant
    cy.get('[data-testid="info-icon-button"]').first().click();

    // Wait for the API call to complete
    cy.wait("@getVariantDetail");

    // Assert modal appears
    cy.get('[data-testid="variant-detail-modal"]').should("exist");

    // Check the content in the modal
    cy.contains("Service Variant Detail").should("exist");
    cy.contains("Small Dog Grooming").should("exist");
    cy.contains("Service Price:")
      .parent() // or `.closest('div')` depending on your DOM
      .find("textarea")
      .should("have.value", "25");

    cy.get("input[type='radio'][value='false']").should("be.checked"); // Active
  });

  it("opens the Update Variant modal", () => {
    cy.get('[data-testid="edit-icon-button-variant"]')
      .should("exist")
      .first()
      .click();
    cy.get('[data-testid="edit-modal-variant"]').should("exist"); // Ensure the modal is open
    cy.contains("h1", "Update Service Variant").should("exist");
  });

  it("clicks variant delete button and confirms", () => {
    cy.intercept("DELETE", `**/api/ServiceVariant/${variantId1}`, {
      statusCode: 200,
    }).as("deleteServiceVariant");

    cy.get('[data-testid="delete-icon-button"]').first().click();

    cy.contains("Are you sure?").should("exist");

    cy.get(".swal2-confirm").should("be.visible").click();

    cy.wait("@deleteServiceVariant");

    cy.contains("Deleted!").should("exist");
  });

  it("shows error when trying to delete variant with existing booking", () => {
    // Intercept the DELETE request and simulate a 409 conflict status code
    cy.intercept("DELETE", `**/api/ServiceVariant/${variantId1}`, {
      statusCode: 409,
      body: {
        message:
          "Cannot delete this service variant because it is in at least one booking.",
      },
    }).as("deleteServiceVariantError");

    cy.get('[data-testid="delete-icon-button"]').first().click();

    cy.contains("Are you sure?").should("exist");

    cy.get(".swal2-confirm").should("be.visible").click();

    cy.wait("@deleteServiceVariantError");

    cy.contains("Error!").should("exist");
    cy.contains(
      "Can not delete this service variant because it is in at least one booking."
    ).should("exist");
  });

  it("adds a new variant successfully", () => {
    cy.intercept("POST", "**/api/ServiceVariant", {
      statusCode: 201,
      body: {
        message: "Service Variant Added Successfully!",
      },
    }).as("addVariant");

    cy.contains("Add variant").click();

    cy.get('[data-testid="add-variant-modal"]').should("exist");

    // Fill in the form
    cy.get('[data-testid="variant-content-input"]').type("Medium Dog Grooming");
    cy.get('[data-testid="variant-price-input"]').type("35");

    cy.get('[data-testid="submit-button-variant"]').click();

    cy.wait("@addVariant");
    cy.get('[data-testid="add-variant-modal"]').should("not.exist");
  });

  it("shows validation errors when adding variant with empty fields", () => {
    cy.contains("Add variant").click();

    cy.get('[data-testid="add-variant-modal"]').should("exist");

    cy.get('[data-testid="submit-button-variant"]').click();

    cy.contains("Service content is required").should("exist");
    cy.contains("Service price is required").should("exist");
  });

  it("updates a variant successfully", () => {
    // Intercept variant detail call (triggered when clicking edit)
    cy.intercept("GET", `**/api/ServiceVariant/${variantId1}`, {
      statusCode: 200,
      body: {
        data: {
          serviceVariantId: variantId1,
          serviceContent: "Small Dog Grooming",
          servicePrice: 25.0,
          isDeleted: false,
        },
      },
    }).as("getVariantDetailForEdit");

    // Intercept the update call
    cy.intercept("PUT", `**/api/ServiceVariant/${variantId1}`, {
      statusCode: 200,
      body: {
        message: "Service Variant Updated Successfully!",
      },
    }).as("updateVariant");

    cy.get('[data-testid="edit-icon-button-variant"]').first().click();

    // Wait for the detail to load before editing
    cy.wait("@getVariantDetailForEdit");

    cy.get('[data-testid="edit-modal-variant"]').should("exist");

    // Fill the updated values
    cy.get('[data-testid="variant-content-input"]')
      .clear()
      .type("Updated Small Dog Grooming");

    cy.get('[data-testid="variant-price-input"]').clear().type("30");

    cy.get('input[type="radio"][value="true"]').check(); // Set to inactive

    cy.get('[data-testid="submit-button-variant"]').click();

    cy.wait("@updateVariant");
    cy.get('[data-testid="edit-modal-variant"]').should("not.exist");
  });

  it("shows validation errors when updating variant with invalid input", () => {
    cy.intercept("GET", `**/api/ServiceVariant/${variantId1}`, {
      statusCode: 200,
      body: {
        data: {
          serviceVariantId: variantId1,
          serviceContent: "Small Dog Grooming",
          servicePrice: 25.0,
          isDeleted: false,
        },
      },
    }).as("getVariantDetailForValidation");

    cy.get('[data-testid="edit-icon-button-variant"]').first().click();
    cy.wait("@getVariantDetailForValidation");

    cy.get('[data-testid="edit-modal-variant"]').should("exist");

    cy.get('[data-testid="variant-content-input"]').clear();
    cy.get('[data-testid="variant-price-input"]').clear();

    cy.get('[data-testid="submit-button-variant"]').click();

    cy.contains("Service content is required.").should("exist");
    cy.contains("Service price is required.").should("exist");
  });
});
