import formatCurrency from "../../../../src/Utilities/formatCurrency";

describe("Report Income Component", () => {
    const mockIncomeData = {
        data: [
            {
                bookingTypeName: "Hotel",
                amountDTOs: [
                    { label: "Jan", amount: 1500 },
                    { label: "Feb", amount: 2000 },
                    { label: "Mar", amount: 2500 },
                    { label: "Apr", amount: 1800 },
                    { label: "May", amount: 3000 },
                    { label: "Jun", amount: 3500 },
                ]
            },
            {
                bookingTypeName: "Service",
                amountDTOs: [
                    { label: "Jan", amount: 1000 },
                    { label: "Feb", amount: 1200 },
                    { label: "Mar", amount: 1800 },
                    { label: "Apr", amount: 1500 },
                    { label: "May", amount: 2200 },
                    { label: "Jun", amount: 2800 },
                ]
            }
        ]
    };

    beforeEach(() => {
        // Login first
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

        // Intercept the income API call
        cy.intercept("GET", "**/api/ReportBooking/getIncome*", {
            statusCode: 200,
            body: mockIncomeData
        }).as("getIncomeData");

        // Visit the reports page
        cy.visit("http://localhost:3000/report");

        // Wait for the page to load completely
        cy.contains("Analytics Dashboard", { timeout: 10000 }).should("be.visible");

        // Wait for initial API calls to complete
        cy.wait([
            "@getStaffCount",
            "@getCustomerCount",
            "@getPets",
            "@getBookings",
            "@getServices",
            "@getRooms"
        ], { timeout: 10000 });

        // Now select Booking report type
        cy.contains("Report Type:").should("be.visible");
        cy.get("select").should("be.visible", { timeout: 10000 });
        cy.get("select").first().select("Booking");

        // Wait for income data to load
        cy.wait("@getIncomeData", { timeout: 10000 });
    });

    it("should display the income report section", () => {
        cy.contains("Total Revenue of Bookings", { timeout: 10000 }).should("exist");
        cy.contains("Income Trend").should("exist");
        cy.contains("Income Distribution").should("exist");
    });

    it("should display the correct total income values", () => {
        // Calculate expected totals
        const roomTotal = mockIncomeData.data[0].amountDTOs.reduce((sum, item) => sum + item.amount, 0);
        const serviceTotal = mockIncomeData.data[1].amountDTOs.reduce((sum, item) => sum + item.amount, 0);
        const totalIncome = roomTotal + serviceTotal;

        // Check if the values are displayed correctly
        cy.contains("Total Income").parent()
            .contains("24.800,0 ₫");
        cy.contains("Room Income").parent().contains("14.300,0 ₫");
        cy.contains("Service Income").parent().contains("10.500,0 ₫");
    });

    it("should render the line chart with correct data", () => {
        // Check if the chart container exists
        cy.get(".recharts-surface", { timeout: 10000 }).should("exist");

        // Check if the chart has the correct number of data points
        cy.get(".recharts-line-dots").should("have.length", 2); // One for room, one for service

        // Check if the chart legends exist
        cy.contains("Room Income").should("exist");
        cy.contains("Service Income").should("exist");
    });

    it("should display the income distribution with correct percentages", () => {
        // Calculate expected percentages
        const roomTotal = mockIncomeData.data[0].amountDTOs.reduce((sum, item) => sum + item.amount, 0);
        const serviceTotal = mockIncomeData.data[1].amountDTOs.reduce((sum, item) => sum + item.amount, 0);
        const totalIncome = roomTotal + serviceTotal;

        const roomPercentage = Math.round((roomTotal / totalIncome) * 100);
        const servicePercentage = Math.round((serviceTotal / totalIncome) * 100);

        // Check if the percentages are displayed correctly
        cy.contains(roomPercentage + "%").should("exist");
        cy.contains(servicePercentage + "%").should("exist");
    });

    it("should update data when changing time range to year", () => {
        // Mock data for year view
        const yearMockData = {
            "data": [
                {
                    "bookingTypeName": "Service",
                    "amountDTOs": [
                        {
                            "label": "1",
                            "amount": 0
                        },
                        {
                            "label": "2",
                            "amount": 0
                        },
                        {
                            "label": "3",
                            "amount": 0
                        },
                        {
                            "label": "4",
                            "amount": 0
                        },
                        {
                            "label": "5",
                            "amount": 0
                        },
                        {
                            "label": "6",
                            "amount": 0
                        },
                        {
                            "label": "7",
                            "amount": 0
                        },
                        {
                            "label": "8",
                            "amount": 0
                        },
                        {
                            "label": "9",
                            "amount": 0
                        },
                        {
                            "label": "10",
                            "amount": 0
                        },
                        {
                            "label": "11",
                            "amount": 0
                        },
                        {
                            "label": "12",
                            "amount": 10000
                        }
                    ]
                },
                {
                    "bookingTypeName": "Hotel",
                    "amountDTOs": [
                        {
                            "label": "1",
                            "amount": 0
                        },
                        {
                            "label": "2",
                            "amount": 400.00
                        },
                        {
                            "label": "3",
                            "amount": 0
                        },
                        {
                            "label": "4",
                            "amount": 0
                        },
                        {
                            "label": "5",
                            "amount": 0
                        },
                        {
                            "label": "6",
                            "amount": 0
                        },
                        {
                            "label": "7",
                            "amount": 0
                        },
                        {
                            "label": "8",
                            "amount": 0
                        },
                        {
                            "label": "9",
                            "amount": 0
                        },
                        {
                            "label": "10",
                            "amount": 0
                        },
                        {
                            "label": "11",
                            "amount": 0
                        },
                        {
                            "label": "12",
                            "amount": 400.00
                        }
                    ]
                }
            ]
        };

        cy.intercept("GET", "**/api/ReportBooking/getIncome?year=*", {
            statusCode: 200,
            body: yearMockData
        }).as("getYearIncomeData");



        // Now select the time range type (this is the first select in the time range section)
        cy.contains("By year").parent("select").should("be.visible", { timeout: 10000 });
        cy.contains("By year").parent("select").select("year");

        // Now select the year (this is the select that appears when "year" is selected)
        cy.get("select").contains("2023").parent("select").should("be.visible", { timeout: 10000 });
        cy.get("select").contains("2023").parent("select").select("2023");

        cy.wait("@getYearIncomeData", { timeout: 10000 });

        // Check if the chart updated with new data
        cy.contains("10.000,0 ₫").should("exist");
        cy.contains("800,0 ₫").should("exist");
    });

    it("should update data when changing time range to month", () => {
        // Mock data for month view
        const monthMockData = {
            data: [
                {
                    bookingTypeName: "Hotel",
                    amountDTOs: [
                        { label: "Week 1", amount: 1200 },
                        { label: "Week 2", amount: 1500 },
                        { label: "Week 3", amount: 1800 },
                        { label: "Week 4", amount: 2000 },
                    ]
                },
                {
                    bookingTypeName: "Service",
                    amountDTOs: [
                        { label: "Week 1", amount: 800 },
                        { label: "Week 2", amount: 1000 },
                        { label: "Week 3", amount: 1300 },
                        { label: "Week 4", amount: 1500 },
                    ]
                }
            ]
        };

        cy.intercept("GET", "**/api/ReportBooking/getIncome?year=*&month=*", {
            statusCode: 200,
            body: monthMockData
        }).as("getMonthIncomeData");

        // Select month view
        cy.get("select").eq(1).should("be.visible", { timeout: 10000 });
        cy.get("select").eq(1).select("month");
        cy.get("select").eq(2).should("be.visible");
        cy.get("select").eq(2).select("2023");
        cy.get("select").eq(3).should("be.visible");
        cy.get("select").eq(3).select("6");

        cy.wait("@getMonthIncomeData", { timeout: 10000 });

        // Check if the chart updated with new data
        cy.contains("Week 1").should("exist");
        cy.contains("Week 4").should("exist");
    });

    it("should update data when changing time range to specific dates", () => {
        // Mock data for date range view
        const dateMockData = {
            data: [
                {
                    bookingTypeName: "Hotel",
                    amountDTOs: [
                        { label: "Jun 1", amount: 200 },
                        { label: "Jun 2", amount: 250 },
                        { label: "Jun 3", amount: 300 },
                    ]
                },
                {
                    bookingTypeName: "Service",
                    amountDTOs: [
                        { label: "Jun 1", amount: 150 },
                        { label: "Jun 2", amount: 180 },
                        { label: "Jun 3", amount: 220 },
                    ]
                }
            ]
        };

        cy.intercept("GET", "**/api/ReportBooking/getIncome?startDate=*&endDate=*", {
            statusCode: 200,
            body: dateMockData
        }).as("getDateIncomeData");

        // Select date range view
        cy.get("select").eq(1).should("be.visible", { timeout: 10000 });
        cy.get("select").eq(1).select("day");
        cy.get("input[type='date']").first().should("be.visible");

        const startDate = "2023-06-01";
        const endDate = "2023-06-03";
        cy.get("input[type='date']").first().type(startDate);
        cy.get("input[type='date']").last().type(endDate);

        cy.wait("@getDateIncomeData", { timeout: 10000 });

        // Check if the chart updated with new data
        cy.contains("Jun 1").should("exist");
        cy.contains("Jun 3").should("exist");
    });

    it("should display loading spinner while fetching data", () => {
        // Intercept with delay
        cy.intercept("GET", "**/api/ReportBooking/getIncome*", (req) => {
            req.reply({
                delay: 1000,
                statusCode: 200,
                body: mockIncomeData
            });
        }).as("delayedIncomeData");

        // Reload to trigger the delayed response
        cy.reload();
        cy.contains("Analytics Dashboard", { timeout: 10000 }).should("be.visible");
        cy.get("select").should("be.visible", { timeout: 10000 });
        cy.get("select").first().select("Booking");

        // Check if loading spinner appears
        cy.get(".animate-spin").should("exist");

        // Wait for data and check if spinner disappears
        cy.wait("@delayedIncomeData", { timeout: 10000 });
        cy.get(".animate-spin").should("not.exist");
    });

    it("should handle empty data gracefully", () => {
        // Mock empty data response
        cy.intercept("GET", "**/api/ReportBooking/getIncome*", {
            statusCode: 200,
            body: { data: [] }
        }).as("emptyIncomeData");

        // Reload to trigger the empty response
        cy.reload();
        cy.contains("Analytics Dashboard", { timeout: 10000 }).should("be.visible");
        cy.get("select").should("be.visible", { timeout: 10000 });
        cy.get("select").first().select("Booking");

        cy.wait("@emptyIncomeData", { timeout: 10000 });

        // Check if empty state message appears
        cy.contains("No data available for this period").should("exist");
    });

    it("should handle API errors gracefully", () => {
        // Mock error response
        cy.intercept("GET", "**/api/ReportBooking/getIncome*", {
            statusCode: 500,
            body: { message: "Server Error" }
        }).as("errorIncomeData");

        // Reload to trigger the error response
        cy.reload();
        cy.contains("Analytics Dashboard", { timeout: 10000 }).should("be.visible");
        cy.get("select").should("be.visible", { timeout: 10000 });
        cy.get("select").first().select("Booking");

        cy.wait("@errorIncomeData", { timeout: 10000 });

        // Check if error state appears (either empty state or error message)
        cy.contains("No data available for this period").should("exist");
    });
});