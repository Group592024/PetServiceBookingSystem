// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
// Handle JWT-related uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
    // Return false to prevent Cypress from failing the test if the error is related to JWT
    if (err.message.includes('Invalid token') || 
        err.message.includes('JWT') || 
        err.message.includes('Unauthorized')) {
      return false;
    }
    // For other errors, let Cypress handle them normally
    return true;
  });
  
  