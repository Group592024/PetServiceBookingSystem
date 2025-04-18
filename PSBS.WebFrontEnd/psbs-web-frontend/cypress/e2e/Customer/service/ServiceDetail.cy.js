describe("Service Detail Page - Customer View", () => {
  const mockService = {
    serviceId: "550e8400-e29b-41d4-a716-446655440000",
    serviceName: "Premium Grooming",
    serviceDescription: "Full grooming service with spa treatment for your pet",
    serviceImage:
      "/images/20250320110858122_bc8f7623-a555-43c7-af84-168e3d41e48c.jpg",
    serviceType: {
      typeName: "Grooming",
    },
  };

  const mockVariants = [
    {
      serviceVariantId: "1",
      serviceContent: "Basic Grooming Package",
      servicePrice: 500000,
    },
    {
      serviceVariantId: "2",
      serviceContent: "Premium Grooming Package",
      servicePrice: 800000,
    },
    {
      serviceVariantId: "3",
      serviceContent: "Deluxe Spa Package",
      servicePrice: 1200000,
    },
  ];

  beforeEach(() => {
    // Mock login and API responses
    cy.loginCustomer();

    // Mock service details API
    cy.intercept(
      "GET",
      "http://localhost:5050/api/Service/550e8400-e29b-41d4-a716-446655440000",
      {
        statusCode: 200,
        body: { data: mockService },
      }
    ).as("fetchServiceDetails");

    // Mock service variants API
    cy.intercept(
      "GET",
      "http://localhost:5050/api/ServiceVariant/service/550e8400-e29b-41d4-a716-446655440000",
      {
        statusCode: 200,
        body: { data: mockVariants },
      }
    ).as("fetchServiceVariants");

    cy.visit(
      "http://localhost:3000/customer/services/550e8400-e29b-41d4-a716-446655440000"
    );
    cy.wait("@fetchServiceDetails");
    cy.wait("@fetchServiceVariants");
  });

  it("should display the service details correctly", () => {
    // Verify breadcrumb navigation
    cy.contains("Services").should("be.visible");
    cy.contains(mockService.serviceName).should("be.visible");

    // Verify main service details
    cy.contains(mockService.serviceName).should("be.visible");
    cy.contains(mockService.serviceType.typeName).should("be.visible");

    // Verify service image
    cy.get("img").should("have.attr", "src");

    // Verify description section
    cy.contains("Service Description").should("be.visible");
    cy.contains(mockService.serviceDescription).should("be.visible");
  });

  it("should display service variants correctly", () => {
    // Verify variants section
    cy.contains("Available Service Variants").should("be.visible");
    cy.contains(`${mockVariants.length}`).should("be.visible");

    // Verify all variants are displayed
    mockVariants.forEach((variant) => {
      cy.contains(variant.serviceContent).should("be.visible");
      cy.contains(`${variant.servicePrice.toLocaleString()}`).should(
        "be.visible"
      );
    });

    // Verify "Show All" button when there are more than 4 variants
    if (mockVariants.length > 4) {
      cy.contains("Show All").should("be.visible");
    }
  });

  it("should expand/collapse long descriptions", () => {
    if (mockService.serviceDescription.length > 200) {
      // Initially truncated
      cy.contains("...").should("be.visible");
      cy.contains("See More").should("be.visible");

      // Expand
      cy.contains("See More").click();
      cy.contains("See Less").should("be.visible");

      // Collapse
      cy.contains("See Less").click();
      cy.contains("See More").should("be.visible");
    }
  });

  it("should show/hide all variants when clicked", () => {
    if (mockVariants.length > 4) {
      // Initially showing limited variants
      cy.get('[data-testid="variant-card"]').should("have.length", 4);

      // Show all
      cy.contains("Show All").click();
      cy.get('[data-testid="variant-card"]').should(
        "have.length",
        mockVariants.length
      );

      // Show less
      cy.contains("Show Less").click();
      cy.get('[data-testid="variant-card"]').should("have.length", 4);
    }
  });

  it("should display empty state when no variants available", () => {
    // Override variants mock with empty array
    cy.intercept(
      "GET",
      "http://localhost:5050/api/ServiceVariant/service/550e8400-e29b-41d4-a716-446655440000",
      {
        statusCode: 200,
        body: { data: [] },
      }
    ).as("fetchEmptyVariants");

    cy.reload();
    cy.wait("@fetchEmptyVariants");

    cy.contains("No variants available for this service").should("be.visible");
  });

  it("should handle service details loading error", () => {
    // Override with error response
    cy.intercept(
      "GET",
      "http://localhost:5050/api/Service/550e8400-e29b-41d4-a716-446655440000",
      {
        statusCode: 500,
        body: { message: "Server error" },
      }
    ).as("fetchServiceError");

    cy.reload();
    cy.wait("@fetchServiceError");

    cy.get(".swal2-popup").should("be.visible");
    cy.contains(".swal2-title", "Error").should("exist");
    cy.contains(".swal2-html-container", "Service not found").should("exist");
  });

  it("should handle variants loading error", () => {
    // Override with error response
    cy.intercept(
      "GET",
      "http://localhost:5050/api/ServiceVariant/service/550e8400-e29b-41d4-a716-446655440000",
      {
        statusCode: 500,
        body: { message: "Server error" },
      }
    ).as("fetchVariantsError");

    cy.reload();
    cy.wait("@fetchVariantsError");

    // Verify error state
    cy.get(".swal2-popup").should("be.visible");
    cy.contains(".swal2-title", "Error").should("exist");
    cy.contains(".swal2-html-container", "Variant not found").should("exist");
  });

  it("should navigate to booking when Book Now clicked", () => {
    // Mock the booking page or verify navigation
    cy.get("button").contains("Book Now").click();
    // Add your booking page URL verification here
    // cy.url().should('include', '/booking');
  });
});
