describe("Camera List Page", () => {
    const adminToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwNjAwMH0.XYZ_admin_example_token";

    const dummyCameras = [
        {
            cameraId: "cam1",
            cameraCode: "CAM-001",
            cameraType: "Outdoor",
            cameraStatus: "Active",
            rtspUrl: "rtsp://example.com/live/stream1",
            cameraAddress: "123 Main St",
            isDeleted: false,
        },
        {
            cameraId: "cam2",
            cameraCode: "CAM-002",
            cameraType: "Indoor",
            cameraStatus: "Inactive",
            rtspUrl: "rtsp://example.com/live/stream2",
            cameraAddress: "456 Side St",
            isDeleted: true,
        },
    ];

    beforeEach(() => {
        cy.window().then((win) => {
            win.sessionStorage.setItem("token", adminToken);
        });

        cy.intercept("GET", "**/api/Camera/all", {
            statusCode: 200,
            body: dummyCameras,
        }).as("getCameras");

        cy.visit("http://localhost:3000/cameralist", {
            onBeforeLoad: (win) => {
                win.sessionStorage.setItem("token", adminToken);
            },
        });
    });

    it("should load the camera list page correctly", () => {
        cy.contains("h2", "Camera List").should("be.visible");
        cy.contains("button", "New").should("be.visible");
        cy.wait("@getCameras");

        cy.wait(500);

        cy.get(".MuiDataGrid-cell").contains("CAM-001").should("be.visible");
        cy.get(".MuiDataGrid-cell").contains("Outdoor").should("be.visible");
        cy.get(".MuiDataGrid-cell").contains("Active").should("be.visible");
        cy.get(".MuiDataGrid-cell").contains("123 Main St").should("be.visible");
        cy.get(".MuiDataGrid-cell").contains("CAM-002").should("be.visible");
        cy.get(".MuiDataGrid-cell").contains("Indoor").should("be.visible");
        cy.get(".MuiDataGrid-cell").contains("Inactive").should("be.visible");
        cy.get(".MuiDataGrid-cell").contains("456 Side St").should("be.visible");
        cy.get(".MuiDataGrid-cell").contains("No").should("be.visible");
        cy.get(".MuiDataGrid-cell").contains("Yes").should("be.visible");
    });


    it("should navigate to add camera page when clicking New button", () => {
        cy.contains("button", "New").click();
        cy.location("pathname").should("eq", "/addcamera");
    });

    it("should navigate to edit camera page when clicking Edit icon", () => {
        cy.wait("@getCameras");

        cy.get('[data-rowindex="0"]')
          .find('[href*="/editcamera/"]')
          .first()
          .click({ force: true });
        
    
        cy.location("pathname").should("include", "/editcamera/cam1");
    });

    it("should navigate to camera detail page when clicking Detail icon", () => {
        cy.wait("@getCameras");
        cy.get('[data-rowindex="0"]')
            .find("a[href*='/detailcamera/']")
            .first()
            .click();

        cy.location("pathname").should("eq", "/detailcamera/cam1");
    });

    it("should handle delete action correctly (soft delete)", () => {
        cy.wait("@getCameras");
    
        cy.intercept("DELETE", "**/api/Camera/cam1", (req) => {
            req.reply({
                statusCode: 200,
                body: {
                    message: "Camera soft-deleted successfully",
                },
            });
        }).as("deleteCamera");
    
        cy.get('[data-rowindex="0"]')
            .find("button")
            .filter((index, button) => {
                return (
                    button.innerHTML.includes("DeleteIcon") ||
                    button.getAttribute("aria-label") === "error"
                );
            })
            .first()
            .click();
    
        cy.get(".swal2-popup").should("be.visible").within(() => {
            cy.get(".swal2-confirm").click();
        });
    
        cy.wait("@deleteCamera");
    
        cy.get(".swal2-popup").should("be.visible").within(() => {
            cy.get(".swal2-title").should("contain.text", "Deleted!");
            cy.get(".swal2-html-container").should(
                "contain.text",
                "has been soft-deleted"
            );
            cy.get(".swal2-confirm").click();
        });
    
        
    });
    
});
