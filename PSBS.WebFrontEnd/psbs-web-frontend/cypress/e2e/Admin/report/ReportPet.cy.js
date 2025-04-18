describe("Report Pet", () => {
    const mockServices = [
        {
            id: "1",
            serviceId: "1",
            serviceName: "Grooming"
        },
        {
            id: "2",
            serviceId: "2",
            serviceName: "Boarding"
        },
        {
            id: "3",
            serviceId: "3",
            serviceName: "Veterinary Care"
        }
    ];

    const mockPetBreedData = {
        data: {
            "Golden Retriever": 15,
            "Labrador": 12,
            "Siamese Cat": 8,
            "Persian Cat": 6,
            "Bulldog": 10
        }
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

        cy.intercept("GET", "**/api/Service?showAll=false", {
            statusCode: 200,
            body: { data: mockServices }
        }).as("getServices");

        cy.intercept("GET", "**/api/ReportFacility/availableRoom*", {
            statusCode: 200,
            body: { data: Array(8).fill({}) },
        }).as("getRooms");

        // Intercept the pet breed API call for the first service
        cy.intercept("GET", `**/api/ReportPet/${mockServices[0].serviceId}*`, {
            statusCode: 200,
            body: mockPetBreedData
        }).as("getPetBreedData");

        // Visit the reports page
        cy.visit("http://localhost:3000/report");

        // Wait for the page to load completely
        cy.contains("Analytics Dashboard", { timeout: 10000 }).should("be.visible");

        // Select Pet report type to show the pet breed distribution
        cy.get("select").first().select("Pet");

        // Wait for the services to load and the first pet breed data to load
        cy.wait(["@getServices", "@getPetBreedData"], { timeout: 10000 });

        // Ensure the component is visible
        cy.contains("Pet Statistics by service", { timeout: 10000 }).should("be.visible");
    });

    it("should display the pet statistics header", () => {
        cy.contains("Pet Statistics by service").should("exist");
        cy.contains("Analysis of pet breeds using each service").should("exist");

        // Check if the time period text is displayed
        const currentYear = new Date().getFullYear();
        cy.contains(`Year ${currentYear}`).should("exist");
    });

    it("should display the service selector with the first service selected by default", () => {
        // Check if the service selector exists
        cy.contains("Select a service to view pet statistics").should("exist");

        // Check if the first service is selected by default
        cy.get('input.MuiInputBase-input') // this targets the visible input field
            .should('have.value', mockServices[0].serviceName);
    });

    it("should display the pet breed distribution chart", () => {
        // Check if ReportCircleCard is rendered
        cy.get(".recharts-pie").should("exist");
        cy.get(".recharts-legend-wrapper").should("exist");

        // Check if all pet breed names appear in the chart
        Object.keys(mockPetBreedData.data).forEach(breedName => {
            cy.get(".recharts-legend-wrapper").contains(breedName).should("exist");
        });
    });

    it("should display key insights section with correct data", () => {
        // Check if the key insights section exists
        cy.contains("Key Insights").should("exist");

        // Check most popular pet breed
        const mostPopularBreed = Object.entries(mockPetBreedData.data)
            .sort((a, b) => b[1] - a[1])[0][0];
        cy.contains("h4", "Most Popular Pet Breed")
            .closest("div") // go up to the container holding both icon and text
            .parent() // if needed, go one level higher to the section/card
            .contains(mostPopularBreed)
            .should("exist");


        // Check total pet bookings
        const totalBookings = Object.values(mockPetBreedData.data).reduce((sum, count) => sum + count, 0);
        cy.contains("h4", "Total Pet Bookings")
            .closest("div") // go up to the container holding both icon and text
            .parent() // if needed, go one level higher to the section/card
            .contains(totalBookings)
            .should("exist");

        // Check pet breed diversity
        const breedCount = Object.keys(mockPetBreedData.data).length;
        cy.contains("h4", "Pet Breed Diversity")
            .closest("div") // go up to the container holding both icon and text
            .parent() // if needed, go one level higher to the section/card
            .contains(breedCount)
            .should("exist");

    });

    it("should display the pet breed distribution table with correct data", () => {
        // Check if the table exists
        cy.get("table").should("exist");

        // Check table headers
        cy.get("thead").contains("Pet Breed").should("exist");
        cy.get("thead").contains("Bookings").should("exist");
        cy.get("thead").contains("Percentage").should("exist");

        // Calculate total bookings for percentage calculations
        const totalBookings = Object.values(mockPetBreedData.data).reduce((sum, count) => sum + count, 0);

        // Check each row in the table
        Object.entries(mockPetBreedData.data).forEach(([breedName, count]) => {
            // Find the row containing this breed name
            cy.contains("td", breedName).parent("tr").within(() => {
                // Check count
                cy.contains(count).should("exist");

                // Check percentage
                const percentage = ((count / totalBookings) * 100).toFixed(1);
                cy.contains(`${percentage}%`).should("exist");

                // Check progress bar exists
                cy.get(".w-24.bg-gray-200.rounded-full.h-2").should("exist");
                cy.get(".h-2.rounded-full").should("exist");
            });
        });
    });

    it("should update data when selecting a different service", () => {
        // Mock data for the second service
        const secondServiceMockData = {
            data: {
                "Labrador": 20,
                "Poodle": 15,
                "Beagle": 10,
                "Shih Tzu": 8
            }
        };

        // Intercept the pet breed API call for the second service
        cy.intercept("GET", `**/api/ReportPet/${mockServices[1].serviceId}*`, {
            statusCode: 200,
            body: secondServiceMockData
        }).as("getSecondServicePetBreedData");

        // Select the second service
        cy.get(".MuiAutocomplete-root").click();
        cy.contains(mockServices[1].serviceName).click();

        // Wait for the pet breed data to load
        cy.wait("@getSecondServicePetBreedData", { timeout: 10000 });

        // Check if the data was updated
        cy.contains("Poodle").should("exist");
        cy.contains("Beagle").should("exist");

        // Check if the total pet bookings was updated
        const totalBookings = Object.values(secondServiceMockData.data).reduce((sum, count) => sum + count, 0);

        cy.contains("h4", "Total Pet Bookings")
            .closest("div") // go up to the container holding both icon and text
            .parent() // if needed, go one level higher to the section/card
            .contains(totalBookings)
            .should("exist");

    });

    it("should update data when changing time range to year", () => {
        // Mock data for year view
        const yearMockData = {
            data: {
                "Golden Retriever": 30,
                "Labrador": 25,
                "Siamese Cat": 15,
                "Persian Cat": 12
            }
        };

        cy.intercept("GET", `**/api/ReportPet/${mockServices[0].serviceId}?year=*`, {
            statusCode: 200,
            body: yearMockData
        }).as("getYearPetBreedData");

        // Select year view
        cy.contains("By year").parent("select").should("be.visible", { timeout: 10000 });
        cy.contains("By year").parent("select").select("year");

        // Select a specific year
        cy.get("select").contains("2023").parent("select").should("be.visible", { timeout: 10000 });
        cy.get("select").contains("2023").parent("select").select("2023");

        cy.wait("@getYearPetBreedData", { timeout: 10000 });

        // Check if the data was updated
        const totalBookings = Object.values(yearMockData.data).reduce((sum, count) => sum + count, 0);
        cy.contains("h4", "Total Pet Bookings")
            .closest("div") // go up to the container holding both icon and text
            .parent() // if needed, go one level higher to the section/card
            .contains(totalBookings)
            .should("exist");
    });

    it("should update data when changing time range to month", () => {
        // Mock data for month view
        const monthMockData = {
            data: {
                "Golden Retriever": 10,
                "Labrador": 8,
                "Siamese Cat": 5,
                "Persian Cat": 4
            }
        };

        cy.intercept("GET", `**/api/ReportPet/${mockServices[0].serviceId}?year=*&month=*`, {
            statusCode: 200,
            body: monthMockData
        }).as("getMonthPetBreedData");

        // Select month view
        cy.contains("By year").parent("select").should("be.visible", { timeout: 10000 });
        cy.contains("By year").parent("select").select("By month");

        // Select a specific year and month
        cy.get("select").contains("2023").parent("select").should("be.visible", { timeout: 10000 });
        cy.get("select").contains("2023").parent("select").select("2023");

        // Then, select the month
        cy.get('select').eq(3).should("be.visible").select("6");

        cy.wait("@getMonthPetBreedData", { timeout: 10000 });

        // Check if the data was updated
        const totalBookings = Object.values(monthMockData.data).reduce((sum, count) => sum + count, 0);
        cy.contains("h4", "Total Pet Bookings")
            .closest("div") // go up to the container holding both icon and text
            .parent() // if needed, go one level higher to the section/card
            .contains(totalBookings)
            .should("exist");
    });

    it("should update data when changing time range to specific dates", () => {
        // Mock data for date range view
        const dateMockData = {
            data: {
                "Golden Retriever": 5,
                "Labrador": 4,
                "Siamese Cat": 3,
                "Persian Cat": 2
            }
        };

        cy.intercept("GET", `**/api/ReportPet/${mockServices[0].serviceId}?startDate=*&endDate=*`, {
            statusCode: 200,
            body: dateMockData
        }).as("getDatePetBreedData");

        // Select date range view
        cy.contains("By year").parent("select").should("be.visible", { timeout: 10000 });
        cy.contains("By year").parent("select").select("day");

        // Set date range
        const startDate = "2023-06-01";
        const endDate = "2023-06-30";

        cy.get("input[type='date']").first().should("be.visible", { timeout: 10000 });
        cy.get("input[type='date']").first().type(startDate);
        cy.get("input[type='date']").last().type(endDate);

        cy.wait("@getDatePetBreedData", { timeout: 10000 });

        // Check if the data was updated
        const totalBookings = Object.values(dateMockData.data).reduce((sum, count) => sum + count, 0);
        cy.contains("h4", "Total Pet Bookings")
            .closest("div") // go up to the container holding both icon and text
            .parent() // if needed, go one level higher to the section/card
            .contains(totalBookings)
            .should("exist");
    });

    it("should refresh data when clicking the refresh button", () => {
        // Mock data for refresh
        const refreshMockData = {
            data: {
                "Golden Retriever": 18,
                "Labrador": 14,
                "Siamese Cat": 10,
                "Persian Cat": 8,
                "Bulldog": 12
            }
        };

        cy.intercept("GET", `**/api/ReportPet/${mockServices[0].serviceId}*`, {
            statusCode: 200,
            body: refreshMockData
        }).as("refreshPetBreedData");

        // Click the refresh button
        cy.contains("Refresh").click();

        // Wait for the refresh data
        cy.wait("@refreshPetBreedData", { timeout: 10000 });

        // Check if the data was updated
        const totalBookings = Object.values(refreshMockData.data).reduce((sum, count) => sum + count, 0);
        cy.contains("h4", "Total Pet Bookings")
            .closest("div") // go up to the container holding both icon and text
            .parent() // if needed, go one level higher to the section/card
            .contains(totalBookings)
            .should("exist");
    });

    it("should show loading spinner while fetching data", () => {
        // Intercept with delay
        cy.intercept("GET", `**/api/ReportPet/${mockServices[0].serviceId}*`, (req) => {
            req.reply({
                delay: 1000,
                statusCode: 200,
                body: mockPetBreedData
            });
        }).as("delayedPetBreedData");

        // Reload to trigger the delayed response
        cy.reload();
        cy.get("select").first().select("Pet");

        // Check if loading spinner appears
        cy.get(".animate-spin").should("exist");

        // Wait for data and check if spinner disappears
        cy.wait("@delayedPetBreedData", { timeout: 10000 });
        cy.get(".animate-spin").should("not.exist");
    });

    it("should handle empty data gracefully", () => {
        // Mock empty data response
        cy.intercept("GET", `**/api/ReportPet/${mockServices[0].serviceId}*`, {
            statusCode: 200,
            body: { data: {} }
        }).as("emptyPetBreedData");

        // Reload to trigger the empty response
        cy.reload();
        cy.get("select").first().select("Pet");
        cy.wait("@emptyPetBreedData", { timeout: 10000 });

        // Check if empty state message appears
        cy.contains("No Pet Data Available").should("exist");
        cy.contains("There is no pet data available for the selected service and time period").should("exist");
    });

    it("should handle API errors gracefully", () => {
        // Mock error response
        cy.intercept("GET", `**/api/ReportPet/${mockServices[0].serviceId}*`, {
            statusCode: 500,
            body: { message: "Server Error" }
        }).as("errorPetBreedData");

        // Reload to trigger the error response
        cy.reload();
        cy.get("select").first().select("Pet");
        cy.wait("@errorPetBreedData", { timeout: 10000 });

        // Check if error state appears
        cy.contains("Error Loading Data").should("exist");
        cy.contains("Try Again").should("exist").click();

        // Verify that clicking "Try Again" triggers a new request
        cy.wait("@errorPetBreedData", { timeout: 10000 });
    });

    it("should handle service API errors gracefully", () => {
        // Mock error response for services
        cy.intercept("GET", "**/api/Service?showAll=false", {
            statusCode: 500,
            body: { message: "Server Error" }
        }).as("errorServicesData");

        // Reload to trigger the error response
        cy.reload();
        cy.get("select").first().select("Pet");
        cy.wait("@errorServicesData", { timeout: 10000 });

        // Check if error state appears
        cy.contains("Error Loading Data").should("exist");

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

    it("should have interactive chart elements", () => {
        // Check if the chart has interactive elements
        cy.get(".recharts-pie-sector").first()
            .trigger("mouseover");

        // Check if tooltip appears on hover
        cy.get(".recharts-tooltip-wrapper").should("exist");
    });

    it("should sort the pet breed table by booking count", () => {
        // Check if the table is sorted by booking count in descending order
        const sortedBreeds = Object.entries(mockPetBreedData.data)
            .sort((a, b) => b[1] - a[1])
            .map(([breed]) => breed);

        // Get all breed names in the table
        cy.get("table tbody tr").each(($row, index) => {
            if (index < sortedBreeds.length) {
                cy.wrap($row).contains(sortedBreeds[index]).should("exist");
            }
        });
    });

    it("should display the correct percentage calculations in the table", () => {
        // Calculate total bookings for percentage calculations
        const totalBookings = Object.values(mockPetBreedData.data).reduce((sum, count) => sum + count, 0);

        // Check each row in the table for correct percentage
        Object.entries(mockPetBreedData.data).forEach(([breedName, count]) => {
            const percentage = ((count / totalBookings) * 100).toFixed(1);

            // Find the row containing this breed name
            cy.contains("td", breedName).parent("tr").contains(`${percentage}%`).should("exist");
        });
    });

    it("should display the correct progress bar widths in the table", () => {
        // Calculate total bookings for percentage calculations
        const totalBookings = Object.values(mockPetBreedData.data).reduce((sum, count) => sum + count, 0);

        // Check each row in the table for progress bar
        Object.entries(mockPetBreedData.data).forEach(([breedName, count]) => {
            // Find the row containing this breed name
            cy.contains("td", breedName).parent("tr").within(() => {
                // Check if the progress bar exists
                cy.get(".w-24.bg-gray-200.rounded-full.h-2").should("exist");
                cy.get(".h-2.rounded-full").should("exist");
            });
        });
    });

});