describe("Report Room History", () => {
    const mockRoomHistoryData = {
        data: [
            {
                roomTypeName: "Standard Room",
                quantity: 25,
                id: "1"
            },
            {
                roomTypeName: "Deluxe Room",
                quantity: 15,
                id: "2"
            },
            {
                roomTypeName: "Premium Suite",
                quantity: 10,
                id: "3"
            },
            {
                roomTypeName: "Cat Condo",
                quantity: 8,
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

        // Intercept the room history API call
        cy.intercept("GET", "**/api/ReportFacility/roomHistory*", {
            statusCode: 200,
            body: mockRoomHistoryData
        }).as("getRoomHistoryData");

        // Visit the reports page
        cy.visit("http://localhost:3000/report");

        // Wait for the page to load completely
        cy.contains("Analytics Dashboard", { timeout: 10000 }).should("be.visible");

        // Select Room report type to show the room history
        cy.get("select").first().select("Room");

        // Wait for the room history data to load
        cy.wait("@getRoomHistoryData", { timeout: 10000 });

        // Ensure the component is visible
        cy.contains("Room Usage History", { timeout: 10000 }).should("be.visible");
    });

    // it("should display the room usage history header", () => {
    //     cy.contains("Room Usage History").should("exist");
    //     cy.contains("Distribution of room usage by type").should("exist");

    //     // Check if the time period text is displayed
    //     const currentYear = new Date().getFullYear();
    //     cy.contains(`Year ${currentYear}`).should("exist");
    // });

    // it("should display the summary metrics correctly", () => {
    //     // Calculate expected values
    //     const totalRoomTypes = mockRoomHistoryData.data.length;
    //     const totalUsageCount = mockRoomHistoryData.data.reduce((sum, item) => sum + item.quantity, 0);
    //     const mostUsedRoom = mockRoomHistoryData.data.sort((a, b) => b.quantity - a.quantity)[0].roomTypeName;
    //     const averageUsage = Math.round(totalUsageCount / totalRoomTypes);

    //     // Check if metrics are displayed correctly
    //     cy.contains("Total Room Types").parent().contains(totalRoomTypes).should("exist");
    //     cy.contains("Total Usage Count").parent().contains(totalUsageCount).should("exist");
    //     cy.contains("Most Used Room Type").parent().contains(mostUsedRoom).should("exist");
    //     cy.contains("Average Usage").parent().contains(averageUsage).should("exist");
    // });

    // it("should display the pie chart for room usage distribution", () => {
    //     // Check if ReportCircleCard is rendered
    //     cy.get(".recharts-pie").should("exist");
    //     cy.get(".recharts-legend-wrapper").should("exist");

    //     // Check if all room type names appear in the legend
    //     mockRoomHistoryData.data.forEach(room => {
    //         cy.get(".recharts-legend-wrapper").contains(room.roomTypeName).should("exist");
    //     });
    // });

    // it("should update data when changing time range to year", () => {
    //     // Mock data for year view
    //     const yearMockData = {
    //         data: [
    //             {
    //                 roomTypeName: "Standard Room",
    //                 quantity: 120,
    //                 id: "1"
    //             },
    //             {
    //                 roomTypeName: "Deluxe Room",
    //                 quantity: 85,
    //                 id: "2"
    //             },
    //             {
    //                 roomTypeName: "Premium Suite",
    //                 quantity: 65,
    //                 id: "3"
    //             }
    //         ]
    //     };

    //     cy.intercept("GET", "**/api/ReportFacility/roomHistory?year=*", {
    //         statusCode: 200,
    //         body: yearMockData
    //     }).as("getYearRoomHistoryData");

    //     // Select year view
    //     cy.contains("By year").parent("select").should("be.visible", { timeout: 10000 });
    //     cy.contains("By year").parent("select").select("year");

    //     // Select a specific year
    //     cy.get("select").contains("2023").parent("select").should("be.visible", { timeout: 10000 });
    //     cy.get("select").contains("2023").parent("select").select("2023");

    //     cy.wait("@getYearRoomHistoryData", { timeout: 10000 });

    //     // Check if the metrics updated
    //     cy.contains("Total Room Types").parent().contains("3").should("exist");
    //     cy.contains("Total Usage Count").parent().contains("270").should("exist");
    //     cy.contains("Most Used Room Type").parent().contains("Standard Room").should("exist");
    //     cy.contains("Average Usage").parent().contains("90").should("exist");
    // });

    // it("should update data when changing time range to month", () => {
    //     // Mock data for month view
    //     const monthMockData = {
    //         data: [
    //             {
    //                 roomTypeName: "Standard Room",
    //                 quantity: 35,
    //                 id: "1"
    //             },
    //             {
    //                 roomTypeName: "Deluxe Room",
    //                 quantity: 22,
    //                 id: "2"
    //             },
    //             {
    //                 roomTypeName: "Premium Suite",
    //                 quantity: 18,
    //                 id: "3"
    //             }
    //         ]
    //     };

    //     cy.intercept("GET", "**/api/ReportFacility/roomHistory?year=*&month=*", {
    //         statusCode: 200,
    //         body: monthMockData
    //     }).as("getMonthRoomHistoryData");

    //     // Select month view
    //     cy.contains("By year").parent("select").should("be.visible", { timeout: 10000 });
    //     cy.contains("By year").parent("select").select("month");

    //     // Select a specific year and month
    //     cy.get("select").contains("2023").parent("select").should("be.visible", { timeout: 10000 });
    //     cy.get("select").contains("2023").parent("select").select("2023");

    //     // Then, select the month
    //     cy.get('select').eq(3).should("be.visible").select("6");

    //     cy.wait("@getMonthRoomHistoryData", { timeout: 10000 });

    //     // Check if the metrics updated
    //     cy.contains("Total Room Types").parent().contains("3").should("exist");
    //     cy.contains("Total Usage Count").parent().contains("75").should("exist");
    //     cy.contains("Most Used Room Type").parent().contains("Standard Room").should("exist");
    //     cy.contains("Average Usage").parent().contains("25").should("exist");
    // });

    // it("should update data when changing time range to specific dates", () => {
    //     // Mock data for date range view
    //     const dateMockData = {
    //         data: [
    //             {
    //                 roomTypeName: "Standard Room",
    //                 quantity: 12,
    //                 id: "1"
    //             },
    //             {
    //                 roomTypeName: "Deluxe Room",
    //                 quantity: 8,
    //                 id: "2"
    //             },
    //             {
    //                 roomTypeName: "Premium Suite",
    //                 quantity: 5,
    //                 id: "3"
    //             }
    //         ]
    //     };

    //     cy.intercept("GET", "**/api/ReportFacility/roomHistory?startDate=*&endDate=*", {
    //         statusCode: 200,
    //         body: dateMockData
    //     }).as("getDateRoomHistoryData");

    //     // Select date range view
    //     cy.contains("By year").parent("select").should("be.visible", { timeout: 10000 });
    //     cy.contains("By year").parent("select").select("day");

    //     // Set date range
    //     const startDate = "2023-06-01";
    //     const endDate = "2023-06-30";

    //     cy.get("input[type='date']").first().should("be.visible", { timeout: 10000 });
    //     cy.get("input[type='date']").first().type(startDate);
    //     cy.get("input[type='date']").last().type(endDate);

    //     cy.wait("@getDateRoomHistoryData", { timeout: 10000 });

    //     // Check if the metrics updated
    //     cy.contains("Total Room Types").parent().contains("3").should("exist");
    //     cy.contains("Total Usage Count").parent().contains("25").should("exist");
    //     cy.contains("Most Used Room Type").parent().contains("Standard Room").should("exist");
    //     cy.contains("Average Usage").parent().contains("8").should("exist");
    // });

    // it("should refresh data when clicking the refresh button", () => {
    //     // Set up a new intercept for the refresh action
    //     const refreshedData = {
    //         data: [
    //             {
    //                 roomTypeName: "Standard Room",
    //                 quantity: 30, // Updated value
    //                 id: "1"
    //             },
    //             {
    //                 roomTypeName: "Deluxe Room",
    //                 quantity: 20, // Updated value
    //                 id: "2"
    //             },
    //             {
    //                 roomTypeName: "Premium Suite",
    //                 quantity: 15, // Updated value
    //                 id: "3"
    //             }
    //         ]
    //     };

    //     cy.intercept("GET", "**/api/ReportFacility/roomHistory*", {
    //         statusCode: 200,
    //         body: refreshedData
    //     }).as("refreshRoomHistoryData");

    //     // Click the refresh button
    //     cy.contains("Refresh").should("exist").click();

    //     // Wait for the refresh data
    //     cy.wait("@refreshRoomHistoryData", { timeout: 10000 });

    //     // Check if the metrics updated
    //     cy.contains("Total Room Types").parent().contains("3").should("exist");
    //     cy.contains("Total Usage Count").parent().contains("65").should("exist");
    //     cy.contains("Most Used Room Type").parent().contains("Standard Room").should("exist");
    //     cy.contains("Average Usage").parent().contains("22").should("exist");
    // });

    // it("should show loading spinner while fetching data", () => {
    //     // Intercept with delay
    //     cy.intercept("GET", "**/api/ReportFacility/roomHistory*", (req) => {
    //         req.reply({
    //             delay: 1000,
    //             statusCode: 200,
    //             body: mockRoomHistoryData
    //         });
    //     }).as("delayedRoomHistoryData");

    //     // Reload to trigger the delayed response
    //     cy.reload();
    //     cy.get("select").first().select("Room");

    //     // Check if loading spinner appears
    //     cy.get(".animate-spin").should("exist");

    //     // Wait for data and check if spinner disappears
    //     cy.wait("@delayedRoomHistoryData", { timeout: 10000 });
    //     cy.get(".animate-spin").should("not.exist");
    // });

    // it("should handle empty data gracefully", () => {
    //     // Mock empty data response
    //     cy.intercept("GET", "**/api/ReportFacility/roomHistory*", {
    //         statusCode: 200,
    //         body: { data: [] }
    //     }).as("emptyRoomHistoryData");

    //     // Reload to trigger the empty response
    //     cy.reload();
    //     cy.get("select").first().select("Room");
    //     cy.wait("@emptyRoomHistoryData", { timeout: 10000 });

    //     // Check if empty state message appears
    //     cy.contains("No Room History Data").should("exist");
    //     cy.contains("There is no room usage data for the selected time period").should("exist");
    // });

    // it("should handle API errors gracefully", () => {
    //     // Mock error response
    //     cy.intercept("GET", "**/api/ReportFacility/roomHistory*", {
    //         statusCode: 500,
    //         body: { message: "Server Error" }
    //     }).as("errorRoomHistoryData");

    //     // Reload to trigger the error response
    //     cy.reload();
    //     cy.get("select").first().select("Room");
    //     cy.wait("@errorRoomHistoryData", { timeout: 10000 });

    //     // Check if error state appears
    //     cy.contains("Error Loading Data").should("exist");
    //     cy.contains("Try Again").should("exist").click();

    //     // Verify that clicking "Try Again" triggers a new request
    //     cy.wait("@errorRoomHistoryData", { timeout: 10000 });
    // });

    it("should display the correct time period text based on selection", () => {
        // Check year view
        cy.contains("By year").parent("select").select("year");
        const currentYear = new Date().getFullYear();
        cy.contains(`Year ${currentYear}`).should("exist");

        // Check month view
        cy.contains("By year").parent("select").select("By month");

        // Then, select the year
        cy.get('select').eq(2).should("be.visible").select(`${currentYear}`);

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const currentMonth = new Date().getMonth();

        // Then, select the month
        cy.get('select').eq(3).should("be.visible").select(currentMonth);
        cy.contains(`${monthNames[currentMonth]} ${currentYear}`).should("exist");

    });

    // it("should have interactive chart elements", () => {
    //     // Check if the chart has interactive elements
    //     cy.get(".recharts-pie-sector").first()
    //         .trigger("mouseover");

    //     // Check if tooltip appears on hover
    //     cy.get(".recharts-tooltip-wrapper").should("exist");
    // });
});