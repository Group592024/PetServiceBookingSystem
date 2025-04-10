describe('Camera Detail Page', () => {
    const adminToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwNjAwMH0.XYZ_admin_example_token';
  
    beforeEach(() => {
      cy.window().then((win) => {
        win.sessionStorage.setItem("token", adminToken);
      });
  
      cy.intercept("GET", "**/api/Camera/*", {
        statusCode: 200,
        body: {
          data: {
            cameraType: "Indoor",
            cameraCode: "CAM-002",
            cameraStatus: "Active",
            rtspUrl: "rtsp://example.com/live/stream",
            cameraAddress: "789 Some St, City",
            isDeleted: false,
          },
        },
      }).as("getCameraDetail");
    });
  
    it("should display loading state and then render camera detail", () => {
      cy.visit("http://localhost:3000/detailcamera/sample-camera-id", {
        onBeforeLoad: (win) => {
          win.sessionStorage.setItem("token", adminToken);
        },
      });
  
      cy.contains("Loading...").should("be.visible");
      cy.wait("@getCameraDetail");
      cy.contains("Camera Detail").should("be.visible");
      cy.get('input[disabled]').should("have.length", 6);
    });
  
    it("should display correct camera detail data", () => {
      cy.visit("http://localhost:3000/detailcamera/sample-camera-id", {
        onBeforeLoad: (win) => {
          win.sessionStorage.setItem("token", adminToken);
        },
      });
      cy.wait("@getCameraDetail");
  
      cy.get('input[disabled]').eq(0).should("have.value", "Indoor"); 
      cy.get('input[disabled]').eq(1).should("have.value", "CAM-002"); 
      cy.get('input[disabled]').eq(2).should("have.value", "Active"); 
      cy.get('input[disabled]').eq(3).should("have.value", "rtsp://example.com/live/stream");
      cy.get('input[disabled]').eq(4).should("have.value", "789 Some St, City"); 
      cy.get('input[disabled]').eq(5).should("have.value", "Not Deleted"); 
    });
  
    it("should navigate back when clicking back button", () => {
      cy.visit("http://localhost:3000/cameralist", {
        onBeforeLoad: (win) => {
          win.sessionStorage.setItem("token", adminToken);
        },
      });
      cy.visit("http://localhost:3000/detailcamera/sample-camera-id", {
        onBeforeLoad: (win) => {
          win.sessionStorage.setItem("token", adminToken);
        },
      });
      cy.wait("@getCameraDetail");
      cy.contains("button", "Back").click();
      cy.location("pathname", { timeout: 10000 }).should("eq", "/cameralist");
    });
  });
  