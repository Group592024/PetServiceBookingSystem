describe('Camera Creation Page - Admin', () => {
    const adminToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwNjAwMH0.XYZ_admin_example_token';
    beforeEach(() => {
        cy.window().then((win) => {
            win.sessionStorage.setItem("token", adminToken);
        });
        cy.intercept("POST", "**/api/Camera/create", (req) => {
            req.reply({
                statusCode: 200,
                body: {
                    message: "Camera created successfully",
                },
            });
        }).as("createCamera");
        cy.visit("http://localhost:3000/addcamera", {
            onBeforeLoad: (win) => {
                win.sessionStorage.setItem("token", adminToken);
            },
        });
    });
    it("should have responsive design", () => {
        cy.viewport("iphone-x");
        cy.contains("Create Camera").should("be.visible");
        cy.viewport("ipad-2");
        cy.contains("Create Camera").should("be.visible");
        cy.viewport(1280, 800);
        cy.contains("Create Camera").should("be.visible");
    });
    it("should load the camera creation form correctly", () => {
        cy.contains("h2", "Create Camera").should("be.visible");
        cy.get('input[name="cameraType"]')
            .should("be.visible")
            .and("have.attr", "placeholder", "Enter Camera Type");
        cy.get('input[name="cameraCode"]')
            .should("be.visible")
            .and("have.attr", "placeholder", "Enter Camera Name");
        cy.get('input[name="cameraStatus"]')
            .should("be.visible")
            .and("have.attr", "placeholder", "Enter Camera Status");
        cy.get('input[name="rtspUrl"]')
            .should("be.visible")
            .and("have.attr", "placeholder", "Enter RTSP URL");
        cy.get('input[name="cameraAddress"]')
            .should("be.visible")
            .and("have.attr", "placeholder", "Enter Camera Address");
        cy.contains("button", "Create").should("be.visible");
        cy.contains("button", "Back").should("be.visible");
    });

    it("should show validation errors when submitting empty form", () => {
        cy.contains("button", "Create").click();
        cy.get('.swal2-popup').should('be.visible')
            .within(() => {
                cy.get('.swal2-title').should('contain.text', 'Error');
                cy.get('.swal2-html-container').should('contain.text', 'Please fill in all required fields');
            });
    });

    it("should successfully create a camera when form is valid", () => {
        cy.get('input[name="cameraType"]').type("Outdoor");
        cy.get('input[name="cameraCode"]').type("CAM-001");
        cy.get('input[name="cameraStatus"]').type("Active");
        cy.get('input[name="rtspUrl"]').type("rtsp://example.com/live/stream");
        cy.get('input[name="cameraAddress"]').type("123 Main St, City");
        cy.contains("button", "Create").click();
        cy.wait("@createCamera").then((interception) => {
            expect(interception.request.method).to.equal("POST");
            expect(interception.request.url).to.include("/api/Camera/create");
            const reqBody = interception.request.body;
            expect(reqBody).to.have.property("cameraId");
            expect(reqBody.cameraType).to.equal("Outdoor");
            expect(reqBody.cameraCode).to.equal("CAM-001");
            expect(reqBody.cameraStatus).to.equal("Active");
            expect(reqBody.rtspUrl).to.equal("rtsp://example.com/live/stream");
            expect(reqBody.cameraAddress).to.equal("123 Main St, City");
        });
        cy.get('.swal2-popup').should('be.visible').within(() => {
            cy.get('.swal2-confirm').click(); 
        });
        cy.location('pathname', { timeout: 10000 }).should('eq', '/cameralist');
    });

    it("should handle duplicate camera error when creating a camera", () => {
        cy.intercept("POST", "**/api/Camera/create", {
            statusCode: 400,
            body: {
                message: "Camera with this code already exists",
            },
        }).as("createCameraError");
        cy.get('input[name="cameraType"]').type("Indoor");
        cy.get('input[name="cameraCode"]').type("CAM-001");
        cy.get('input[name="cameraStatus"]').type("Inactive");
        cy.get('input[name="rtspUrl"]').type("rtsp://example.com/live/stream2");
        cy.get('input[name="cameraAddress"]').type("456 Another St, City");
        cy.contains("button", "Create").click();
        cy.wait("@createCameraError");
        cy.get('.swal2-popup').should('be.visible')
            .within(() => {
                cy.get('.swal2-title').should('contain.text', 'Error');
                cy.get('.swal2-html-container').should('contain.text', 'Camera with this code already exists');
            });
    });

    it("should navigate back when clicking back button", () => {
        cy.visit("http://localhost:3000/cameralist", {
            onBeforeLoad: (win) => {
                win.sessionStorage.setItem("token", adminToken);
            },
        });
        cy.visit("http://localhost:3000/addcamera", {
            onBeforeLoad: (win) => {
                win.sessionStorage.setItem("token", adminToken);
            },
        });
        cy.contains("button", "Back").click();
        cy.location("pathname", { timeout: 10000 }).should("eq", "/cameralist");
    });

});
