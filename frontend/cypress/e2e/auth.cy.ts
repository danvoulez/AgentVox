describe('Autenticação', () => {
  beforeEach(() => {
    // Interceptar chamadas para a API de autenticação
    cy.intercept('POST', '**/auth/v1/token?grant_type=password').as('loginRequest');
    cy.intercept('POST', '**/auth/v1/signup').as('signupRequest');
  });

  it('deve exibir a página de login corretamente', () => {
    cy.visit('/auth/login');
    
    cy.contains('h2', 'AgentVox').should('be.visible');
    cy.contains('Entre na sua conta para continuar').should('be.visible');
    
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').contains('Entrar').should('be.visible');
    
    cy.contains('a', 'Esqueceu sua senha?').should('be.visible');
    cy.contains('a', 'Cadastre-se').should('be.visible');
  });

  it('deve validar os campos obrigatórios no login', () => {
    cy.visit('/auth/login');
    
    // Tentar submeter o formulário vazio
    cy.get('button[type="submit"]').click();
    
    // Verificar mensagem de erro
    cy.contains('Campos obrigatórios').should('be.visible');
    cy.contains('Por favor, preencha todos os campos.').should('be.visible');
  });

  it('deve realizar login com credenciais válidas', () => {
    // Mock da resposta de login bem-sucedido
    cy.intercept('POST', '**/auth/v1/token?grant_type=password', {
      statusCode: 200,
      body: {
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      },
    }).as('loginSuccess');
    
    cy.visit('/auth/login');
    
    // Preencher e submeter o formulário
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Verificar redirecionamento após login
    cy.wait('@loginSuccess');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('deve exibir erro quando login falhar', () => {
    // Mock da resposta de login falho
    cy.intercept('POST', '**/auth/v1/token?grant_type=password', {
      statusCode: 400,
      body: {
        error: 'invalid_grant',
        error_description: 'Invalid login credentials',
      },
    }).as('loginFailure');
    
    cy.visit('/auth/login');
    
    // Preencher e submeter o formulário
    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Verificar mensagem de erro
    cy.wait('@loginFailure');
    cy.contains('Erro ao fazer login').should('be.visible');
  });

  it('deve navegar para o formulário de cadastro a partir do login', () => {
    cy.visit('/auth/login');
    cy.contains('a', 'Cadastre-se').click();
    cy.url().should('include', '/auth/signup');
  });

  it('deve criar uma conta com informações válidas', () => {
    // Mock da resposta de cadastro bem-sucedido
    cy.intercept('POST', '**/auth/v1/signup', {
      statusCode: 200,
      body: {
        user: {
          id: 'new-user-id',
          email: 'new@example.com',
        },
        session: null,
      },
    }).as('signupSuccess');
    
    cy.visit('/auth/signup');
    
    // Preencher e submeter o formulário
    cy.get('input[type="email"]').type('new@example.com');
    cy.get('input[type="password"]').first().type('password123');
    cy.get('input[type="password"]').last().type('password123');
    cy.get('button[type="submit"]').click();
    
    // Verificar redirecionamento após cadastro
    cy.wait('@signupSuccess');
    cy.url().should('include', '/auth/verify-email');
  });

  it('deve validar senhas diferentes no cadastro', () => {
    cy.visit('/auth/signup');
    
    // Preencher com senhas diferentes
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').first().type('password123');
    cy.get('input[type="password"]').last().type('differentpassword');
    cy.get('button[type="submit"]').click();
    
    // Verificar mensagem de erro
    cy.contains('Senhas não coincidem').should('be.visible');
  });
});
