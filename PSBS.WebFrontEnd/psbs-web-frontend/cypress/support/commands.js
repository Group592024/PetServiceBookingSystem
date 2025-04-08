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
Cypress.Commands.add("login", (email, password) => {
  cy.session([email, password], () => {
    cy.visit("http://localhost:3000/login");
    cy.get("#email").type(email);
    cy.get("#password").type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should("not.include", "/login");
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
      url: `${Cypress.env("API_URL") || "http://localhost:5000"}/api/Voucher/${voucherId}`,
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
    if ($body.text().includes("already added") || $body.text().includes("already exists")) {
      cy.get(".swal2-confirm").click();
    } else {
      cy.get(".swal2-confirm").click();
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
