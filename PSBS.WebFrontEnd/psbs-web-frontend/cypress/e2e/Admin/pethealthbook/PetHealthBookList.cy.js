describe("Pet Health Book List Page", () => {
    const validAdminToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwNjAwMH0.XYZ_admin_example_token";
  
    const petHealthBooksData = {
      data: [
        {
          healthBookId: "HB001",
          bookingServiceItemId: "BSI001",
          medicineIds: ["MED001", "MED002"],
          createAt: "2023-04-01T10:00:00Z",
          performBy: "Dr. Smith",
        },
      ],
    };
  
    const medicinesData = {
      data: [
        { medicineId: "MED001", medicineName: "Med One", treatmentId: "T001" },
        { medicineId: "MED002", medicineName: "Med Two", treatmentId: "T002" },
      ],
    };
  
    const treatmentsData = {
      data: [
        { treatmentId: "T001", treatmentName: "Treatment One" },
        { treatmentId: "T002", treatmentName: "Treatment Two" },
      ],
    };
  
    const bookingsData = {
      data: [{ bookingId: "B001", accountId: "A001" }],
    };
  
    const bookingServiceItemsData = {
      data: [{ bookingServiceItemId: "BSI001", bookingId: "B001", petId: "P001" }],
    };
  
    const petsData = {
      data: [{ petId: "P001", petName: "Buddy", petBreedId: "PB001" }],
    };
  
    const petBreedsData = {
      data: [{ petBreedId: "PB001", petBreedName: "Golden Retriever" }],
    };
  
    const accountData = {
      accountPhoneNumber: "1234567890",
    };
  
    beforeEach(() => {
      cy.window().then((win) => {
        win.sessionStorage.setItem("token", validAdminToken);
      });
  
      cy.intercept("GET", "**/api/PetHealthBook", {
        statusCode: 200,
        body: petHealthBooksData,
      }).as("getPetHealthBooks");
  
      cy.intercept("GET", "**/Medicines", {
        statusCode: 200,
        body: medicinesData,
      }).as("getMedicines");
  
      cy.intercept("GET", "**/api/Treatment", {
        statusCode: 200,
        body: treatmentsData,
      }).as("getTreatments");
  
      cy.intercept("GET", "**/Bookings", {
        statusCode: 200,
        body: bookingsData,
      }).as("getBookings");
  
      cy.intercept("GET", "**/api/BookingServiceItems/GetBookingServiceList", {
        statusCode: 200,
        body: bookingServiceItemsData,
      }).as("getBookingServiceItems");
  
      cy.intercept("GET", "**/api/pet", {
        statusCode: 200,
        body: petsData,
      }).as("getPets");
  
      cy.intercept("GET", "**/api/petBreed", {
        statusCode: 200,
        body: petBreedsData,
      }).as("getPetBreeds");
  
      cy.intercept("GET", /\/api\/Account\?AccountId=.*/, {
        statusCode: 200,
        body: accountData,
      }).as("getAccount");
  
      cy.visit("http://localhost:3000/pethealthbook", {
        onBeforeLoad: (win) => {
          win.sessionStorage.setItem("token", validAdminToken);
        },
      });
  
      cy.wait([
        "@getPetHealthBooks",
        "@getMedicines",
        "@getTreatments",
        "@getBookings",
        "@getBookingServiceItems",
        "@getPets",
        "@getPetBreeds",
      ]);
    });
  
    it("should have responsive design", () => {
      cy.viewport("iphone-x");
      cy.contains("Health Book List").should("be.visible");
      cy.viewport("ipad-2");
      cy.contains("Health Book List").should("be.visible");
      cy.viewport(1280, 800);
      cy.contains("Health Book List").should("be.visible");
    });
  
    it("should display a data grid with pet health book data", () => {
      cy.get(".MuiDataGrid-root").should("be.visible");
      cy.contains("Buddy").should("be.visible");
      cy.contains(accountData.accountPhoneNumber).should("be.visible");
    });
   
    it("should navigate to update and detail pages when clicking action buttons", () => {
      cy.get(`a[href*="/update/HB001"]`)
        .should("have.attr", "href")
        .and("include", "/update/HB001");
      cy.get(`a[href*="/detail/HB001"]`)
        .should("have.attr", "href")
        .and("include", "/detail/HB001");
    });
  });
  