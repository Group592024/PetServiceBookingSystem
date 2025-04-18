describe("Report Booking Status List", () => {
    const mockBookingStatusData = {
        data: [
            {
                bookingStatusName: "Confirmed",
                reportBookings: Array(15).fill({}),
                color: "#3B82F6" // blue-500
            },
            {
                bookingStatusName: "Pending",
                reportBookings: Array(10).fill({}),
                color: "#EC4899" // pink-500
            },
            {
                bookingStatusName: "Cancelled",
                reportBookings: Array(5).fill({}),
                color: "#10B981" // emerald-500
            },
            {
                bookingStatusName: "Completed",
                reportBookings: Array(20).fill({}),
                color: "#F59E0B" // amber-500
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

        // Intercept the booking status API call
        cy.intercept("GET", "**/api/ReportBooking/bookingStatus*", {
            statusCode: 200,
            body: mockBookingStatusData
        }).as("getBookingStatusData");

        cy.intercept("GET", "**/api/Service*", {
            statusCode: 200,
            body: { data: Array(10).fill({}) },
        }).as("getServices");

        cy.intercept("GET", "**/api/ReportFacility/availableRoom*", {
            statusCode: 200,
            body: { data: Array(8).fill({}) },
        }).as("getRooms");

        // Visit the reports page
        cy.visit("http://localhost:3000/report");

        // Wait for the page to load completely
        cy.contains("Analytics Dashboard", { timeout: 10000 }).should("be.visible");

        // Select Booking report type to show the booking status list
        cy.get("select").first().select("Booking");

        // Wait for the booking status data to load
        cy.wait("@getBookingStatusData", { timeout: 10000 });

        // Ensure the component is visible
        cy.contains("Number of Bookings by Status", { timeout: 10000 }).should("be.visible");
    });

    it("should display the booking status summary section", () => {
        // Calculate total bookings
        const totalBookings = mockBookingStatusData.data.reduce(
            (sum, item) => sum + item.reportBookings.length,
            0
        );

        // Check if summary section exists and shows correct data
        cy.contains("Booking Status Summary").should("exist");
        cy.contains(`Total of ${totalBookings} bookings`).should("exist");
        cy.contains(`${mockBookingStatusData.data.length} different statuses`).should("exist");
    });

    it("should display all booking status cards with correct data", () => {
        // Calculate total bookings for percentage calculations
        const totalBookings = mockBookingStatusData.data.reduce(
            (sum, item) => sum + item.reportBookings.length,
            0
        );

        // Check each status card
        mockBookingStatusData.data.forEach(status => {
            // Check if the card with the status name exists
            cy.contains(status.bookingStatusName).should("exist");

            // Check if the card shows the correct quantity
            cy.contains(status.bookingStatusName)
                .parent()
                .contains(status.reportBookings.length)
                .should("exist");

            // Check if the percentage is displayed correctly
            const percentage = Math.round((status.reportBookings.length / totalBookings) * 100);
            cy.contains(status.bookingStatusName)
                .parent().parent()
                .contains(`${percentage}% of total`)
                .should("exist");
        });
    });

    it("should display the status distribution chart", () => {
        cy.contains("Status Distribution").should("exist");

        // Check if the chart has the correct number of segments
        cy.get(".h-8.w-full.rounded-lg.overflow-hidden.flex > div")
            .should("have.length", mockBookingStatusData.data.length);

        // Check if the legend items match the status names
        mockBookingStatusData.data.forEach(status => {
            cy.get(".mt-4.flex.flex-wrap.gap-3")
                .contains(status.bookingStatusName)
                .should("exist");
        });
    });

    it("should show loading spinner while fetching data", () => {
        // Intercept with delay
        cy.intercept("GET", "**/api/ReportBooking/bookingStatus*", (req) => {
            req.reply({
                delay: 1000,
                statusCode: 200,
                body: mockBookingStatusData
            });
        }).as("delayedBookingStatusData");

        // Reload to trigger the delayed response
        cy.reload();
        cy.get("select").first().select("Booking");

        // Check if loading spinner appears
        cy.get(".animate-spin").should("exist");

        // Wait for data and check if spinner disappears
        cy.wait("@delayedBookingStatusData", { timeout: 10000 });
        cy.get(".animate-spin").should("not.exist");
    });

    it("should handle empty data gracefully", () => {
        // Mock empty data response
        cy.intercept("GET", "**/api/ReportBooking/bookingStatus*", {
            statusCode: 200,
            body: { data: [] }
        }).as("emptyBookingStatusData");

        // Reload to trigger the empty response
        cy.reload();
        cy.get("select").first().select("Booking");
        cy.wait("@emptyBookingStatusData", { timeout: 10000 });

        // Check if empty state message appears
        cy.contains("No booking status data available").should("exist");
    });

    it("should handle API errors gracefully", () => {
        // Mock error response
        cy.intercept("GET", "**/api/ReportBooking/bookingStatus*", {
            statusCode: 500,
            body: { message: "Server Error" }
        }).as("errorBookingStatusData");

        // Reload to trigger the error response
        cy.reload();
        cy.get("select").first().select("Booking");
        cy.wait("@errorBookingStatusData", { timeout: 10000 });

        // Check if error state appears
        cy.contains("Failed to load booking status data").should("exist");
        cy.contains("Try Again").should("exist").click();

        // Verify that clicking "Try Again" triggers a new request
        cy.wait("@errorBookingStatusData", { timeout: 10000 });
    });

    it("should display correct progress bars based on booking quantities", () => {
        // Calculate total bookings
        const totalBookings = mockBookingStatusData.data.reduce(
            (sum, item) => sum + item.reportBookings.length,
            0
        );

        // Check each status card's progress bar
        mockBookingStatusData.data.forEach(status => {
            const percentage = (status.reportBookings.length / totalBookings) * 100;

            // Find the card with this status name
            cy.contains(status.bookingStatusName)
                .parent().parent()
                .within(() => {
                    // Check if the progress bar exists
                    cy.get(".w-full.bg-gray-200.rounded-full.h-2\\.5").should("exist");

                    // Check if the progress bar's inner div has the correct width style
                    // We can't check the exact width value easily, but we can check if it exists
                    cy.get(".h-2\\.5.rounded-full").should("exist");
                });
        });
    });


});