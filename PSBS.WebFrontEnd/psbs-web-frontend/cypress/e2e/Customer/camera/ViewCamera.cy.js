describe('CameraCus Component', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.sessionStorage.setItem('token', 'fake-token');
      });
  
      cy.intercept('GET', '**/api/Camera/stream/**', (req) => {
        const cameraCode = req.url.match(/stream\/(.+?)\?/)[1];
  
        switch (cameraCode) {
          case 'valid':
            req.reply({
              statusCode: 200,
              body: {
                streamUrl: 'http://localhost:8080/live/stream.m3u8'
              }
            });
            break;
          case 'notfound':
            req.reply({ statusCode: 404, body: { message: 'Camera not found' } });
            break;
          case 'deleted':
            req.reply({ statusCode: 400, body: { message: 'Camera is deleted' } });
            break;
          case 'inactive':
            req.reply({ statusCode: 400, body: { message: 'Camera is not active' } });
            break;
          case 'noaddress':
            req.reply({ statusCode: 400, body: { message: 'Camera address not found' } });
            break;
          default:
            req.reply({ statusCode: 400, body: { message: 'Lỗi không xác định' } });
        }
      }).as('getCameraStream');
  
    });
  
   
  
    it('hiển thị lỗi "Camera not found"', () => {
      cy.get('input').type('notfound');
      cy.wait('@getCameraStream');
      cy.contains('Camera not found.').should('be.visible');
    });
  
    it('hiển thị lỗi "Camera is deleted"', () => {
      cy.get('input').type('deleted');
      cy.wait('@getCameraStream');
      cy.contains('Camera is deleted.').should('be.visible');
    });
  
    it('hiển thị lỗi "Camera is not active"', () => {
      cy.get('input').type('inactive');
      cy.wait('@getCameraStream');
      cy.contains('Camera is not active.').should('be.visible');
    });
  
    it('hiển thị lỗi "Camera address not found"', () => {
      cy.get('input').type('noaddress');
      cy.wait('@getCameraStream');
      cy.contains('Camera address not found.').should('be.visible');
    });
  
    it('báo lỗi nếu không nhập mã camera', () => {
      cy.contains('Vui lòng nhập mã camera').should('be.visible');
    });
  });
  