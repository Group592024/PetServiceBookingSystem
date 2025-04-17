describe("Customer Add Booking E2E Tests", () => {
  before(() => {
    // Login once before all tests with customer credentials
    cy.loginByHien("linhdo@gmail.com", "linhlinh99");
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.loginByHien("linhdo@gmail.com", "linhlinh99");
    cy.visit("http://localhost:3000/customer/bookings/new");
    cy.wait(1000); // Wait for page to load
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it("should display the stepper with all steps", () => {
    // Verify stepper exists
    cy.get(".MuiStepper-root").should("exist");

    // Verify all steps are displayed with the correct names
    const expectedSteps = [
      "Booking Type",
      "Booking Details",
      "Booking Information",
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

    // Verify we're on the second step (Booking Details for rooms)
    cy.contains("h5", "Book Rooms").should("be.visible");
  });

  it("should validate payment method selection before proceeding", () => {
    // Select Room booking type
    cy.contains("label", "Room").click();

    // Proceed to next step
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

    // Fill in the date inputs
    cy.get("[name='start']").type(formatDate(tomorrow), { force: true });
    cy.get("[name='end']").type(formatDate(dayAfterTomorrow), {
      force: true,
    });
    // Try to proceed without selecting payment method
    cy.contains("button", "Next").click();
    // Select payment method
    cy.contains("Payment Method")
      .closest(".MuiFormControl-root")
      .find(".MuiSelect-select")
      .click();
    cy.get(".MuiMenuItem-root").first().click();

    // Add a note
    cy.get("textarea[name='note']").type("Special instructions for my booking");

    // Proceed to next step
    cy.contains("button", "Next").click();
  });

  describe("Room Booking Flow", () => {
    beforeEach(() => {
      // Select Room booking type
      cy.contains("label", "Room").click();
      // Proceed to next step
      cy.contains("button", "Next").click();
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

      // Fill in the date inputs
      cy.get("[name='start']").type(formatDate(tomorrow), { force: true });
      cy.get("[name='end']").type(formatDate(dayAfterTomorrow), {
        force: true,
      });

      // Add camera
      cy.get("[name='camera']").click();

      cy.contains("button", "Next").click();
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

      // Fill in the date inputs
      cy.get("[name='start']").type(formatDate(tomorrow), { force: true });
      cy.get("[name='end']").type(formatDate(dayAfterTomorrow), {
        force: true,
      });
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
    cy.contains("button", "Next").click();
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

      // Fill in the date inputs
      cy.get("[name='start']").type(formatDate(tomorrow), { force: true });
      cy.get("[name='end']").type(formatDate(dayAfterTomorrow), {
        force: true,
      });

      // Proceed to next step
      cy.contains("button", "Next").click();

      cy.contains("Booking Information").should("be.visible");
      // Select payment method
    cy.contains("Payment Method")
    .closest(".MuiFormControl-root")
    .find(".MuiSelect-select")
    .click();
  cy.get(".MuiMenuItem-root").first().click();
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

    it("should allow selecting booking date and time", () => {
      // Set booking date and time
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0);

      const formatDate = (date) => {
        return date.toISOString().slice(0, 16);
      };

      cy.get("input[type='datetime-local']").type(formatDate(tomorrow), {
        force: true,
      });
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

    it("should allow applying a voucher to service booking", () => {
        // Set booking date and time
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0);

      const formatDate = (date) => {
        return date.toISOString().slice(0, 16);
      };

      cy.get("input[type='datetime-local']").type(formatDate(tomorrow), {
        force: true,
      });

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

      // Search for a voucher by code
      cy.get("label").contains("Select a Voucher").parent().click();
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
        // Set booking date and time
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0);

      const formatDate = (date) => {
        return date.toISOString().slice(0, 16);
      };

      cy.get("input[type='datetime-local']").type(formatDate(tomorrow), {
        force: true,
      });
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
      cy.contains("Booking Information").should("be.visible");
      // Select payment method
    cy.contains("Payment Method")
    .closest(".MuiFormControl-root")
    .find(".MuiSelect-select")
    .click();
    cy.get(".MuiMenuItem-root").first().click();
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
      // Navigate through all previous steps
      cy.contains("label", "Room").click();
      cy.contains("button", "Next").click();


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

      const formatDate = (date) => date.toISOString().slice(0, 16);

      cy.get("[name='start']").type(formatDate(tomorrow), { force: true });
      cy.get("[name='end']").type(formatDate(dayAfterTomorrow), {
        force: true,
      });

      // Proceed to next step
      cy.contains("button", "Next").click();
      // Select payment method
      cy.contains("Payment Method")
        .closest(".MuiFormControl-root")
        .find(".MuiSelect-select")
        .click();
      cy.get(".MuiMenuItem-root").first().click();

      // Add a note
      cy.get("textarea[name='note']").type("Test booking note");
      cy.contains("button", "Next").click();
    });

    it("should display all booking details in confirmation step", () => {
      // Wait until all async data has rendered
      cy.contains("Customer Details").should("be.visible");

      // Validate customer information section
      cy.contains("Name").should("be.visible");
      cy.contains("Phone").should("be.visible");
      cy.contains("Address").should("be.visible");
      cy.contains("Payment Method").should("be.visible");
      cy.contains("Special Notes").should("be.visible");
      cy.contains("Test booking note").should("be.visible");

      // Validate room booking details section
      cy.contains("Room Booking Details").should("be.visible");
      cy.contains("Pet:").should("be.visible");
      cy.contains("Camera:").should("be.visible");

      // Validate payment summary section
      cy.contains("Payment Summary").should("be.visible");
      cy.contains("Subtotal").should("be.visible");
      cy.contains("Total Amount").should("be.visible");

      // Check for voucher details if applied
      cy.get("body").then(($body) => {
        if ($body.text().includes("Discount")) {
          cy.contains("Discount").should("be.visible");
        }
      });
    });

    it("should allow navigating back to previous steps", () => {
        
      cy.contains("button", "Back").click();
      cy.contains("h2", "Booking Information").should("be.visible");
      
      cy.contains("button", "Back").click();
      cy.contains("Book Rooms").should("be.visible");

      cy.contains("button", "Back").click();
      cy.contains("h2", "Choose Service").should("be.visible");
    });

    it("should attempt to submit the booking", () => {
      cy.contains("button", "Finish").click();

      // Handle success or error response
      cy.get("body").then(($body) => {
        if ($body.find(".swal2-popup").length > 0) {
          // If there's an error or confirmation popup
          cy.get(".swal2-popup").should("be.visible");
          cy.get(".swal2-confirm").click();
        } else {
          // Wait for success message
          cy.get(".swal2-popup", { timeout: 10000 }).should("be.visible");
          cy.get(".swal2-confirm").click();

          // Should redirect to bookings list or confirmation page
          cy.url().should("include", "/customer/bookings");
        }
      });
    });
  });
});
