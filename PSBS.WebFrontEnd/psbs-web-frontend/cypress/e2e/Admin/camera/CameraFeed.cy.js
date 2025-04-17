describe("Camera Stream Modal Tests", () => {
    before(() => {
      cy.loginByHien("user6@example.com", "123456");
    });
  
    beforeEach(() => {
      cy.restoreLocalStorage();
      cy.loginByHien("user6@example.com", "123456");
      cy.visit("http://localhost:3000/camera");
      
      // Wait for the table to load
      cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
    });
  
    afterEach(() => {
      cy.saveLocalStorage();
    });
  
    it("should open camera stream modal when stream button is clicked", () => {
      // Find a camera with In Use status to stream
      cy.get(".MuiDataGrid-row").each(($row) => {
        const $statusCell = $row.find('[data-field="cameraStatus"]');
        if ($statusCell.text().includes("In Use")) {
          // Click the stream button
          cy.wrap($row).find('[aria-label="stream"]').click({force: true});
          
          // Verify the stream modal is displayed
          cy.get(".MuiModal-root").should("be.visible");
          cy.contains("Live Camera Feed").should("be.visible");
          
          // Break the each loop
          return false;
        }
      });
    });
  
    it("should show loading state while stream is initializing", () => {
      // Find a camera with In Use status to stream
      cy.get(".MuiDataGrid-row").each(($row) => {
        const $statusCell = $row.find('[data-field="cameraStatus"]');
        if ($statusCell.text().includes("In Use")) {
          // Click the stream button
          cy.wrap($row).find('[aria-label="stream"]').click({force: true});
          
          // Verify loading indicators are displayed
          cy.get(".MuiModal-root").within(() => {
            cy.get(".MuiCircularProgress-root").should("be.visible");
            cy.contains("Starting stream...").should("be.visible");
            cy.get(".MuiLinearProgress-root").should("be.visible");
          });
          
          // Break the each loop
          return false;
        }
      });
    });
  
    it("should close the stream modal when close button is clicked", () => {
      // Find a camera with In Use status to stream
      cy.get(".MuiDataGrid-row").each(($row) => {
        const $statusCell = $row.find('[data-field="cameraStatus"]');
        if ($statusCell.text().includes("In Use")) {
          // Click the stream button
          cy.wrap($row).find('[aria-label="stream"]').click({force: true});
          
          // Verify the modal is displayed
          cy.get(".MuiModal-root").should("be.visible");
          
          // Click the close button
          cy.get(".MuiModal-root").find("button").first().click({force: true});
          
          // Verify the modal is closed
          cy.get(".MuiModal-root").should("not.exist");
          
          // Break the each loop
          return false;
        }
      });
    });
  
  
  

  
    it("should handle HLS.js fatal errors", () => {
      // Mock the stream start API call
      cy.intercept('POST', '**/api/stream/start/*', {
        statusCode: 200,
        body: {
          flag: true,
          data: "http://test-stream-url.m3u8"
        }
      }).as('startStreamRequest');
      
      // Mock the HEAD request to the stream URL
      cy.intercept('HEAD', 'http://test-stream-url.m3u8', {
        statusCode: 200
      }).as('streamHeadRequest');
      
      // Find a camera with In Use status to stream
      cy.get(".MuiDataGrid-row").each(($row) => {
        const $statusCell = $row.find('[data-field="cameraStatus"]');
        if ($statusCell.text().includes("In Use")) {
          // Set up HLS.js mock before opening the modal
          cy.window().then((win) => {
            // Create a mock HLS class that will trigger an error
            class MockHls {
              static isSupported() { return true; }
              
              constructor() {
                this.events = {};
                
                // Simulate manifest parsed event
                setTimeout(() => {
                  if (this.events[MockHls.Events.MANIFEST_PARSED]) {
                    this.events[MockHls.Events.MANIFEST_PARSED].forEach(cb => cb());
                  }
                  
                  // Then simulate a fatal error after a short delay
                  setTimeout(() => {
                    if (this.events[MockHls.Events.ERROR]) {
                      this.events[MockHls.Events.ERROR].forEach(cb => 
                        cb(null, { fatal: true, type: "networkError" })
                      );
                    }
                  }, 1000);
                }, 500);
              }
              
              on(event, callback) {
                if (!this.events[event]) this.events[event] = [];
                this.events[event].push(callback);
              }
              
              loadSource() {}
              attachMedia() {}
              destroy() {}
            }
            
            // Add events enum to match real HLS.js
            MockHls.Events = {
              MANIFEST_PARSED: 'manifestParsed',
              ERROR: 'hlsError'
            };
            
            // Replace the real HLS with our mock
            win.Hls = MockHls;
          });
          
          // Click the stream button
          cy.wrap($row).find('[aria-label="stream"]').click({force: true});
          
          // Wait for the intercepted request
          cy.wait('@startStreamRequest');
          cy.wait('@streamHeadRequest');
          
          // Wait for the error to be displayed
          cy.get(".MuiModal-root").within(() => {
            cy.contains("Stream error occurred").should("be.visible", { timeout: 3000 });
          });
          
          // Close the modal
          cy.get(".MuiModal-root").find("button").first().click({force: true});
          
          // Break the each loop
          return false;
        }
      });
    });
  
    it("should make a stop stream request when modal is closed", () => {
      // Intercept the stream start API call
      cy.intercept('POST', '**/api/stream/start/*', {
        statusCode: 200,
        body: {
          flag: true,
          data: "http://test-stream-url.m3u8"
        }
      }).as('startStreamRequest');
      
      // Intercept the stream stop API call
      cy.intercept('POST', '**/api/stream/stop/*').as('stopStreamRequest');
      
      // Mock the HEAD request to the stream URL
      cy.intercept('HEAD', 'http://test-stream-url.m3u8', {
        statusCode: 200
      });
      
      // Find a camera with In Use status to stream
      cy.get(".MuiDataGrid-row").each(($row) => {
        const $statusCell = $row.find('[data-field="cameraStatus"]');
        if ($statusCell.text().includes("In Use")) {
          // Click the stream button
          cy.wrap($row).find('[aria-label="stream"]').click({force: true});
          
          // Wait for the start stream request
          cy.wait('@startStreamRequest');
          
          // Close the modal
          cy.get(".MuiModal-root").find("button").first().click({force: true});
          
          // Verify the stop stream request was made
          cy.wait('@stopStreamRequest');
          
          // Break the each loop
          return false;
        }
      });
    });
  });
  