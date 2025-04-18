describe("Report Service Type", () => {
    const mockServiceTypeData = {
        data: [
            {
                roomTypeName: "Grooming",
                quantity: 18,
                id: "1"
            },
            {
                roomTypeName: "Boarding",
                quantity: 12,
                id: "2"
            },
            {
                roomTypeName: "Veterinary Care",
                quantity: 8,
                id: "3"
            },
            {
                roomTypeName: "Training",
                quantity: 6,
                id: "4"
            }
        ]
    };

    beforeEach(() => {
        cy.login();

        // Intercept API calls that happen on page load
        cy.intercept("GET", "**/api/ReportAccount/countStaff*", {
            statusCode: 200,
            body: { data: Array(5).fill({}) },
        }).as("getStaffCount");

        cy.intercept("GET", "**/api/ReportAccount/countCustomer*", {
            statusCode: 200,
            body: { data: Array(20).fill({}) },
        }).as("getCustomerCount");

        cy.intercept("GET", "**/api/Pet*", {
            statusCode: 200,
            body: { data: Array(15).fill({}) },
        }).as("getPets");

        cy.intercept("GET", "**/api/ReportBooking/bookingStatus*", {
            statusCode: 200,
            body: {
                data: [
                    {
                        bookingStatusName: "Confirmed",
                        reportBookings: Array(30).fill({}),
                    },
                ],
            },
        }).as("getBookings");

        cy.intercept("GET", "**/api/Service*", {
            statusCode: 200,
            body: { data: Array(10).fill({}) },
        }).as("getServices");

        cy.intercept("GET", "**/api/ReportFacility/availableRoom*", {
            statusCode: 200,
            body: { data: Array(8).fill({}) },
        }).as("getRooms");

        // Intercept the service type API call
        cy.intercept("GET", "**/api/ReportFacility/activeServiceType", {
            statusCode: 200,
            body: mockServiceTypeData
        }).as("getServiceTypeData");

        // Visit the reports page
        cy.visit("http://localhost:3000/report");

        // Wait for the page to load completely
        cy.contains("Analytics Dashboard", { timeout: 10000 }).should("be.visible");

        // Select Service report type to show the service type distribution
        cy.get("select").first().select("Service");

        // Wait for the service type data to load
        cy.wait("@getServiceTypeData", { timeout: 10000 });

        // Ensure the component is visible
        cy.contains("Service Type Distribution", { timeout: 10000 }).should("be.visible");
    });

    it("should display the service type distribution header", () => {
        cy.contains("Service Type Distribution").should("exist");
    });

    it("should display total services count correctly", () => {
        // Calculate total services
        const totalServices = mockServiceTypeData.data.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        // Check if total services is displayed correctly
        cy.contains("Total Services").parent().contains(totalServices).should("exist");
    });

    it("should display the number of service types correctly", () => {
        // Check if the number of service types is displayed correctly
        cy.contains("Total Service Types").parent().contains(mockServiceTypeData.data.length).should("exist");
    });

    it("should display the pie chart for service type distribution", () => {
        // Check if ReportCircleCard is rendered
        cy.get(".recharts-pie").should("exist");
        cy.get(".recharts-legend-wrapper").should("exist");

        // Check if all service type names appear in the legend
        mockServiceTypeData.data.forEach(serviceType => {
            cy.get(".recharts-legend-wrapper").contains(serviceType.roomTypeName).should("exist");
        });
    });

    it("should refresh data when clicking the refresh button", () => {
        // Set up a new intercept for the refresh action
        const refreshedData = {
            data: [
                {
                    roomTypeName: "Grooming",
                    quantity: 20, // Updated value
                    id: "1"
                },
                {
                    roomTypeName: "Boarding",
                    quantity: 15, // Updated value
                    id: "2"
                },
                {
                    roomTypeName: "Veterinary Care",
                    quantity: 10, // Updated value
                    id: "3"
                }
            ]
        };

        cy.intercept("GET", "**/api/ReportFacility/activeServiceType", {
            statusCode: 200,
            body: refreshedData
        }).as("refreshServiceTypeData");

        // Click the refresh button
        cy.contains("Refresh").should("exist").click();

        // Wait for the refresh data
        cy.wait("@refreshServiceTypeData", { timeout: 10000 });

        // Calculate new total
        const newTotal = refreshedData.data.reduce((sum, item) => sum + item.quantity, 0);

        // Check if the data was updated
        cy.contains("Total Services").parent().contains(newTotal).should("exist");
    });

    it("should show loading spinner while fetching data", () => {
        // Intercept with delay
        cy.intercept("GET", "**/api/ReportFacility/activeServiceType", (req) => {
            req.reply({
                delay: 1000,
                statusCode: 200,
                body: mockServiceTypeData
            });
        }).as("delayedServiceTypeData");

        // Reload to trigger the delayed response
        cy.reload();
        cy.get("select").first().select("Service");

        // Check if loading spinner appears
        cy.get(".animate-spin").should("exist");

        // Wait for data and check if spinner disappears
        cy.wait("@delayedServiceTypeData", { timeout: 10000 });
        cy.get(".animate-spin").should("not.exist");
    });

    it("should handle empty data gracefully", () => {
        // Mock empty data response
        cy.intercept("GET", "**/api/ReportFacility/activeServiceType", {
            statusCode: 200,
            body: { data: [] }
        }).as("emptyServiceTypeData");

        // Reload to trigger the empty response
        cy.reload();
        cy.get("select").first().select("Service");
        cy.wait("@emptyServiceTypeData", { timeout: 10000 });

        // Check if empty state message appears
        cy.contains("No Service Types Found").should("exist");
        cy.contains("There are currently no active service types to display").should("exist");
    });

    it("should handle API errors gracefully", () => {
        // Mock error response
        cy.intercept("GET", "**/api/ReportFacility/activeServiceType", {
            statusCode: 500,
            body: { message: "Server Error" }
        }).as("errorServiceTypeData");

        // Reload to trigger the error response
        cy.reload();
        cy.get("select").first().select("Service");
        cy.wait("@errorServiceTypeData", { timeout: 10000 });

        // Check if error state appears
        cy.contains("Error Loading Data").should("exist");
        cy.contains("Try Again").should("exist").click();

        // Verify that clicking "Try Again" triggers a new request
        cy.wait("@errorServiceTypeData", { timeout: 10000 });
    });

    it("should display the correct service type information in the chart", () => {
        // Check if the chart displays the correct data
        mockServiceTypeData.data.forEach(serviceType => {
            // Check if the service type name is displayed
            cy.contains(serviceType.roomTypeName).should("exist");

            // Check if the quantity is displayed somewhere in the chart or summary
            cy.contains(serviceType.quantity.toString()).should("exist");
        });
    });

    it("should have the correct total services calculation", () => {
        // Calculate total services
        const totalServices = mockServiceTypeData.data.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        // Check if the total is displayed correctly
        cy.contains("Total Services").parent().contains(totalServices).should("exist");
    });

    it("should have interactive chart elements", () => {
        // Check if the chart has interactive elements
        cy.get(".recharts-pie-sector").first()
            .trigger("mouseover");

        // Check if tooltip appears on hover
        cy.get(".recharts-tooltip-wrapper").should("exist");
    });

    it("should maintain state after navigation and return", () => {
        // Navigate away from the page
        cy.contains("Analytics Dashboard").click();

        // Navigate back to the service report
        cy.get("select").first().select("Service");

        // Check if the component renders correctly after navigation
        cy.contains("Service Type Distribution").should("exist");

        // Check if data is still displayed
        const totalServices = mockServiceTypeData.data.reduce(
            (sum, item) => sum + item.quantity,
            0
        );
        cy.contains("Total Services").parent().contains(totalServices).should("exist");
    });
});