describe("Update Service", () => {
  const testServiceId = "c3333333-cccc-cccc-cccc-cccccccccccc"; // Example GUID for the service ID
  const testService = {
    serviceTypeId: "f1234567-1234-5678-abcd-1234567890ab", // Example GUID for service type
    serviceName: "Test Service",
    serviceDescription: "This is a test service description.",
    serviceImage:
      "/images/20250225054436918_0b09350e-8cc7-42ba-b31e-41cace1600fd.jpg",
    isDeleted: false,
  };

  beforeEach(() => {
    cy.login(); // Assuming cy.login() logs in and sets up the necessary cookies/tokens

    // Mock the token and service data
    cy.intercept("GET", "http://localhost:5050/api/Service/serviceTypes", {
      statusCode: 200,
      body: {
        data: [
          {
            serviceTypeId: "f1234567-1234-5678-abcd-1234567890ab",
            typeName: "Service Type 1",
          },
        ],
      },
    }).as("getServiceTypes");

    cy.intercept("GET", `http://localhost:5050/api/Service/${testServiceId}`, {
      statusCode: 200,
      body: {
        data: {
          ...testService,
          serviceImage:
            "/images/20250225054436918_0b09350e-8cc7-42ba-b31e-41cace1600fd.jpg", // Assuming image is served via this path
        },
      },
    }).as("getService");

    cy.intercept("PUT", `http://localhost:5050/api/Service/${testServiceId}`, {
      statusCode: 200,
      body: { message: "Service Updated Successfully!" },
    }).as("updateService");
    cy.visit(`http://localhost:3000/service/edit/${testServiceId}`); // Update this path based on your routing

    // Wait for the data to be fetched
    cy.wait("@getServiceTypes"); // Ensures that the service types are loaded
    cy.wait("@getService"); // Waits for the service data to be loaded
  });

  it("should load the service data correctly", () => {
    cy.get('[data-testid="name-input-service"] input').should(
      "have.value",
      testService.serviceName
    );
    cy.get('[data-testid="description-input-service"] textarea').should(
      "have.value",
      testService.serviceDescription
    );
    cy.get('input[name="serviceStatus"]').first().should("be.checked");
    cy.get("img");
  });

  it("should validate required fields and show error messages", () => {
    cy.get('[data-testid="name-input-service"] input').clear(); // Clear service name
    cy.get(
      '[data-testid="description-input-service"] textarea[rows="7"]'
    ).clear(); // Clear description
    cy.get('[data-testid="update-button-service"]').click();

    cy.get('p:contains("Service Name is required.")').should("exist");
    cy.get('p:contains("Service Description is required.")').should("exist");
  });

  it("should update the service data successfully", () => {
    const updatedServiceName = "Updated Service Name";
    const updatedDescription = "Updated service description.";

    cy.get('[data-testid="name-input-service"] input')
      .clear()
      .type(updatedServiceName);
    cy.get('[data-testid="description-input-service"] textarea[rows="7"]')
      .clear()
      .type(updatedDescription);
    cy.get('input[name="serviceStatus"]').last().click(); // Set to Inactive

    cy.get('input[type="file"]').selectFile(
      `cypress/fixtures/images/newImage.jpg`,
      {
        force: true,
      }
    );

    cy.get('[data-testid="update-button-service"]').click();

    cy.get(".swal2-confirm").click();

    cy.wait("@updateService").then((interception) => {
      expect(interception.request.headers["content-type"]).to.include(
        "multipart/form-data"
      );
    });

    cy.get(".swal2-popup").should("contain", "Service Updated Successfully!");
    cy.url().should("include", "/service");
  });

  it("should cancel the update and navigate back to services list", () => {
    cy.get("button").contains("Cancel").click({
      force: true,
    });
    cy.url().should("include", "/service");
  });

  it("should show error when uploading unsupported file type", () => {
    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/images/test-document-dung-xoa.pdf",
      { force: true }
    );

    cy.get(".swal2-popup").should("contain", "Only accept image files!");
  });
});
