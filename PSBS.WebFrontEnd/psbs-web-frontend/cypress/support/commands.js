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
