describe("Pet Diary List", () => {
  beforeEach(() => {
    cy.login(); // custom command to authenticate

    cy.intercept("GET", "**/api/PetDiary/diaries/*", {
      statusCode: 200,
      body: {
        flag: true,
        data: {
          data: [
            {
              diary_ID: "11111111-1111-1111-1111-111111111111",
              diary_Content: "<p>This is a diary entry</p>",
              diary_Date: "2024-04-01T00:00:00Z",
              category: "Health",
              pet: {
                pet_Name: "Buddy",
                pet_Image: "/images/7764af73-250c-4aa4-a232-e54225b4240a.jpg",
              },
            },
            {
              diary_ID: "22222222-2222-2222-2222-222222222222",
              diary_Content: "<p>Another diary entry</p>",
              diary_Date: "2024-03-28T00:00:00Z",
              category: "Training",
              pet: {
                pet_Name: "Buddy",
                pet_Image: "/images/7764af73-250c-4aa4-a232-e54225b4240a.jpg",
              },
            },
          ],
          meta: {
            currentPage: 1,
            totalPages: 1,
          },
        },
      },
    }).as("fetchDiaries");

    cy.intercept("GET", "**/api/PetDiary/categories/*", {
      statusCode: 200,
      body: {
        data: {
          data: ["Health", "Training", "Grooming"],
        },
      },
    }).as("fetchCategories");

    cy.visit(
      "http://localhost:3000/customer/pet-diaries/123e4567-e89b-12d3-a456-426614174000"
    );
    cy.wait("@fetchDiaries");
    cy.wait("@fetchCategories");
  });

  it("Should load the Pet Diary List page", () => {
    cy.contains("View by topic");
    cy.contains("Buddy");
    cy.contains("Health");
    cy.contains("Training");
  });

  it("Should filter by category", () => {
    cy.intercept(
      "GET",
      "**/api/PetDiary/diaries/123e4567-e89b-12d3-a456-426614174000?category=Training&pageIndex=1&pageSize=4",
      {
        statusCode: 200,
        body: {
          flag: true,
          data: {
            data: [
              {
                diary_ID: "33333333-3333-3333-3333-333333333333",
                diary_Content: "<p>Training diary entry</p>",
                diary_Date: "2024-04-03T00:00:00Z",
                category: "Training",
                pet: {
                  pet_Name: "Buddy",
                  pet_Image: "/images/7764af73-250c-4aa4-a232-e54225b4240a.jpg",
                },
              },
            ],
            meta: {
              currentPage: 1,
              totalPages: 1,
            },
          },
        },
      }
    ).as("filterTraining");

    cy.contains("Training").click();
    cy.wait("@filterTraining");

    cy.url().should(
      "include",
      "/customer/pet-diaries/123e4567-e89b-12d3-a456-426614174000"
    );
    cy.contains("Training diary entry").should("exist");
  });

  it("Should open the Add Diary modal", () => {
    cy.contains("New Post").click();
    cy.get('[data-testid="add-diary-modal"]').should("exist");
  });

  it("Should open the Edit Diary modal", () => {
    cy.get('[aria-label="edit"]').first().click();
    cy.get('[data-testid="edit-diary-modal"]').should("exist");
  });

  it("Should delete a diary successfully", () => {
    cy.intercept(
      "DELETE",
      "**/api/PetDiary/11111111-1111-1111-1111-111111111111",
      {
        statusCode: 200,
      }
    ).as("deleteDiary");

    cy.get('[aria-label="delete"]').first().click();
    cy.get(".swal2-confirm").click();
    cy.wait("@deleteDiary");
    cy.contains("Deleted!");
  });

  it("Should show error when delete diary fails", () => {
    cy.intercept(
      "DELETE",
      "**/api/PetDiary/11111111-1111-1111-1111-111111111111",
      {
        statusCode: 500,
      }
    ).as("deleteError");

    cy.get('[aria-label="delete"]').first().click();
    cy.get(".swal2-confirm").click();
    cy.wait("@deleteError");
    cy.contains("Failed to delete the service").should("exist");
  });

  it("Should show empty message when no diaries found", () => {
    cy.intercept("GET", "**/api/PetDiary/diaries/*", {
      statusCode: 200,
      body: {
        flag: true,
        data: {
          data: [],
          meta: {
            currentPage: 1,
            totalPages: 1,
          },
        },
      },
    }).as("fetchEmpty");

    cy.visit(
      "http://localhost:3000/customer/pet-diaries/123e4567-e89b-12d3-a456-426614174000"
    );
    cy.wait("@fetchEmpty");
    cy.contains("No diaries found");
  });

  it("Should add a new diary successfully", () => {
    cy.contains("New Post").click();

    cy.intercept("POST", "**/api/PetDiary", {
      statusCode: 201,
      body: {
        flag: true,
        message: "Diary created successfully",
      },
    }).as("createDiary");

    // Open category dropdown and select "Health"
    cy.get('[data-testid="category-select"] input').click();
    cy.get("body").find('li[role="option"]').contains("Health").click();

    // Set content in Jodit WYSIWYG editor
    const diaryEntryHtml = "<p>This is a new diary entry</p>";

    cy.get(".jodit-wysiwyg[contenteditable=true]")
      .click()
      .invoke("html", diaryEntryHtml)
      .trigger("blur");

    // Optional: Confirm the textarea reflects the correct content
    cy.get(".jodit-react-container > textarea").should(
      "contain.value",
      "This is a new diary entry"
    );

    // Submit
    cy.get('[data-testid="add-diary-modal"]').within(() => {
      cy.get("button").contains("Save").click();
    });

    cy.wait("@createDiary");

    // First, wait for the SweetAlert container to appear
    cy.get(".swal2-html-container").should("be.visible");

    // Then check that it contains the correct message
    cy.get(".swal2-html-container").should(
      "contain.text",
      "Pet Diary Created Successfully!"
    );
  });

  it("Should validate add diary form", () => {
    cy.contains("New Post").click();

    cy.get('[data-testid="add-diary-modal"]').within(() => {
      cy.get("button").contains("Save").click();
    });

    cy.get(".swal2-html-container").should("be.visible");

    // Then check that it contains the correct message
    cy.get(".swal2-html-container").should(
      "contain.text",
      "The content can not be empty!"
    );
  });

  it("Should update a diary successfully", () => {
    cy.get('[aria-label="edit"]').first().click();

    cy.intercept(
      "PUT",
      "**/api/PetDiary/11111111-1111-1111-1111-111111111111",
      {
        statusCode: 200,
        body: {
          flag: true,
          message: "Diary updated successfully",
        },
      }
    ).as("updateDiary");

    cy.get('[data-testid="edit-diary-modal"]').within(() => {
      cy.get(".jodit-react-container > textarea").clear({ force: true });

      const newDiary = "<p>Updated diary entry</p>";

      cy.get(".jodit-wysiwyg[contenteditable=true]")
        .click()
        .invoke("html", newDiary)
        .trigger("blur");

      cy.get(".jodit-react-container > textarea").should(
        "contain.value",
        "Updated diary entry"
      );

      cy.get("button").contains("Save").click();
    });

    cy.wait("@updateDiary");
    cy.get(".swal2-html-container").should("be.visible");

    // Then check that it contains the correct message
    cy.get(".swal2-html-container").should(
      "contain.text",
      "Pet Diary Updated Successfully!"
    );
  });

  it("Should validate update diary form", () => {
    cy.get('[aria-label="edit"]').first().click();

    cy.get('[data-testid="edit-diary-modal"]').within(() => {
      cy.get(".jodit-react-container > textarea").clear({ force: true });
      cy.get(".jodit-wysiwyg[contenteditable=true]")
        .click()
        .invoke("html", "")
        .trigger("blur");

      cy.get("button").contains("Save").click();
    });

    cy.get(".swal2-html-container").should(
      "contain.text",
      "The content can not be empty!"
    );
  });
});
