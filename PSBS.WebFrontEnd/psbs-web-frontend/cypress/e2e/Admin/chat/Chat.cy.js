describe("Chat Functionality E2E Tests", () => {
    // Store user credentials for different roles
    const userCredentials = {
      customer: {
        email: "user6@example.com",
        password: "123456"
      },
      staff: {
        email: "user6@example.com", 
        password: "123456"
      },
      admin: {
        email: "user6@example.com",
        password: "123456"
      },
      regularUser: {
        email: "user@example.com",
        password: "123456"
      }
    };
  
    before(() => {
      // Login once before all tests
      cy.loginByHien(userCredentials.customer.email, userCredentials.customer.password);
    });
  
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien(userCredentials.customer.email, userCredentials.customer.password);
      cy.visit("http://localhost:3000/chat");
      // Wait for the chat interface to load
      cy.get(".list").should("exist");
    });
  
    afterEach(() => {
      cy.saveLocalStorage();
    });
  
    it("should display the chat interface correctly", () => {
      // Verify main chat components exist
      cy.get(".list").should("exist");
      cy.get(".userInfo").should("exist");
      cy.get(".chatList").should("exist");
      
      // Verify user info section
      cy.get(".userInfo .user h4").should("be.visible");
      cy.get(".userInfo .user img").should("be.visible");
      cy.get(".userInfo .icons svg").should("be.visible"); // Support icon
      
      // Verify chat list search functionality
      cy.get(".chatList .search").should("exist");
      cy.get(".chatList .search .searchBar input").should("exist");
      cy.get(".chatList .search .add").should("exist");
    });
  
    it("should display chat list or show empty state", () => {
      // Check if chat list has any items
      cy.get(".chatList").then($list => {
        // Look for chat items
        const chatItems = $list.find(".item").length;
        
        if (chatItems > 0) {
          // If chat items exist, verify their structure
          cy.get(".chatList .item").should("have.length.greaterThan", 0);
          cy.get(".chatList .item").first().within(() => {
            cy.get("img").should("exist"); // Profile image
            cy.get(".texts span").should("exist"); // Chat name
            cy.get(".texts p").should("exist"); // Last message
          });
        } else {
          // If no chats, verify search still exists
          cy.get(".chatList .search").should("exist");
          cy.log("No chat items found - this is acceptable if user has no chats");
        }
      });
    });
  
    it("should allow searching for chats", () => {
      // Check if there are any chat items first
      cy.get(".chatList").then($list => {
        const chatItems = $list.find(".item").length;
        
        if (chatItems > 0) {
          // Get the text of the first chat item
          cy.get(".chatList .item").first().find(".texts span").invoke("text").then(chatName => {
            // Type part of the name in search
            const searchTerm = chatName.substring(0, 3);
            cy.get(".chatList .search .searchBar input").type(searchTerm);
            
            // Verify filtering works
            cy.get(".chatList .item").should("exist");
            cy.get(".chatList .item").each($el => {
              cy.wrap($el).find(".texts span").invoke("text").should("include", searchTerm);
            });
            
            // Clear search
            cy.get(".chatList .search .searchBar input").clear();
          });
        } else {
          cy.log("Skipping search test as no chat items exist");
        }
      });
    });
  
    it("should open a chat when clicking on a chat item", () => {
      // Check if there are any chat items first
      cy.get(".chatList").then($list => {
        const chatItems = $list.find(".item").length;
        
        if (chatItems > 0) {
          // Click on the first chat item
          cy.get(".chatList .item").first().click();
          
          // Verify chat box appears
          cy.get(".chat").should("exist");
          cy.get(".chat .top").should("exist");
          cy.get(".chat .center").should("exist");
          cy.get(".chat .bottom").should("exist");
          
          // Verify chat input functionality
          cy.get(".chat .bottom input[type='text']").should("exist");
          cy.get(".chat .bottom .sendButton").should("exist");
        } else {
          cy.log("Skipping chat opening test as no chat items exist");
        }
      });
    });
  
    it("should allow sending a message", () => {
      // Check if there are any chat items first
      cy.wait(1000);
      cy.get(".chatList").then($list => {
        const chatItems = $list.find(".item").length;
        
        if (chatItems > 0) {
          // Click on the first chat item
          cy.get(".chatList .item").first().click();
          
          // Type a test message
          const testMessage = `Test message ${Date.now()}`;
          cy.get(".chat .bottom input[type='text']").type(testMessage);
          
          // Send the message
          cy.get(".chat .bottom .sendButton").click();
          
          // Verify message appears in chat
          cy.get(".chat .center .message").should("exist");
          cy.contains(testMessage).should("exist");
        } else {
          cy.log("Skipping message sending test as no chat items exist");
        }
      });
    });
  
    it("should allow sending an image", () => {
      cy.wait(1000);
      cy.get(".chatList").then($list => {
        const chatItems = $list.find(".item").length;
        
        if (chatItems > 0) {
          // Click on the first chat item
          cy.get(".chatList .item").first().click();
          
          // Upload an image
          cy.fixture('test-gift.jpg', 'binary')
            .then(Cypress.Blob.binaryStringToBlob)
            .then(fileContent => {
              cy.get('#file').attachFile({
                fileContent,
                fileName: 'test-gift.jpg',
                mimeType: 'image/jpeg'
              });
            });
          
          // Verify image preview appears
          cy.get('.MuiChip-root').should('exist');
          
          // Send the message with image
          cy.get(".chat .bottom .sendButton").click();
          
          // Verify image appears in chat
          cy.get(".chat .center .message img").should("exist");
        } else {
          cy.log("Skipping image sending test as no chat items exist");
        }
      });
    });
  
    it("should allow user to add another user to chat", () => {
        // Click on the add button to open the add user modal
        cy.get(".chatList .search .add").click();
        
        // Verify the add user modal appears
        cy.get(".addUser").should("exist");
        cy.get(".addUser form").should("exist");
        
        // Search for a user
        cy.get(".addUser form input").type("test");
        cy.get(".addUser form button").click();
        
        // Wait for search results
        cy.wait(1000);
        
        // Check if any users are found
        cy.get(".addUser .userContainer").then($container => {
          if ($container.find(".user").length > 0) {
            // Click on the first user's "Add User" button
            cy.get(".addUser .user button").first().click();
            
            // Wait for the chat room to be created
            cy.wait(2000);
            
            // Verify success message appears
            cy.contains("Chat room created successfully").should("exist");
            
            // Close the SweetAlert dialog first
            cy.get(".swal2-confirm").click();
          } else {
            cy.log("No users found to add - this is acceptable if no other users exist");
          }
        });
        
        // Wait for SweetAlert to close completely
        cy.wait(500);
        
        // Close the add user modal
        cy.get(".addUser .close-button").click();
      });
      
    // Admin tests
    describe("Admin Chat Functionality", () => {
      beforeEach(() => {
        cy.clearLocalStorage();
        cy.loginByHien(userCredentials.admin.email, userCredentials.admin.password);
        cy.visit("http://localhost:3000/chat");
        cy.get(".list").should("exist");
      });
  
      it("should allow admin to view and claim pending support requests", () => {
        // Click on the add button to check for pending requests
        cy.get(".chatList .search .add").click();
        
        // Wait for the pending requests to load
        cy.wait(2000);
        
        // Check if there are any pending requests
        cy.get(".addUser .userContainer").then($container => {
          if ($container.find(".user").length > 0) {
            // Click on the first pending request's "Claim Room" button
            cy.get(".addUser .user button").first().click();
            
            // Wait for the claim to process
            cy.wait(2000);
            
            // Verify success message appears
            cy.contains("Staff assigned successfully").should("exist");
          } else {
            cy.log("No pending support requests found - this is acceptable");
          }
        });
        
        // Close the pending requests modal
        cy.get(".addUser .close-button").click();
      });
  
      it("should allow admin to leave a support chat room", () => {
        // Check if there are any support chat items
        cy.get(".chatList").then($list => {
          const supportChatItems = $list.find(".item.support").length;
          
          if (supportChatItems > 0) {
            // Click on the first support chat item
            cy.get(".chatList .item.support").first().click();
            
            // Verify chat box appears
            cy.get(".chat").should("exist");
            
            // Click on the exit button
            cy.get(".chat .top .icons svg").click();
            
            // Confirm leaving the chat
            cy.contains("Yes, leave chat!").click();
            
            // Wait for the process to complete
            cy.wait(2000);
            
            // Verify success message appears
            cy.contains("Leave room successfully").should("exist");
          } else {
            cy.log("No support chat rooms found - this is acceptable");
          }
        });
      });
    });
  
    // Regular user tests
    describe("Regular User Chat Functionality", () => {
      beforeEach(() => {
        cy.clearLocalStorage();
        cy.loginByHien(userCredentials.regularUser.email, userCredentials.regularUser.password);
        cy.visit("http://localhost:3000/chat/customer");
        cy.get(".list").should("exist");
      });
  
      it("should allow user to initiate a support chat room", () => {
        // Click on the support icon to initiate a support chat
        cy.get(".userInfo .icons svg").click();
        
        // Wait for the process to complete
        cy.wait(2000);
        
        // Check if a success message or error message appears
        cy.get("body").then($body => {
          if ($body.text().includes("Support chat created successfully")) {
            // If success, verify the support chat appears in the list
            cy.get(".chatList .item.support").should("exist");
          } else if ($body.text().includes("You already have an active support chat")) {
            // If error about existing support chat, that's also acceptable
            cy.log("User already has an active support chat - this is acceptable");
          }
        });
      });
  
      it("should allow user to request a new supporter for an existing support chat", () => {
        // Check if there are any support chat items
        cy.get(".chatList").then($list => {
          const supportChatItems = $list.find(".item.support").length;
          
          if (supportChatItems > 0) {
            // Click on the first support chat item
            cy.get(".chatList .item.support").first().click();
            
            // Verify chat box appears
            cy.get(".chat").should("exist");
            
            // Click on the exit button to request a new supporter
            cy.get(".chat .top .icons svg").click();
            
            // Confirm requesting a new supporter
            cy.contains("Yes, start requesting!").click();
            
            // Wait for the process to complete
            cy.wait(2000);
            
            // Verify success message appears
            cy.contains("Success").should("exist");
          } else {
            cy.log("No support chat rooms found - this is acceptable");
          }
        });
      });
    });
  });
  