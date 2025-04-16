describe("Admin Add Booking E2E Tests", () => {
  before(() => {
    // Login once before all tests with admin credentials
    cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
    cy.visit("http://localhost:3000/bookings/new");
    cy.wait(1000); // Wait for page to load
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it("should display the admin layout components", () => {
    // Verify sidebar exists
    cy.get(".sidebar").should("exist");

    // Verify content container
    cy.get(".listContainer.content").should("exist");

    // Verify page title
    cy.contains("h1", "Admin New Booking").should("be.visible");
  });

  it("should display the stepper with all steps", () => {
    // Verify stepper exists
    cy.get(".MuiStepper-root").should("exist");

    // Verify all steps are displayed
    const expectedSteps = [
      "Booking Type",
      "Booking Information",
      "Booking Details",
      "Confirm Booking",
    ];
    cy.get(".MuiStepLabel-label").each(($el, index) => {
      cy.wrap($el).should("contain.text", expectedSteps[index]);
    });

    // Verify first step is active
    cy.get(".MuiStepLabel-label").first().should("have.class", "Mui-active");
  });

  it("should require booking type selection before proceeding", () => {
    // Try to proceed without selecting a booking type
    cy.contains("button", "Next").click();

    // Verify error message
    cy.get(".swal2-popup").should("be.visible");
    cy.contains("Please select a booking type before proceeding").should(
      "be.visible"
    );

    // Close the error message
    cy.get(".swal2-confirm").click();
  });

  it("should allow selecting a booking type and proceeding to the next step", () => {
    // Select Room booking type
    cy.contains("label", "Room").click();

    // Proceed to next step
    cy.contains("button", "Next").click();

    // Verify we're on the second step
    cy.contains("h2", "Booking Information").should("be.visible");
  });

  it("should validate customer information before proceeding", () => {
    // Select Room booking type
    cy.contains("label", "Room").click();

    // Proceed to next step
    cy.contains("button", "Next").click();

    // Try to proceed without entering customer information
    cy.contains("button", "Next").click();

    // Verify error message
    cy.get(".swal2-popup").should("be.visible");
    cy.contains(
      "Please fill all input and select payment type before proceeding"
    ).should("be.visible");

    // Close the error message
    cy.get(".swal2-confirm").click();
  });

  it("should search for customer by phone number", () => {
    // Select Room booking type
    cy.contains("label", "Room").click();

    // Proceed to next step
    cy.contains("button", "Next").click();

    // Enter a valid phone number and press Enter
    cy.get("input[name='phone']").type("0919876543{enter}");

    // Wait for search to complete
    cy.wait(2000);

    // Check if customer details are populated or error is shown
    cy.get("body").then(($body) => {
      if (
        $body.find(".MuiFormHelperText-root").length > 0 &&
        $body.find(".MuiFormHelperText-root").text().includes("User not found")
      ) {
        cy.log("User not found with this phone number");
      } else {
        // Verify name field is populated
        cy.get("input[name='name']").should("not.have.value", "");
      }
    });
  });

  describe("Room Booking Flow", () => {
    beforeEach(() => {
      // Select Room booking type
      cy.contains("label", "Room").click();

      // Proceed to next step
      cy.contains("button", "Next").click();

      // Enter customer information
      cy.get("input[name='phone']").type("0919876543{enter}");
      cy.wait(2000);

      cy.contains("Payment Method")
        .closest(".MuiFormControl-root")
        .find(".MuiSelect-select")
        .click();
      cy.get(".MuiMenuItem-root").first().click();

      cy.contains("button", "Next").click();

      // If user not found, enter details manually
      cy.get("body").then(($body) => {
        if (
          $body.find(".MuiFormHelperText-root").length > 0 &&
          $body
            .find(".MuiFormHelperText-root")
            .text()
            .includes("User not found")
        ) {
          cy.get("input[name='name']").type("Test Customer");
          cy.get("input[name='address']").type("123 Test Street");
        }
      });
    });

    it("should require at least one room booking before proceeding", () => {
      // Try to proceed without adding any room bookings
      cy.contains("button", "Next").click();

      // Verify error message
      cy.get(".swal2-popup").should("be.visible");
      cy.contains("Please add at least one booking room").should("be.visible");

      // Close the error message
      cy.get(".swal2-confirm").click();
    });

    it("should allow creating room bookings", () => {
      // Select rooms and pets
      cy.contains("label", "All Rooms").click();
      cy.contains("label", "All Pets").click();

      // Create booking rooms
      cy.contains("button", "Create Booking Rooms").click();

      // Verify room booking cards are created
      cy.get(".MuiCard-root").should("have.length.at.least", 1);
    });

    it("should validate room booking details before proceeding", () => {
      // Select rooms and pets
      cy.contains("label", "All Rooms").click();
      cy.contains("label", "All Pets").click();

      // Create booking rooms
      cy.contains("button", "Create Booking Rooms").click();

      // Try to proceed without filling room details
      cy.contains("button", "Next").click();

      // Verify error message
      cy.get(".swal2-popup").should("be.visible");
      cy.contains("Please add at least one booking room").should("be.visible");

      // Close the error message
      cy.get(".swal2-confirm").click();
    });

    it("should allow filling room booking details", () => {
      // Select first room and pet
      cy.get(".MuiFormGroup-root")
        .eq(0)
        .find(".MuiFormControlLabel-root")
        .eq(1)
        .click();
      cy.get(".MuiFormGroup-root")
        .eq(1)
        .find(".MuiFormControlLabel-root")
        .eq(1)
        .click();

      // Create booking rooms
      cy.contains("button", "Create Booking Rooms").click();

      // Fill room booking details
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date(now);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const formatDate = (date) => {
        return date.toISOString().slice(0, 16);
      };

      // Instead of directly typing into the date inputs, use the force option
      cy.get("[name='start']").type(formatDate(tomorrow), { force: true });
      cy.get("[name='end']").type(formatDate(dayAfterTomorrow), {
        force: true,
      });

      // Add camera
      cy.get("[name='camera']").click();
    });

    it("should allow applying a voucher", () => {
      // Select first room and pet
      cy.get(".MuiFormGroup-root")
        .eq(0)
        .find(".MuiFormControlLabel-root")
        .eq(1)
        .click();
      cy.get(".MuiFormGroup-root")
        .eq(1)
        .find(".MuiFormControlLabel-root")
        .eq(1)
        .click();

      // Create booking rooms
      cy.contains("button", "Create Booking Rooms").click();

      // Fill room booking details
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date(now);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const formatDate = (date) => {
        return date.toISOString().slice(0, 16);
      };

      // Instead of directly typing into the date inputs, use the force option
      cy.get("[name='start']").type(formatDate(tomorrow), { force: true });
      cy.get("[name='end']").type(formatDate(dayAfterTomorrow), {
        force: true,
      });

      // Add camera
      cy.get("[name='camera']").click();

      // Try to apply a voucher
      cy.get("label").contains("Select a Voucher").parent().click();

      // Check if vouchers are available
      cy.get("body").then(($body) => {
        if ($body.find(".MuiMenuItem-root").length > 1) {
          // Select first voucher
          cy.get(".MuiMenuItem-root").eq(1).click();

          // Verify discount is applied
          cy.contains("Discount").should("be.visible");
        } else {
          cy.log("No vouchers available to test");
        }
      });
    });

    it("should proceed to confirmation step with valid room booking", () => {
      // Select first room and pet
      cy.get(".MuiFormGroup-root")
        .eq(0)
        .find(".MuiFormControlLabel-root")
        .eq(1)
        .click();
      cy.get(".MuiFormGroup-root")
        .eq(1)
        .find(".MuiFormControlLabel-root")
        .eq(1)
        .click();

      // Create booking rooms
      cy.contains("button", "Create Booking Rooms").click();

      // Fill room booking details
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date(now);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const formatDate = (date) => {
        return date.toISOString().slice(0, 16);
      };

      // Instead of directly typing into the date inputs, use the force option
      cy.get("[name='start']").type(formatDate(tomorrow), { force: true });
      cy.get("[name='end']").type(formatDate(dayAfterTomorrow), {
        force: true,
      });

      // Add camera
      cy.get("[name='camera']").click();

      // Proceed to next step
      cy.contains("button", "Next").click();

      // Verify we're on the confirmation step
      cy.contains("Booking Confirmation").should("be.visible");
      cy.contains("Customer Details").should("be.visible");
      cy.contains("Room Booking Details").should("be.visible");
      cy.contains("Payment Summary").should("be.visible");
    });
  });

  describe("Service Booking Flow", () => {
    beforeEach(() => {
      // Select Service booking type
      cy.contains("label", "Service").click();

      // Proceed to next step
      cy.contains("button", "Next").click();

      cy.get("input[name='phone']").type("0919876543{enter}");
      cy.wait(2000);

      cy.contains("Payment Method")
        .closest(".MuiFormControl-root")
        .find(".MuiSelect-select")
        .click();
      cy.get(".MuiMenuItem-root").first().click();

      cy.contains("button", "Next").click();
    });

    it("should require at least one service booking before proceeding", () => {
      // Try to proceed without adding any service bookings
      cy.contains("button", "Next").click();

      // Verify error message
      cy.get(".swal2-popup").should("be.visible");
      cy.contains("Please add at least one booking service").should(
        "be.visible"
      );

      // Close the error message
      cy.get(".swal2-confirm").click();
    });

    it("should allow creating service bookings", () => {
      // Select services and pets
      cy.contains("label", "All Services").click();
      cy.contains("label", "All Pets").click();

      // Create booking services
      cy.contains("button", "Create Booking Services").click();

      // Verify service booking cards are created
      cy.get(".MuiCard-root").should("have.length.at.least", 1);
    });

    it("should validate service booking details before proceeding", () => {
      // Select services and pets
      cy.contains("label", "All Services").click();
      cy.contains("label", "All Pets").click();

      // Create booking services
      cy.contains("button", "Create Booking Services").click();

      // Try to proceed without selecting service variants
      cy.contains("button", "Next").click();

      // Verify error message
      cy.get(".swal2-popup").should("be.visible");
      cy.contains("Please fill in all fields for each booking service").should(
        "be.visible"
      );

      // Close the error message
      cy.get(".swal2-confirm").click();
    });

    it("should allow applying a voucher to service booking", () => {
      // Select first service and pet
      cy.get(".MuiFormGroup-root")
        .eq(0)
        .find(".MuiFormControlLabel-root")
        .eq(1)
        .click();
      cy.get(".MuiFormGroup-root")
        .eq(1)
        .find(".MuiFormControlLabel-root")
        .eq(1)
        .click();

      // Create booking services
      cy.contains("button", "Create Booking Services").click();

      // Try to apply a voucher
      cy.get("label").contains("Select a Voucher").parent().click();

      // Check if vouchers are available
      cy.get("body").then(($body) => {
        if ($body.find(".MuiMenuItem-root").length > 1) {
          // Select first voucher
          cy.get(".MuiMenuItem-root").eq(1).click();

          // Verify discount is applied
          cy.contains("Discount").should("be.visible");
        } else {
          cy.log("No vouchers available to test");
        }
      });
    });

    it("should proceed to confirmation step with valid service booking", () => {
      // Select first service and pet
      cy.get(".MuiFormGroup-root")
        .eq(0)
        .find(".MuiFormControlLabel-root")
        .eq(1)
        .click();
      cy.get(".MuiFormGroup-root")
        .eq(1)
        .find(".MuiFormControlLabel-root")
        .eq(1)
        .click();

      // Create booking services
      cy.contains("button", "Create Booking Services").click();

      // Proceed to next step
      cy.contains("button", "Next").click();

      // Verify we're on the confirmation step
      cy.contains("Booking Confirmation").should("be.visible");
      cy.contains("Customer Details").should("be.visible");
      cy.contains("Service Booking Details").should("be.visible");
      cy.contains("Payment Summary").should("be.visible");
    });
  });

  describe("Booking Confirmation Step", () => {
    beforeEach(() => {
      // Navigate through all previous steps as before
      cy.contains("label", "Room").click();
      cy.contains("button", "Next").click();

      cy.get("input[name='phone']").type("0919876543{enter}");
      cy.wait(2000);

      cy.contains("Payment Method")
        .closest(".MuiFormControl-root")
        .find(".MuiSelect-select")
        .click();
      cy.get(".MuiMenuItem-root").first().click();

      cy.get("textarea[name='note']").type("Test booking note");
      cy.contains("button", "Next").click();

      cy.get(".MuiFormGroup-root")
        .eq(0)
        .find(".MuiFormControlLabel-root")
        .eq(1)
        .click();
      cy.get(".MuiFormGroup-root")
        .eq(1)
        .find(".MuiFormControlLabel-root")
        .eq(1)
        .click();

      cy.contains("button", "Create Booking Rooms").click();

      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date(now);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      const formatDate = (date) => date.toISOString().slice(0, 16);

      cy.get("[name='start']").type(formatDate(tomorrow), { force: true });
      cy.get("[name='end']").type(formatDate(dayAfterTomorrow), {
        force: true,
      });

      cy.get("[name='camera']").click();

      cy.contains("button", "Next").click();
    });

    it("should display all booking details in confirmation step", () => {
      // Wait until all async data has rendered
      cy.contains("Customer Details").should("be.visible");

      // Validate static fields
      cy.contains("Name").should("be.visible");
      cy.contains("Phone").should("be.visible");
      cy.contains("Address").should("be.visible");

      cy.contains("Room Booking Details").should("be.visible");

      // Validate payment section
      cy.contains("Payment Summary").should("be.visible");
      cy.contains("Total Amount").should("be.visible");
      cy.contains("Payment Method").should("be.visible");

      // Voucher and discount display (if applicable)
      cy.get("body").then(($body) => {
        if ($body.find("[data-testid='voucher-details']").length) {
          cy.get("[data-testid='voucher-details']").should(
            "contain.text",
            "Discount"
          );
        }
      });
    });

    it("should allow navigating back to previous steps", () => {
      cy.contains("button", "Back").click();
      cy.contains("h5", "Book Room").should("be.visible");

      cy.contains("button", "Back").click();
      cy.contains("h2", "Booking Information").should("be.visible");

      cy.contains("button", "Back").click();
      cy.contains("h2", "Choose Service").should("be.visible");
    });

    it("should attempt to submit the booking", () => {
      cy.contains("button", "Finish").click();

      cy.get("body").then(($body) => {
        if ($body.find(".swal2-popup").length > 0) {
          cy.get(".swal2-popup").should("be.visible");
          cy.get(".swal2-confirm").click();
        } else {
          cy.get(".swal2-popup", { timeout: 10000 }).should("be.visible");
          cy.get(".swal2-confirm").click();
          cy.url().should("include", "/bookings");
        }
      });
    });
  });
});
