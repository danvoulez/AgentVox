// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/auth/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Comando para usar o simulador de autenticação em testes
Cypress.Commands.add('loginByAuth', (email, password) => {
  cy.log(`Logging in as ${email}`);
  
  // Simulação de autenticação com Supabase
  cy.intercept('POST', '**/auth/v1/token?grant_type=password', {
    statusCode: 200,
    body: {
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token',
      user: {
        id: 'test-user-id',
        email,
      },
    },
  }).as('loginSuccess');

  cy.visit('/auth/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.wait('@loginSuccess');
});

// Comando para simular um usuário autenticado como admin
Cypress.Commands.add('loginAsAdmin', () => {
  cy.loginByAuth('admin@example.com', 'admin-password');
  
  // Simulação da resposta para verificação de função admin
  cy.intercept('GET', '**/rest/v1/user_roles*', {
    statusCode: 200,
    body: [{
      user_id: 'test-user-id',
      role: 'admin',
    }],
  }).as('adminRoleCheck');
});

// Comando para limpar a sessão
Cypress.Commands.add('logout', () => {
  cy.intercept('POST', '**/auth/v1/logout', {
    statusCode: 200,
    body: {},
  }).as('logoutSuccess');
  
  cy.visit('/');
  // Supondo que temos um botão ou menu para logout
  cy.get('[data-cy="logout-button"]').click();
  cy.wait('@logoutSuccess');
});

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Declaração dos tipos para IntelliSense
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      loginByAuth(email: string, password: string): Chainable<void>;
      loginAsAdmin(): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}
