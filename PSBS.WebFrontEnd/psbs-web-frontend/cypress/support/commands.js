// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//

// Native localStorage commands without external package
Cypress.Commands.add("saveLocalStorage", () => {
  cy.window().then((win) => {
    const storage = win.localStorage;
    const storageData = {};
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      storageData[key] = storage.getItem(key);
    }
    Cypress.env("localStorageData", storageData); // Store in Cypress.env instead of alias
  });
});

Cypress.Commands.add("restoreLocalStorage", () => {
  const storageData = Cypress.env("localStorageData");
  if (storageData) {
    cy.window().then((win) => {
      Object.keys(storageData).forEach((key) => {
        win.localStorage.setItem(key, storageData[key]);
      });
    });
  }
});

// Session-based login command (recommended)
Cypress.Commands.add("loginByHien", (email, password) => {
  cy.session([email, password], () => {
    cy.visit("http://localhost:3000/login");
    cy.get("#email").type(email);
    cy.get("#password").type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should("not.include", "/login");
  });
});

Cypress.Commands.add("createTestNotification", (notification) => {
  cy.request({
    method: "POST",
    url: "api/Notification",
    body: {
      notiTypeId:
        notification.type === "Booking"
          ? "22222222-2222-2222-2222-222222222222"
          : "11111111-1111-1111-1111-111111111111",
      notificationTitle: notification.title,
      notificationContent: notification.content,
      isDeleted: false,
    },
  });
});

// Add a soft delete command for cleanup
Cypress.Commands.add("softDeleteVoucher", (voucherId, token = null) => {
  const authToken =
    token ||
    Cypress.env("authToken") ||
    window.localStorage.getItem("token") ||
    window.sessionStorage.getItem("token");

  if (!authToken) {
    throw new Error("No authentication token available. Please login first.");
  }

  return cy
    .request({
      method: "DELETE",
      url: `${
        Cypress.env("API_URL") || "http://localhost:5000"
      }/api/Voucher/${voucherId}`,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      failOnStatusCode: false,
    })
    .then((response) => {
      cy.log(`Voucher deletion response: ${JSON.stringify(response.body)}`);
      return response;
    });
});

Cypress.Commands.add("deleteVoucher", (voucherCode) => {
  cy.visit("http://localhost:3000/vouchers");
  cy.wait(2000); // Wait for the page to load completely

  // Check if the voucher exists before trying to delete it
  cy.get("body").then(($body) => {
    // Check if the voucher code exists in the table
    if ($body.text().includes(voucherCode)) {
      // Find the row containing the voucher code
      cy.contains(".MuiDataGrid-cell", voucherCode)
        .parents(".MuiDataGrid-row")
        .within(() => {
          // Within this row, find the delete button
          cy.get('button[aria-label="delete"]').click();
        });

      // Confirm first deletion in the SweetAlert dialog
      cy.get(".swal2-confirm").click();

      // Wait for success message
      cy.get(".swal2-title").should("contain", "Deleted!");
      cy.get(".swal2-confirm").click();

      // Try to find the voucher again for second deletion
      cy.wait(1000); // Wait for UI to update

      cy.get("body").then(($updatedBody) => {
        if ($updatedBody.text().includes(voucherCode)) {
          cy.contains(".MuiDataGrid-cell", voucherCode)
            .parents(".MuiDataGrid-row")
            .within(() => {
              // Within this row, find the delete button
              cy.get('button[aria-label="delete"]').click();
            });

          // Confirm second deletion
          cy.get(".swal2-confirm").click();

          // Wait for success message
          cy.get(".swal2-title").should("contain", "Deleted!");
          cy.get(".swal2-confirm").click();
        } else {
          cy.log(
            `Voucher ${voucherCode} not found for second deletion - it may have been fully deleted already`
          );
        }
      });
    } else {
      cy.log(
        `Voucher ${voucherCode} not found in the table - no need to delete`
      );
    }
  });
});
// Add this to your commands.js if you don't already have it
Cypress.Commands.add("createTestVoucher", (code, name) => {
  cy.visit("http://localhost:3000/vouchers");
  cy.contains("button", "NEW").click();

  // Fill out the form fields
  cy.get('input[name="voucherName"]').type(name);
  cy.get('input[name="voucherCode"]').type(code);
  cy.get('input[name="voucherQuantity"]').type("50");
  cy.get('input[name="voucherDiscount"]').type("20");
  cy.get('input[name="voucherMaximum"]').type("500");
  cy.get('input[name="voucherMinimumSpend"]').type("100");

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 7);
  const formatDate = (date) => date.toISOString().split("T")[0];

  cy.get('input[name="voucherStartDate"]').type(formatDate(startDate));
  cy.get('input[name="voucherEndDate"]').type(formatDate(endDate));
  cy.get('input[name="voucherDescription"]').type("Test voucher for deletion");

  cy.contains("button", "Submit").click();

  // Handle potential duplicate error
  cy.get("body").then(($body) => {
    if (
      $body.text().includes("already added") ||
      $body.text().includes("already exists")
    ) {
      cy.get(".swal2-confirm").click();
    } else {
      cy.get(".swal2-confirm").click();
    }
  });
});

Cypress.Commands.add("deleteNotification", (notificationTitle) => {
  cy.visit("http://localhost:3000/notification");
  cy.wait(2000); // Wait for the page to load completely

  // Check if the notification exists before trying to delete it
  cy.get("body").then(($body) => {
    // Check if the notification title exists in the table
    if ($body.text().includes(notificationTitle)) {
      // Find the row containing the notification title
      cy.contains(".MuiDataGrid-cell", notificationTitle)
        .parents(".MuiDataGrid-row")
        .within(() => {
          // Within this row, find the delete button
          cy.get('button[aria-label="delete"]').click({ force: true });
        });

      // Handle the confirmation dialog - "Are you sure?"
      cy.get(".swal2-title").should("contain", "Are you sure?");
      cy.get(".swal2-confirm").contains("Yes, delete it!").click();

      // Now wait for the success message or any response after deletion
      cy.wait(1000);

      // Check if there's any SweetAlert dialog and close it
      cy.get("body").then(($body) => {
        if ($body.find(".swal2-container").length > 0) {
          cy.get(".swal2-confirm").click({ force: true });
        }
      });

      // Wait for UI to update
      cy.wait(2000);

      // Check if notification still exists for second deletion
      cy.get("body").then(($updatedBody) => {
        if ($updatedBody.text().includes(notificationTitle)) {
          cy.log(
            `Notification "${notificationTitle}" still exists, attempting second deletion`
          );

          // Second deletion attempt
          cy.contains(".MuiDataGrid-cell", notificationTitle)
            .parents(".MuiDataGrid-row")
            .within(() => {
              cy.get('button[aria-label="delete"]').click({ force: true });
            });

          // Handle the second confirmation dialog
          cy.get(".swal2-title").should("contain", "Are you sure?");
          cy.get(".swal2-confirm").contains("Yes, delete it!").click();

          // Close any resulting dialog
          cy.wait(1000);
          cy.get("body").then(($body) => {
            if ($body.find(".swal2-container").length > 0) {
              cy.get(".swal2-confirm").click({ force: true });
            }
          });
        } else {
          cy.log(
            `Notification "${notificationTitle}" was fully deleted on first attempt`
          );
        }
      });
    } else {
      cy.log(
        `Notification "${notificationTitle}" not found in the table - no need to delete`
      );
    }
  });
});

//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import "cypress-file-upload";

Cypress.Commands.add("login", () => {
  cy.clearLocalStorage();
  cy.clearCookies();

  cy.intercept("POST", "**/api/Account/Login").as("loginRequest");

  cy.visit("http://localhost:3000/login");

  cy.get("#email", { timeout: 10000 }).should("be.visible").type("b@gmail.com");
  cy.get("#password").type("123456");
  cy.get('button[type="submit"]').click();

  cy.wait("@loginRequest", { timeout: 15000 }).then((interception) => {
    expect(interception.response.body).to.have.property("data");
    const token = interception.response.body.data;
    expect(token).to.be.a("string");

    cy.window().then((win) => {
      win.sessionStorage.setItem("token", token);
    });
  });

  cy.url().should("not.include", "/login", { timeout: 10000 });

  cy.window().then((win) => {
    const token = win.sessionStorage.getItem("token");
    expect(token).to.not.be.null;
    expect(token).to.not.be.undefined;
  });
});

Cypress.Commands.add("loginCustomer", () => {
  cy.clearLocalStorage();
  cy.clearCookies();

  cy.intercept("POST", "**/api/Account/Login").as("loginRequest");

  cy.visit("http://localhost:3000/login");

  cy.get("#email", { timeout: 10000 }).should("be.visible").type("a@gmail.com");
  cy.get("#password").type("123456");
  cy.get('button[type="submit"]').click();

  cy.wait("@loginRequest", { timeout: 15000 }).then((interception) => {
    expect(interception.response.body).to.have.property("data");
    const token = interception.response.body.data;
    expect(token).to.be.a("string");

    cy.window().then((win) => {
      win.sessionStorage.setItem("token", token);
    });
  });

  cy.url().should("not.include", "/login", { timeout: 10000 });

  cy.window().then((win) => {
    const token = win.sessionStorage.getItem("token");
    expect(token).to.not.be.null;
    expect(token).to.not.be.undefined;
  });
});
