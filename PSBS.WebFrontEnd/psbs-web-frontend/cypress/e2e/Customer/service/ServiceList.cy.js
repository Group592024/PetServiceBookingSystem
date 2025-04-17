describe("Service List Page - Customer View", () => {
  const mockServices = [
    {
      serviceId: "550e8400-e29b-41d4-a716-446655440000",
      serviceName: "Premium Grooming",
      serviceDescription: "Full grooming service with spa treatment",
      serviceType: {
        typeName: "Grooming",
      },
      isDeleted: false,
    },
    {
      serviceId: "d46a2ff5-8c5c-4d1b-a5f7-2b8fdd65781a",
      serviceName: "Vaccination",
      serviceDescription: "Annual vaccination package",
      serviceType: {
        typeName: "Veterinary",
      },
      isDeleted: false,
    },
    {
      serviceId: "3a7b3f5e-9d8c-4a1b-8e3f-2d6c1b4e5a7f",
      serviceName: "Dog Walking",
      serviceDescription: "30-minute professional dog walk",
      serviceType: {
        typeName: "Exercise",
      },
      isDeleted: false,
    },
  ];

  beforeEach(() => {
    // Mock login and API response
    cy.loginCustomer(); // Assuming you have a custom login command
    cy.intercept("GET", "http://localhost:5050/api/Service?showAll=false", {
      statusCode: 200,
      body: {
        data: mockServices,
      },
    }).as("fetchServices");

    cy.visit("http://localhost:3000/customer/services");
    cy.wait("@fetchServices");
  });

  it("should display the page title and banner slider", () => {
    // Verify page title
    cy.contains("Services For Your Pets").should("be.visible");

    cy.get("[data-testid=banner-container]").should("exist");

    // Verify banner navigation dots
    cy.get("button[aria-label^='Go to slide']").should("have.length", 3);
  });

  it("should auto-rotate banners when not hovered", () => {
    // Wait for the first banner to be visible
    cy.contains("Premium Pet Care Services").should("be.visible");

    // Wait for auto-rotation (5 seconds + buffer)
    cy.contains("Luxury Grooming & Spa", { timeout: 7000 }).should(
      "be.visible"
    );
  });

  it("should display all services by default", () => {
    // Verify service names are visible
    mockServices.forEach((service) => {
      cy.contains(service.serviceName).should("be.visible");
    });
  });

  it("should filter services by name", () => {
    // Type in search field
    cy.get("#search-name").type("Premium");

    // Verify only matching services are shown
    cy.get("[data-testid='service-card']").should("have.length", 1);
    cy.contains("Premium Grooming").should("be.visible");
    cy.contains("Vaccination").should("not.exist");

    // Clear search
    cy.get("#search-name").clear();
    cy.get("[data-testid='service-card']").should(
      "have.length",
      mockServices.length
    );
  });

  it("should filter services by type", () => {
    // Select service type from dropdown
    cy.get("#service-type").select("Veterinary");

    // Verify only matching services are shown
    cy.get("[data-testid='service-card']").should("have.length", 1);
    cy.contains("Vaccination").should("be.visible");
    cy.contains("Premium Grooming").should("not.exist");

    // Clear filter
    cy.get("#service-type").select("");
    cy.get("[data-testid='service-card']").should(
      "have.length",
      mockServices.length
    );
  });

  it("should display service categories section", () => {
    // Scroll to categories section (if needed)
    cy.get("h3").contains("Our Service Types").scrollIntoView();

    // Verify categories are displayed
    cy.contains("Grooming").should("be.visible");
    cy.contains("Veterinary").should("be.visible");
    cy.contains("Exercise").should("be.visible");

    // Verify category counts
    cy.contains("1 services available").should("have.length.at.least", 1); // Each type has 1 service in our mock
  });

  it("should display loading state while fetching services", () => {
    // Override the mock with a delayed response
    cy.intercept(
      "GET",
      "http://localhost:5050/api/Service?showAll=false",
      (req) => {
        req.reply({
          delay: 1000,
          statusCode: 200,
          body: { data: mockServices },
        });
      }
    ).as("delayedFetch");

    cy.reload();

    // Verify loading spinner is shown
    cy.contains("Loading services...").should("be.visible");
    cy.wait("@delayedFetch");

    // Verify services appear after loading
    cy.get("[data-testid='service-card']").should(
      "have.length",
      mockServices.length
    );
  });

  it("should display error message when services fail to load", () => {
    // Override the mock with an error response
    cy.intercept("GET", "http://localhost:5050/api/Service?showAll=false", {
      statusCode: 500,
      body: { message: "Server error" },
    }).as("failedFetch");

    cy.reload();

    // Verify error message
    cy.contains("Error Loading Services").should("be.visible");
    cy.contains("Failed to load services. Please try again.").should(
      "be.visible"
    );

    // Verify retry button
    cy.contains("Try Again").should("be.visible");

    // Reset mock for subsequent tests
    cy.intercept("GET", "http://localhost:5050/api/Service?showAll=false", {
      statusCode: 200,
      body: { data: mockServices },
    }).as("fetchServices");

    // Test retry functionality
    cy.contains("Try Again").click();
    cy.wait("@fetchServices");
    cy.get("[data-testid='service-card']").should(
      "have.length",
      mockServices.length
    );
  });

  it("should display empty state when no services match filters", () => {
    // Apply filters that won't match any services
    cy.get("#search-name").type("Nonexistent Service");

    // Verify empty state
    cy.contains("No Services Found").should("be.visible");
    cy.contains(
      "We couldn't find any services matching your search criteria"
    ).should("be.visible");
    cy.contains("View All Services").should("be.visible");

    // Test reset functionality
    cy.contains("View All Services").click();
    cy.get("[data-testid='service-card']").should(
      "have.length",
      mockServices.length
    );
  });
});
