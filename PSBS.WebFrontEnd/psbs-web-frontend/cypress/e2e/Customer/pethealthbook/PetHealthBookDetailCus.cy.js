describe('Pet Health Book Detail - Customer View (via real login)', () => {
    const healthBookId = '12345-health-book-id';
    const token = 'dummy-token-123';

    const petHealthBookData = {
        data: {
            performBy: "Dr. Smith",
            visitDate: "2023-10-01T00:00:00Z",
            nextVisitDate: "2023-10-01T00:00:00Z",
            medicineIds: ["m1", "m2"],
            bookingServiceItemId: "bsi1",
        }
    };

    const medicinesData = {
        data: [
            { medicineId: "m1", medicineName: "Medicine A", treatmentId: "t1" },
            { medicineId: "m2", medicineName: "Medicine B", treatmentId: "t2" }
        ]
    };

    const treatmentsData = {
        data: [
            { treatmentId: "t1", treatmentName: "Treatment A" },
            { treatmentId: "t2", treatmentName: "Treatment B" }
        ]
    };

    const bookingServiceItemsData = {
        data: [
            { bookingServiceItemId: "bsi1", petId: "pet1" }
        ]
    };

    const petsData = {
        data: [
            { petId: "pet1", petImage: "/images/pet1.png", petName: "Buddy", dateOfBirth: "2020-01-01T00:00:00Z" }
        ]
    };

    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();

        cy.intercept('POST', '**/api/Account/Login').as('loginRequest');

        cy.visit('http://localhost:3000/login');
        cy.get('#email').should('be.visible').type('tuan0@gmail.com');
        cy.get('#password').type('1234567');
        cy.get('button[type="submit"]').click();

        cy.wait('@loginRequest').then(({ response }) => {
            expect(response.statusCode).to.equal(200);
            const token = response.body.data;
            expect(token).to.be.a('string');
            cy.window().then(win => {
                win.sessionStorage.setItem('token', token);
                win.sessionStorage.setItem('accountId', '597618bc-b68e-48cb-8cfb-e698ae1dd4d6');
            });
        });

        cy.wait(1000);
        cy.url().should('not.include', '/login');

        cy.intercept('GET', `**/api/PetHealthBook/${healthBookId}`, (req) => {
            req.reply({ statusCode: 200, body: petHealthBookData, delay: 300 });
        }).as('getPetHealthBook');

        cy.intercept('GET', `**/Medicines`, (req) => {
            req.reply({ statusCode: 200, body: medicinesData, delay: 200 });
        }).as('getMedicines');

        cy.intercept('GET', `**/api/Treatment`, (req) => {
            req.reply({ statusCode: 200, body: treatmentsData, delay: 200 });
        }).as('getTreatments');

        cy.intercept('GET', `**/api/BookingServiceItems/GetBookingServiceList`, (req) => {
            req.reply({ statusCode: 200, body: bookingServiceItemsData, delay: 100 });
        }).as('getBookingServiceItems');

        cy.intercept('GET', `**/api/pet`, (req) => {
            req.reply({ statusCode: 200, body: petsData, delay: 200 });
        }).as('getPets');

        cy.visit(`http://localhost:3000/detailcus/${healthBookId}`);
    });

    it('displays loading state then health book details', () => {
        cy.contains("Loading health record...").should('be.visible');

        cy.wait(['@getPetHealthBook', '@getMedicines', '@getTreatments', '@getBookingServiceItems', '@getPets']);

        cy.contains("Pet Health Book Details").should('be.visible');
        cy.contains("Dr. Smith").should('be.visible');
    });



    it('renders health record information correctly', () => {
        cy.wait(['@getPetHealthBook', '@getMedicines', '@getTreatments', '@getBookingServiceItems', '@getPets']);

        cy.contains("Performed By").parent().should('contain', "Dr. Smith");
        cy.contains("Visit Date").parent().should('contain', "01/10/2023");
        cy.contains("Next Visit Date").parent().should('contain', "01/10/2023");
        cy.contains("Medicines").parent().should('contain', "Medicine A, Medicine B");


    });

    it('navigates back when clicking back button', () => {
        cy.wait(['@getPetHealthBook', '@getMedicines', '@getTreatments', '@getBookingServiceItems', '@getPets']);
        cy.contains("Back").click();
        cy.url().should('not.include', `/pethealthbookdetailcus/${healthBookId}`);
    });

    it('displays medicine details table with correct content', () => {
        cy.wait(['@getPetHealthBook', '@getMedicines', '@getTreatments', '@getBookingServiceItems', '@getPets']);

        cy.get("table").within(() => {
            cy.contains("Medicine Name").should('exist');
            cy.contains("Treatment").should('exist');
            cy.get("tbody > tr").should('have.length', 2);
            cy.get("tbody > tr").first().within(() => {
                cy.contains("Medicine A");
                cy.contains("Treatment A");
            });
            cy.get("tbody > tr").last().within(() => {
                cy.contains("Medicine B");
                cy.contains("Treatment B");
            });
        });
    });
});
