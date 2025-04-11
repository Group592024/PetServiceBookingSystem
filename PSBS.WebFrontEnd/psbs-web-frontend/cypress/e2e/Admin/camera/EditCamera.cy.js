describe("Camera Edit Page - Admin", () => {
    const adminToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwNjAwMH0.XYZ_admin_example_token";
    const cameraId = "CAM123"; 
    const cameraData = {
      cameraId: cameraId,
      cameraType: "Outdoor", 
      cameraCode: "CAM-001",
      cameraStatus: "Active",
      rtspUrl: "rtsp://example.com/live/stream",
      cameraAddress: "123 Main St, City",
      isDeleted: false,
    };
  
    beforeEach(() => {
      cy.window().then((win) => {
        win.sessionStorage.setItem("token", adminToken);
      });
      cy.intercept("GET", `**/api/Camera/${cameraId}`, {
        statusCode: 200,
        body: { data: cameraData },
      }).as("getCamera");
  
      cy.intercept("PUT", `**/api/Camera/${cameraId}`, (req) => {
        req.reply({
          statusCode: 200,
          body: { message: "Camera cập nhật thành công!" },
        });
      }).as("updateCamera");
  
      cy.visit(`http://localhost:3000/editcamera/${cameraId}`, {
        onBeforeLoad: (win) => {
          win.sessionStorage.setItem("token", adminToken);
        },
      });
      cy.wait("@getCamera");
    });
    beforeEach(() => {
        cy.visit("http://localhost:3000/cameralist", {
          onBeforeLoad: (win) => {
            win.sessionStorage.setItem("token", adminToken);
          },
        });
        cy.visit(`http://localhost:3000/editcamera/${cameraId}`, {
          onBeforeLoad: (win) => {
            win.sessionStorage.setItem("token", adminToken);
          },
        });
        cy.wait("@getCamera");
      });
      
    it("should have responsive design", () => {
      cy.viewport("iphone-x");
      cy.contains("Edit Camera").should("be.visible");
      cy.viewport("ipad-2");
      cy.contains("Edit Camera").should("be.visible");
      cy.viewport(1280, 800);
      cy.contains("Edit Camera").should("be.visible");
    });
  
    it("should load the camera edit form correctly with prefilled data", () => {
      cy.contains("h2", "Edit Camera").should("be.visible");
  
      cy.get('input[name="cameraType"]')
        .should("be.visible")
        .and("have.value", cameraData.cameraType)
        .and("have.attr", "readonly");
      cy.get('input[name="cameraCode"]')
        .should("be.visible")
        .and("have.value", cameraData.cameraCode)
        .and("have.attr", "placeholder", "Nhập Camera Name");
      cy.get('input[name="cameraStatus"]')
        .should("be.visible")
        .and("have.value", cameraData.cameraStatus)
        .and("have.attr", "placeholder", "Nhập Camera Status");
      cy.get('input[name="rtspUrl"]')
        .should("be.visible")
        .and("have.value", cameraData.rtspUrl)
        .and("have.attr", "placeholder", "Nhập RTSP URL");
      cy.get('input[name="cameraAddress"]')
        .should("be.visible")
        .and("have.value", cameraData.cameraAddress)
        .and("have.attr", "placeholder", "Nhập Camera Address");
  
      cy.contains("button", "Save").should("be.visible");
      cy.contains("button", "Back").should("be.visible");
    });
  
    it("should show validation errors when required fields are empty", () => {
      cy.get('input[name="cameraCode"]').clear();
      cy.get('input[name="cameraStatus"]').clear();
      cy.get('input[name="rtspUrl"]').clear();
      cy.get('input[name="cameraAddress"]').clear();
  
      cy.contains("button", "Save").click();
  
      cy.get(".swal2-popup").should("be.visible").within(() => {
        cy.get(".swal2-title").should("contain.text", "Error");
        cy.get(".swal2-html-container").should("contain.text", "Vui lòng điền đầy đủ các trường bắt buộc");
      });
    });
  
    it("should successfully update the camera when the form is valid", () => {
      cy.get('input[name="cameraCode"]').clear().type("CAM-002");
      cy.get('input[name="cameraStatus"]').clear().type("Inactive");
      cy.get('input[name="rtspUrl"]').clear().type("rtsp://example.com/live/stream-updated");
      cy.get('input[name="cameraAddress"]').clear().type("456 Another St, City");
  
      cy.contains("button", "Save").click();
  
      cy.wait("@updateCamera").then((interception) => {
        expect(interception.request.method).to.equal("PUT");
        expect(interception.request.url).to.include(`/api/Camera/${cameraId}`);
        const reqBody = interception.request.body;
        expect(reqBody).to.have.property("cameraId", cameraId);
        expect(reqBody.cameraType).to.equal(cameraData.cameraType);
        expect(reqBody.cameraCode).to.equal("CAM-002");
        expect(reqBody.cameraStatus).to.equal("Inactive");
        expect(reqBody.rtspUrl).to.equal("rtsp://example.com/live/stream-updated");
        expect(reqBody.cameraAddress).to.equal("456 Another St, City");
      });
  
      cy.get(".swal2-popup")
        .should("be.visible")
        .within(() => {
          cy.get(".swal2-title").should("contain.text", "Success");
          cy.get(".swal2-html-container").should("contain.text", "Camera cập nhật thành công!");
          cy.get(".swal2-confirm").click();
        });
      cy.location("pathname", { timeout: 10000 }).should("eq", "/cameralist");
    });
  
    it("should handle update error when API returns an error", () => {
      cy.intercept("PUT", `**/api/Camera/${cameraId}`, {
        statusCode: 400,
        body: {
          message: "Cập nhật dữ liệu thất bại",
        },
      }).as("updateCameraError");
  
      cy.get('input[name="cameraCode"]').clear().type("CAM-003");
      cy.get('input[name="cameraStatus"]').clear().type("Inactive");
      cy.get('input[name="rtspUrl"]').clear().type("rtsp://example.com/live/stream-error");
      cy.get('input[name="cameraAddress"]').clear().type("789 Error St, City");
  
      cy.contains("button", "Save").click();
  
      cy.wait("@updateCameraError");
      cy.get(".swal2-popup").should("be.visible").within(() => {
        cy.get(".swal2-title").should("contain.text", "Error");
        cy.get(".swal2-html-container").should("contain.text", "Cập nhật dữ liệu thất bại");
      });
    });
  
    it("should navigate back when clicking the back button", () => {
      cy.contains("button", "Back").click();
      cy.location("pathname", { timeout: 10000 }).should("eq", "/cameralist");
    });
  });
  