describe("Gift List E2E Tests", () => {
    before(() => {
      // Login once before all tests
      cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
    });
    
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("se.rn.a.vill.ar.es@gmail.com", "minh1234");
      
      // Mock the API response for gifts
      cy.intercept('GET', 'http://localhost:5050/Gifts/admin-gift-list', {
        statusCode: 200,
        body: {
          flag: true,
          data: [
            {
              giftId: '1',
              giftName: 'Premium Pet Food',
              giftCode: 'FOOD001',
              giftImage: '/images/gifts/pet-food.jpg',
              giftStatus: false
            },
            {
              giftId: '2',
              giftName: 'Pet Toy Bundle',
              giftCode: 'TOY002',
              giftImage: '/images/gifts/pet-toys.jpg',
              giftStatus: true
            }
          ]
        }
      }).as('getGifts');
      
      cy.visit("http://localhost:3000/gifts");
      cy.wait('@getGifts');
    });
    
    afterEach(() => {
      cy.saveLocalStorage();
    });
    
    it("should display the gift list correctly", () => {
      // Verify table structure
      cy.get(".MuiDataGrid-root").should("exist");
      cy.get(".MuiDataGrid-virtualScrollerRenderZone").should("exist");
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
      
      // Verify UI elements
      cy.contains("button", "New").should("be.visible");
      cy.contains("button", "History").should("be.visible");
      
      // Verify column headers
      const expectedHeaders = [
        "ID",
        "Gift Name",
        "Gift Code",
        "Active",
        "Action"
      ];
      
      cy.get(".MuiDataGrid-columnHeaderTitle").each(($el, index) => {
        cy.wrap($el).should("contain.text", expectedHeaders[index]);
      });
    });
    
    it("should display gift data in the table", () => {
      // Check if the table has any rows
      cy.get(".MuiDataGrid-virtualScrollerRenderZone").then(($zone) => {
        const rowCount = $zone.find(".MuiDataGrid-row").length;
        if (rowCount > 0) {
          // Table has rows
          cy.log("Table has data");
          cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
          
          // Verify first row data
          cy.get(".MuiDataGrid-row").first().within(() => {
            cy.contains("Premium Pet Food").should("exist");
            cy.contains("FOOD001").should("exist");
            cy.get(".MuiChip-label").contains("Active").should("exist");
          });
        } else {
          // Table is empty
          cy.log("Table is empty");
          cy.contains("No rows").should("be.visible");
        }
      });
    });
    
    it("should navigate to create new gift page when clicking New button", () => {
      cy.contains("button", "New").click();
      cy.url().should("include", "/gifts/new");
    });
    
    it("should navigate to redeem history page when clicking History button", () => {
      cy.contains("button", "History").click();
      cy.url().should("include", "/redeemHistory");
    });
    
    it("should show action buttons for each gift", () => {
      cy.get(".MuiDataGrid-row").first().within(() => {
        // Check if all action buttons exist
        cy.get("[aria-label='info']").should("exist");
        cy.get("[aria-label='edit']").should("exist");
        cy.get("[aria-label='delete']").should("exist");
      });
    });
    
    it("should navigate to gift detail page when clicking info button", () => {
      cy.get(".MuiDataGrid-row").first().within(() => {
        cy.get("[aria-label='info']").click();
      });
      cy.url().should("include", "/gifts/detail/");
    });
    
    it("should navigate to gift update page when clicking edit button", () => {
      cy.get(".MuiDataGrid-row").first().within(() => {
        cy.get("[aria-label='edit']").click();
      });
      cy.url().should("include", "/gifts/update/");
    });
    
    it("should show confirmation dialog when clicking delete button", () => {
      // Intercept the delete request
      cy.intercept('DELETE', 'http://localhost:5050/Gifts/*', {
        statusCode: 200,
        body: {
          flag: true,
          message: "Gift deleted successfully!"
        }
      }).as('deleteGift');
      
      cy.get(".MuiDataGrid-row").first().within(() => {
        cy.get("[aria-label='delete']").click();
      });
      
      // Verify the confirmation dialog appears
      cy.get(".swal2-popup").should("be.visible");
      cy.get(".swal2-title").should("contain", "Are you sure?");
      cy.get(".swal2-confirm").should("contain", "Yes, delete it!");
      
      // Confirm deletion
      cy.get(".swal2-confirm").click();
      cy.wait('@deleteGift');
    });
  });
  