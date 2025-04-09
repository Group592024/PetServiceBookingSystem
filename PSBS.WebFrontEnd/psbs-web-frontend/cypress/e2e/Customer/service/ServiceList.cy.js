describe("template spec", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000/customer/services");

    cy.get('[data-testid="test-ne"]')
      .should("exist")
      .should("have.text", "Services For Your Pets");
  });
});
