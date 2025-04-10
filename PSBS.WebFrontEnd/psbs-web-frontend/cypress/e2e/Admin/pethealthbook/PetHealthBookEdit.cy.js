describe("Pet Health Book Edit Page", () => {
    const validAdminToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwNjAwMH0.XYZ_admin_example_token";

    const treatmentsData = {
        data: [
            { treatmentId: "T001", treatmentName: "Treatment One" },
            { treatmentId: "T002", treatmentName: "Treatment Two" },
        ],
    };

    const bookingsData = {
        data: [{ bookingId: "B001", bookingCode: "BK123" }],
    };

    const medicinesData = {
        data: [
            { medicineId: "MED001", medicineName: "Med One", treatmentId: "T001" },
            { medicineId: "MED002", medicineName: "Med Two", treatmentId: "T002" },
        ],
    };

    const petDetail = {
        data: {
            petId: "P001",
            petName: "Buddy",
        },
    };

    beforeEach(() => {
        cy.window().then((win) => {
            win.sessionStorage.setItem("token", validAdminToken);
            win.sessionStorage.setItem("accountName", "Admin User");
        });

        cy.intercept("GET", "**/api/Treatment", {
            statusCode: 200,
            body: treatmentsData,
        }).as("getTreatments");

        cy.intercept("GET", "**/Bookings", {
            statusCode: 200,
            body: bookingsData,
        }).as("getBookings");

        cy.intercept("GET", "**/Medicines", {
            statusCode: 200,
            body: medicinesData,
        }).as("getMedicines");

        cy.intercept("GET", "**/api/pet/P001", {
            statusCode: 200,
            body: petDetail,
        }).as("getPetDetail");

        cy.intercept("GET", "**/api/BookingServiceItems/GetBookingServiceList", {
            statusCode: 200,
            body: {
                data: [
                    {
                        bookingServiceItemId: "BSI001",
                        bookingId: "B001",
                        petId: "P001",
                    },
                ],
            },
        }).as("getBookingServiceList");

        cy.intercept("POST", "**/api/PetHealthBook", {
            statusCode: 200,
            body: { message: "Created successfully" },
        }).as("createHealthBook");

        cy.visit("http://localhost:3000/add?bookingCode=BK123&petIds=P001", {
            onBeforeLoad: (win) => {
                win.sessionStorage.setItem("token", validAdminToken);
            },
        });

        cy.wait(["@getTreatments", "@getBookings", "@getMedicines", "@getPetDetail"]);
    });

    it("should render the create form with prefilled booking code and pet select", () => {
        cy.get("input[placeholder='Enter Booking Code']")
            .should("have.value", "BK123")
            .and("be.disabled");

        cy.contains("label", "Pet")
            .next("select")
            .should("contain", "Buddy");

        cy.contains("Perform by")
            .parent()
            .find("input")
            .should("have.value", "Admin User")
            .and("be.disabled");

        cy.contains("Visit Date")
            .parent()
            .find("input")
            .should("be.disabled");

        cy.contains("Next Visit Date")
            .parent()
            .find("input")
            .should("not.be.disabled");

        cy.contains("Treatment")
            .parent()
            .find("select")
            .should("contain", "Select Treatment")
            .and("contain", "Treatment One");
    });

    it("should show medicines options based on selected treatment", () => {
        cy.contains("label", "Treatment")
            .parent()
            .find("select")
            .select("T001");

        cy.contains("Med One").should("be.visible");
        cy.contains("No medicines available for the selected treatment.").should(
            "not.exist"
        );
    });

    it("should show error if required fields are missing", () => {
        cy.contains("button", "Create").click();
        cy.get(".swal2-popup")
            .should("be.visible")
            .within(() => {
                cy.contains("Error").should("be.visible");
            });
    });

    it("Edit pet health book successfully", () => {
        cy.get("input[placeholder='Enter Booking Code']").should("have.value", "BK123");

        cy.contains("label", "Pet")
            .next("select")
            .should("exist")
            .and("contain", "Buddy");

        cy.contains("label", "Treatment")
            .parent()
            .find("select")
            .select("T001");

        cy.wait(500);
        cy.contains("Med One").should("be.visible");

        cy.contains("Med One")
            .parent()
            .find('input[type="checkbox"]')
            .check({ force: true });

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
        const dd = String(tomorrow.getDate()).padStart(2, "0");
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        cy.contains("label", "Next Visit Date")
            .parent()
            .find("input")
            .clear()
            .type(formattedDate, { force: true });

        cy.contains("button", "Create").click();

        cy.wait("@createHealthBook").its("request.body").should((body) => {
            expect(body.bookingId).to.equal("B001");
            expect(body.bookingServiceItemId).to.equal("BSI001");
            expect(body.medicineIds).to.include("MED001");

            const returnedDate = new Date(body.nextVisitDate);
            const expectedDate = new Date(tomorrow);

            expect(returnedDate.getFullYear()).to.equal(expectedDate.getFullYear());
            expect(returnedDate.getMonth()).to.equal(expectedDate.getMonth());
            expect(returnedDate.getDate()).to.equal(expectedDate.getDate());
        });


        cy.contains("Pet health book created successfully!").should("exist");
        cy.get(".swal2-confirm").click();
        cy.url().should("include", "/pethealthbook");
    });

    it("should navigate back when clicking Back button", () => {
        cy.contains("button", "Back").click();
        cy.url().should("not.include", "/add");
    });
});
