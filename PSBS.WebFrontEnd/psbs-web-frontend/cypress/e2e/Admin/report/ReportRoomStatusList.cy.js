describe("Report Room Status List", () => {
    const mockRoomStatusData = {
        data: [
            {
                status: "Available",
                quantity: 25,
                color: "#B39CD0" // Purple
            },
            {
                status: "Occupied",
                quantity: 15,
                color: "#F48FB1" // Pink
            },
            {
                status: "Maintenance",
                quantity: 8,
                color: "#FFB74D" // Orange
            },
            {
                status: "Cleaning",
                quantity: 12,
                color: "#90CAF9" // Blue
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

        // Intercept the room status API call
        cy.intercept("GET", "**/api/ReportFacility/roomStatus", {
            statusCode: 200,
            body: mockRoomStatusData
        }).as("getRoomStatusData");

        // Visit the reports page
        cy.visit("http://localhost:3000/report");

        // Wait for the page to load completely
        cy.contains("Analytics Dashboard", { timeout: 10000 }).should("be.visible");

        // Select Room report type to show the room status list
        cy.get("select").first().select("Room");

        // Wait for the room status data to load
        cy.wait("@getRoomStatusData", { timeout: 10000 });

        // Ensure the component is visible
        cy.contains("Room Status Overview", { timeout: 10000 }).should("be.visible");
    });

    it("should display the room status overview header", () => {
        cy.contains("Room Status Overview").should("exist");
        cy.contains("Current status of all rooms in the system").should("exist");
    });

    it("should display the refresh data button", () => {
        cy.contains("Refresh Data").should("exist");
    });

    it("should display summary stats correctly", () => {
        // Calculate expected values
        const totalRooms = mockRoomStatusData.data.reduce((sum, item) => sum + item.quantity, 0);
        const statusCategories = mockRoomStatusData.data.length;
        const mostCommonStatus = mockRoomStatusData.data.sort((a, b) => b.quantity - a.quantity)[0].status;

        // Check if summary stats are displayed correctly
        cy.contains("p", "Total rooms")
            .parent() // gets the div that wraps both <p>s
            .within(() => {
                cy.contains(totalRooms).should("exist");
            });

        cy.contains("Status Categories").parent().contains(statusCategories).should("exist");
        cy.contains("Most Common Status").parent().contains(mostCommonStatus).should("exist");
        cy.contains("Last Updated").parent().contains(new Date().toLocaleDateString()).should("exist");
    });

    it("should display all room status cards with correct data", () => {
        // Calculate total rooms for percentage calculations
        const totalRooms = mockRoomStatusData.data.reduce((sum, item) => sum + item.quantity, 0);

        // Check each status card
        mockRoomStatusData.data.forEach(status => {
            // Check if the card with the status name exists
            cy.contains(status.status).should("exist");

            // Check if the card shows the correct quantity
            cy.contains(status.status)
                .parent().parent()
                .contains(status.quantity)
                .should("exist");

        });
    });

    it("should refresh data when clicking the refresh button", () => {
        // Set up a new intercept for the refresh action
        const refreshedData = {
            data: [
                {
                    status: "Available",
                    quantity: 30, // Updated value
                    color: "#B39CD0" // Purple
                },
                {
                    status: "Occupied",
                    quantity: 20, // Updated value
                    color: "#F48FB1" // Pink
                },
                {
                    status: "Maintenance",
                    quantity: 5, // Updated value
                    color: "#FFB74D" // Orange
                }
            ]
        };

        cy.intercept("GET", "**/api/ReportFacility/roomStatus", {
            statusCode: 200,
            body: refreshedData
        }).as("refreshRoomStatusData");

        // Click the refresh button
        cy.contains("Refresh Data").click();

        // Wait for the refresh data
        cy.wait("@refreshRoomStatusData", { timeout: 10000 });

        // Calculate new total
        const newTotal = refreshedData.data.reduce((sum, item) => sum + item.quantity, 0);

        // Check if the data was updated
        cy.contains("Total rooms").parent().contains(newTotal).should("exist");

    });

    it("should show loading spinner while fetching data", () => {
        // Intercept with delay
        cy.intercept("GET", "**/api/ReportFacility/roomStatus", (req) => {
            req.reply({
                delay: 1000,
                statusCode: 200,
                body: mockRoomStatusData
            });
        }).as("delayedRoomStatusData");

        // Reload to trigger the delayed response
        cy.reload();
        cy.get("select").first().select("Room");

        // Check if loading spinner appears
        cy.get(".animate-spin").should("exist");

        // Wait for data and check if spinner disappears
        cy.wait("@delayedRoomStatusData", { timeout: 10000 });
        cy.get(".animate-spin").should("not.exist");
    });

    it("should handle empty data gracefully", () => {
        // Mock empty data response
        cy.intercept("GET", "**/api/ReportFacility/roomStatus", {
            statusCode: 200,
            body: { data: [] }
        }).as("emptyRoomStatusData");

        // Reload to trigger the empty response
        cy.reload();
        cy.get("select").first().select("Room");
        cy.wait("@emptyRoomStatusData", { timeout: 10000 });

        // Check if empty state message appears
        cy.contains("No Room Status Data").should("exist");
        cy.contains("There is no room status data available").should("exist");
    });

    it("should handle API errors gracefully", () => {
        // Mock error response
        cy.intercept("GET", "**/api/ReportFacility/roomStatus", {
            statusCode: 500,
            body: { message: "Server Error" }
        }).as("errorRoomStatusData");

        // Reload to trigger the error response
        cy.reload();
        cy.get("select").first().select("Room");
        cy.wait("@errorRoomStatusData", { timeout: 10000 });

        // Check if error state appears
        cy.contains("Error Loading Data").should("exist");
        cy.contains("Try Again").should("exist").click();

        // Verify that clicking "Try Again" triggers a new request
        cy.wait("@errorRoomStatusData", { timeout: 10000 });
    });



    it("should display the animation effects when loading", () => {
        // Reload the page to see the animation
        cy.reload();
        cy.get("select").first().select("Room");

        // Check if the animation container exists
        cy.get(".grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4.gap-4")
            .should("exist");
    });

    it("should maintain state after navigation and return", () => {
        // Navigate away from the page
        cy.contains("Analytics Dashboard").click();

        // Navigate back to the room report
        cy.get("select").first().select("Room");

        // Check if the component renders correctly after navigation
        cy.contains("Room Status Overview").should("exist");

        // Check if data is still displayed
        const totalRooms = mockRoomStatusData.data.reduce((sum, item) => sum + item.quantity, 0);
        cy.contains("Total rooms").parent().contains(totalRooms).should("exist");
    });
});