describe("Report Booking Page", () => {
  const mockData = {
    staffCount: 5,
    customerCount: 20,
    petCount: 15,
    bookingCount: 30,
    serviceCount: 10,
    roomCount: 8,
  };

  beforeEach(() => {
    cy.login();

    // Intercept all API calls - using more permissive URL patterns
    cy.intercept("GET", "**/api/ReportAccount/countStaff*", {
      statusCode: 200,
      body: { data: Array(mockData.staffCount).fill({}) },
    }).as("getStaffCount");

    cy.intercept("GET", "**/api/ReportAccount/countCustomer*", {
      statusCode: 200,
      body: { data: Array(mockData.customerCount).fill({}) },
    }).as("getCustomerCount");

    cy.intercept("GET", "**/api/Pet*", {
      statusCode: 200,
      body: { data: Array(mockData.petCount).fill({}) },
    }).as("getPets");

    cy.intercept("GET", "**/api/ReportBooking/bookingStatus*", {
      statusCode: 200,
      body: {
        data: [
          {
            bookingStatusName: "Confirmed",
            reportBookings: Array(mockData.bookingCount).fill({}),
          },
        ],
      },
    }).as("getBookings");

    cy.intercept("GET", "**/api/Service*", {
      statusCode: 200,
      body: { data: Array(mockData.serviceCount).fill({}) },
    }).as("getServices");

    cy.intercept("GET", "**/api/ReportFacility/availableRoom*", {
      statusCode: 200,
      body: { data: Array(mockData.roomCount).fill({}) },
    }).as("getRooms");

    // Visit the page and add a timeout to the wait
    cy.visit("http://localhost:3000/report");

    // Wait for each request individually with a timeout
    cy.wait("@getStaffCount", { timeout: 10000 });
    cy.wait("@getCustomerCount", { timeout: 10000 });
    cy.wait("@getPets", { timeout: 10000 });
    cy.wait("@getBookings", { timeout: 10000 });
    cy.wait("@getServices", { timeout: 10000 });
    cy.wait("@getRooms", { timeout: 10000 });
  });

  it("should load the reports page with general report by default", () => {
    cy.contains("Analytics Dashboard");
    cy.contains("General Key Metrics");
    cy.get("select").should("have.value", "General");
  });

  it("should display all metric cards with correct data", () => {
    // Staff Members
    cy.contains("Staff Members")
      .closest("div.shadow-lg") // this wraps the whole card
      .contains(mockData.staffCount);


    // Customers
    cy.contains("Customers").closest("div.shadow-lg").contains(mockData.customerCount);

    // Pets
    cy.contains("Pets").closest("div.shadow-lg").contains(mockData.petCount);

    // Bookings
    cy.contains("Bookings").closest("div.shadow-lg").contains(mockData.bookingCount);

    // Services
    cy.contains("Services").closest("div.shadow-lg").contains(mockData.serviceCount);

    // Available Rooms
    cy.contains("Available Rooms").closest("div.shadow-lg").contains(mockData.roomCount);
  });

  it("should show loading spinner while fetching data", () => {
    // Delay one of the API responses to test loading state
    cy.intercept("GET", "**/api/ReportAccount/countStaff*", (req) => {
      req.reply({
        delay: 1000,
        statusCode: 200,
        body: { data: Array(mockData.staffCount).fill({}) },
      });
    }).as("delayedStaffCount");

    cy.reload();
    cy.get(".animate-spin").should("exist");
    cy.wait("@delayedStaffCount", { timeout: 10000 });
    cy.get(".animate-spin").should("not.exist");
  });

  it("should handle API errors gracefully", () => {
    cy.intercept("GET", "**/api/ReportAccount/countStaff*", {
      statusCode: 500,
      body: { message: "Server Error" },
    }).as("staffCountError");

    cy.reload();
    cy.wait("@staffCountError", { timeout: 10000 });
    cy.contains("Staff Members").closest("div.shadow-lg").contains("0"); // Default value when request fails
  });



  it("should show time range controls when non-general report is selected", () => {
    cy.get("select").select("Booking");

    // Test year selection
    cy.get("select").eq(1).should("contain", "By year");
    cy.get("select").eq(2).should("exist"); // Year dropdown

    // Test month selection
    cy.get("select").eq(1).select("month");
    cy.get("select").eq(2).should("exist"); // Year dropdown
    cy.get("select").eq(3).should("exist"); // Month dropdown

    // Test day selection
    cy.get("select").eq(1).select("day");
    cy.get("input[type='date']").should("have.length", 2);
  });

  it("should update date ranges correctly", () => {
    cy.get("select").select("Booking");
    cy.get("select").eq(1).select("day");

    const startDate = "2024-01-01";
    const endDate = "2024-01-31";

    cy.get("input[type='date']").first().type(startDate);
    cy.get("input[type='date']").last().type(endDate);

    cy.get("input[type='date']").first().should("have.value", startDate);
    cy.get("input[type='date']").last().should("have.value", endDate);
  });
});