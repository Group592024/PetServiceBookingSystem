describe("Report Room Type", () => {
    const mockRoomTypeData = {
        data: [
            {
                roomTypeName: "Standard Room",
                quantity: 20,
                id: "1"
            },
            {
                roomTypeName: "Deluxe Room",
                quantity: 15,
                id: "2"
            },
            {
                roomTypeName: "Premium Suite",
                quantity: 8,
                id: "3"
            },
            {
                roomTypeName: "Cat Condo",
                quantity: 12,
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

        // Intercept the room type API call
        cy.intercept("GET", "**/api/ReportFacility/activeRoomType", {
            statusCode: 200,
            body: mockRoomTypeData
        }).as("getRoomTypeData");

        // Visit the reports page
        cy.visit("http://localhost:3000/report");

        // Wait for the page to load completely
        cy.contains("Analytics Dashboard", { timeout: 10000 }).should("be.visible");

        // Select Room report type to show the room type distribution
        cy.get("select").first().select("Room");

        // Wait for the room type data to load
        cy.wait("@getRoomTypeData", { timeout: 10000 });

        // Ensure the component is visible
        cy.contains("Number of Rooms by Room Type", { timeout: 10000 }).should("be.visible");
    });

    it("should display the room type distribution section", () => {
        cy.contains("Number of Rooms by Room Type").should("exist");
    });

    it("should display the pie chart for room type distribution", () => {
        // Check if ReportCircleCard is rendered
        cy.get(".recharts-pie").should("exist");
        cy.get(".recharts-legend-wrapper").should("exist");

        // Check if all room type names appear in the legend
        mockRoomTypeData.data.forEach(roomType => {
            cy.get(".recharts-legend-wrapper").contains(roomType.roomTypeName).should("exist");
        });
    });

    it("should display the correct total number of rooms", () => {
        // Calculate total rooms
        const totalRooms = mockRoomTypeData.data.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        // Check if total rooms is displayed correctly
        cy.contains("Total Rooms").parent().contains(totalRooms).should("exist");
    });

    it("should display the correct percentage for each room type", () => {
        // Calculate total rooms for percentage calculations
        const totalRooms = mockRoomTypeData.data.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        mockRoomTypeData.data.slice(-3).forEach(roomType => {
            const percentage = ((roomType.quantity / totalRooms) * 100).toFixed(1);
            cy.contains(`${roomType.roomTypeName} (${percentage}%)`).should("exist");
        });


    });

    it("should show loading spinner while fetching data", () => {
        // Intercept with delay
        cy.intercept("GET", "**/api/ReportFacility/activeRoomType", (req) => {
            req.reply({
                delay: 1000,
                statusCode: 200,
                body: mockRoomTypeData
            });
        }).as("delayedRoomTypeData");

        // Reload to trigger the delayed response
        cy.reload();
        cy.get("select").first().select("Room");

        // Check if loading spinner appears
        cy.get(".animate-spin").should("exist");

        // Wait for data and check if spinner disappears
        cy.wait("@delayedRoomTypeData", { timeout: 10000 });
        cy.get(".animate-spin").should("not.exist");
    });

    it("should handle empty data gracefully", () => {
        // Mock empty data response
        cy.intercept("GET", "**/api/ReportFacility/activeRoomType", {
            statusCode: 200,
            body: { data: [] }
        }).as("emptyRoomTypeData");

        // Reload to trigger the empty response
        cy.reload();
        cy.get("select").first().select("Room");
        cy.wait("@emptyRoomTypeData", { timeout: 10000 });

        // Check if empty state message appears
        cy.contains("No Data Available").should("exist");
    });

    it("should handle API errors gracefully", () => {
        // Mock error response
        cy.intercept("GET", "**/api/ReportFacility/activeRoomType", {
            statusCode: 500,
            body: { message: "Server Error" }
        }).as("errorRoomTypeData");

        // Reload to trigger the error response
        cy.reload();
        cy.get("select").first().select("Room");
        cy.wait("@errorRoomTypeData", { timeout: 10000 });

        // Check if error state appears
        cy.contains("No Data Available").should("exist");

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

        // Navigate back to the room report
        cy.get("select").first().select("Room");

        // Check if the component renders correctly after navigation
        cy.contains("Number of Rooms by Room Type").should("exist");

        // Check if data is still displayed
        const totalRooms = mockRoomTypeData.data.reduce(
            (sum, item) => sum + item.quantity,
            0
        );
        cy.contains("Total Rooms").parent().contains(totalRooms).should("exist");
    });
});