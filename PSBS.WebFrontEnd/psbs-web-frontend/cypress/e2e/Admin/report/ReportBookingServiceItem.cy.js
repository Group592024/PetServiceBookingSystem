describe("Report Booking Service Item", () => {
    const mockServiceItemData = {
        data: [
            {
                roomTypeName: "Grooming",
                quantity: 25,
                id: "1"
            },
            {
                roomTypeName: "Boarding",
                quantity: 15,
                id: "2"
            },
            {
                roomTypeName: "Veterinary Care",
                quantity: 10,
                id: "3"
            },
            {
                roomTypeName: "Training",
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

        // Intercept the booking service item API call
        cy.intercept("GET", "**/api/ReportFacility/bookingServiceItem*", {
            statusCode: 200,
            body: mockServiceItemData
        }).as("getServiceItemData");

        // Visit the reports page
        cy.visit("http://localhost:3000/report");

        // Wait for the page to load completely
        cy.contains("Analytics Dashboard", { timeout: 10000 }).should("be.visible");

        // Select Service report type to show the service booking distribution
        cy.get("select").first().select("Service");

        // Wait for the service item data to load
        cy.wait("@getServiceItemData", { timeout: 10000 });

        // Ensure the component is visible
        cy.contains("Service Booking Distribution", { timeout: 10000 }).should("be.visible");
    });

    it("should display the service booking distribution header", () => {
        cy.contains("Service Booking Distribution").should("exist");

        // Check if the time period text is displayed
        const currentYear = new Date().getFullYear();
        cy.contains(`Year ${currentYear}`).should("exist");
    });

    it("should display total bookings count correctly", () => {
        // Calculate total bookings
        const totalBookings = mockServiceItemData.data.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        // Check if total bookings is displayed correctly
        cy.contains("Total Bookings").parent().contains(totalBookings).should("exist");
    });

    it("should display the pie chart for service distribution", () => {
        // Check if ReportCircleCard is rendered
        cy.get(".recharts-pie").should("exist");
        cy.get(".recharts-legend-wrapper").should("exist");

        // Check if all service names appear in the legend
        mockServiceItemData.data.forEach(service => {
            cy.get(".recharts-legend-wrapper").contains(service.roomTypeName).should("exist");
        });
    });

    it("should display the service data table with correct information", () => {
        // Check if the table exists
        cy.get("table").should("exist");

        // Check table headers
        cy.get("thead").contains("Service").should("exist");
        cy.get("thead").contains("Quantity").should("exist");
        cy.get("thead").contains("Percentage").should("exist");

        // Calculate total bookings for percentage calculations
        const totalBookings = mockServiceItemData.data.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        // Check each row in the table
        mockServiceItemData.data.forEach(service => {
            // Find the row containing this service name
            cy.contains("td", service.roomTypeName).parent("tr").within(() => {
                // Check quantity
                cy.contains(service.quantity).should("exist");

                // Check percentage
                const percentage = ((service.quantity / totalBookings) * 100).toFixed(1);
                cy.contains(`${percentage}%`).should("exist");

                // Check progress bar exists
                cy.get(".w-24.bg-gray-200.rounded-full.h-2\\.5").should("exist");
                cy.get(".h-2\\.5.rounded-full").should("exist");
            });
        });
    });

    it("should update data when changing time range to year", () => {
        // Mock data for year view
        const yearMockData = {
            data: [
                {
                    roomTypeName: "Grooming",
                    quantity: 120,
                    id: "1"
                },
                {
                    roomTypeName: "Boarding",
                    quantity: 85,
                    id: "2"
                },
                {
                    roomTypeName: "Veterinary Care",
                    quantity: 65,
                    id: "3"
                }
            ]
        };

        cy.intercept("GET", "**/api/ReportFacility/bookingServiceItem?year=*", {
            statusCode: 200,
            body: yearMockData
        }).as("getYearServiceItemData");

        // Select year view
        cy.contains("By year").parent("select").should("be.visible", { timeout: 10000 });
        cy.contains("By year").parent("select").select("year");

        // Select a specific year
        cy.get("select").contains("2023").parent("select").should("be.visible", { timeout: 10000 });
        cy.get("select").contains("2023").parent("select").select("2023");

        cy.wait("@getYearServiceItemData", { timeout: 10000 });

        // Check if the data updated
        cy.contains("td", "Grooming").closest("tr").contains("120").should("exist");

        cy.contains("td", "Boarding").closest("tr").contains("85").should("exist");
    });

    it("should update data when changing time range to month", () => {
        // Mock data for month view
        const monthMockData = {
            data: [
                {
                    roomTypeName: "Grooming",
                    quantity: 35,
                    id: "1"
                },
                {
                    roomTypeName: "Boarding",
                    quantity: 22,
                    id: "2"
                },
                {
                    roomTypeName: "Veterinary Care",
                    quantity: 18,
                    id: "3"
                }
            ]
        };

        cy.intercept("GET", "**/api/ReportFacility/bookingServiceItem?year=*&month=*", {
            statusCode: 200,
            body: monthMockData
        }).as("getMonthServiceItemData");

        // Select month view
        cy.contains("By year").parent("select").should("be.visible", { timeout: 10000 });
        cy.contains("By year").parent("select").select("By month");



        // Then, select the year
        cy.get('select').eq(2).should("be.visible").select("2023");

        // Then, select the month
        cy.get('select').eq(3).should("be.visible").select("6");


        cy.wait("@getMonthServiceItemData", { timeout: 10000 });

        // Check if the data updated
        cy.contains("td", "Grooming").closest("tr").contains("35").should("exist");
        cy.contains("td", "Boarding").parent("tr").contains("22").should("exist");
    });

    it("should update data when changing time range to specific dates", () => {
        // Mock data for date range view
        const dateMockData = {
            data: [
                {
                    roomTypeName: "Grooming",
                    quantity: 12,
                    id: "1"
                },
                {
                    roomTypeName: "Boarding",
                    quantity: 8,
                    id: "2"
                },
                {
                    roomTypeName: "Veterinary Care",
                    quantity: 5,
                    id: "3"
                }
            ]
        };

        cy.intercept("GET", "**/api/ReportFacility/bookingServiceItem?startDate=*&endDate=*", {
            statusCode: 200,
            body: dateMockData
        }).as("getDateServiceItemData");

        // Select date range view
        cy.contains("By year").parent("select").should("be.visible", { timeout: 10000 });
        cy.contains("By year").parent("select").select("day");

        // Set date range
        const startDate = "2023-06-01";
        const endDate = "2023-06-30";

        cy.get("input[type='date']").first().should("be.visible", { timeout: 10000 });
        cy.get("input[type='date']").first().type(startDate);
        cy.get("input[type='date']").last().type(endDate);

        cy.wait("@getDateServiceItemData", { timeout: 10000 });

        // Check if the data updated
        cy.contains("td", "Grooming").closest("tr").contains("12").should("exist");
        cy.contains("td", "Boarding").closest("tr").contains("8").should("exist");
    });

    it("should show loading spinner while fetching data", () => {
        // Intercept with delay
        cy.intercept("GET", "**/api/ReportFacility/bookingServiceItem*", (req) => {
            req.reply({
                delay: 1000,
                statusCode: 200,
                body: mockServiceItemData
            });
        }).as("delayedServiceItemData");

        // Reload to trigger the delayed response
        cy.reload();
        cy.get("select").first().select("Service");

        // Check if loading spinner appears
        cy.get(".animate-spin").should("exist");

        // Wait for data and check if spinner disappears
        cy.wait("@delayedServiceItemData", { timeout: 10000 });
        cy.get(".animate-spin").should("not.exist");
    });

    it("should handle empty data gracefully", () => {
        // Mock empty data response
        cy.intercept("GET", "**/api/ReportFacility/bookingServiceItem*", {
            statusCode: 200,
            body: { data: [] }
        }).as("emptyServiceItemData");

        // Reload to trigger the empty response
        cy.reload();
        cy.get("select").first().select("Service");
        cy.wait("@emptyServiceItemData", { timeout: 10000 });

        // Check if empty state message appears
        cy.contains("No data available").should("exist");
        cy.contains("There are no service bookings for the selected time period").should("exist");
    });

    it("should handle API errors gracefully", () => {
        // Mock error response
        cy.intercept("GET", "**/api/ReportFacility/bookingServiceItem*", {
            statusCode: 500,
            body: { message: "Server Error" }
        }).as("errorServiceItemData");

        // Reload to trigger the error response
        cy.reload();
        cy.get("select").first().select("Service");
        cy.wait("@errorServiceItemData", { timeout: 10000 });

        // Check if error state appears
        cy.contains("Error loading data").should("exist");
        cy.contains("Try Again").should("exist").click();

        // Verify that clicking "Try Again" triggers a new request
        cy.wait("@errorServiceItemData", { timeout: 10000 });
    });

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
});