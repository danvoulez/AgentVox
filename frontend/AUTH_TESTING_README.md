# Autenticação e Testes do AgentVox

## Scripts de Manutenção

Este diretório contém scripts para manutenção do sistema de autenticação e testes:

- `verify-auth-components.sh`: Verifica se todos os componentes necessários para a autenticação estão presentes
- `fix-auth-and-testing-errors.sh`: Corrige erros comuns nos componentes de autenticação e testes
- `run-all-tests.sh`: Executa todos os testes unitários e E2E 
- `fix-all-errors.sh`: Script abrangente para corrigir vários problemas de TypeScript
- `fix-more-errors.sh`: Corrige problemas de tipos em arquivos específicos
- `fix-remaining-errors.sh`: Corrige erros residuais após as correções principais

## Executando os Testes

Para executar os testes:

1. Primeiro, verifique a integridade dos componentes de autenticação:
   ```bash
   ./verify-auth-components.sh
   ```

2. Se necessário, corrija os problemas encontrados:
   ```bash
   ./fix-auth-and-testing-errors.sh
   ```

3. Execute os testes:
   ```bash
   ./run-all-tests.sh
   ```

## Estrutura de Autenticação

A autenticação no AgentVox é baseada em Supabase e inclui:

1. **Cliente Supabase**: Configurado em `src/utils/auth/supabase.ts`
2. **Contexto de Autenticação**: Implementado em `src/contexts/AuthContext.tsx`
3. **Componentes de Autenticação**:
   - Formulário de Login: `src/components/Auth/LoginForm.tsx`
   - Formulário de Cadastro: `src/components/Auth/SignupForm.tsx`
   - Rota Protegida: `src/components/Auth/ProtectedRoute.tsx`
4. **Middleware**: Configurado em `src/middleware.ts`
5. **Páginas de Autenticação**:
   - Login: `src/pages/auth/login.tsx`
   - Cadastro: `src/pages/auth/signup.tsx`
   - Recuperação de Senha: `src/pages/auth/forgot-password.tsx`
   - Redefinição de Senha: `src/pages/auth/reset-password.tsx`

## Estrutura de Testes

Os testes são organizados em:

1. **Testes Unitários**: Usando Jest e Testing Library
   - Utilitários: `src/utils/**/__tests__/*.test.ts`
   - Componentes: `src/components/**/__tests__/*.test.tsx`
   - Contextos: `src/contexts/__tests__/*.test.tsx`

2. **Testes E2E**: Usando Cypress
   - Fluxos de autenticação: `cypress/e2e/auth.cy.ts`

## Guia de Testes Manuais para Componentes de Autenticação Refatorados

Este guia detalha os procedimentos para testar manualmente os componentes de autenticação refatorados no AgentVox. Use estes testes para verificar se todas as funcionalidades estão operando conforme esperado após as refatorações.

### 1. Formulário de Login (LoginForm)

#### Validação de Campos
- [ ] **Email vazio**: Submeta o formulário sem preencher o email. Verifique se aparece a mensagem "Email é obrigatório"
- [ ] **Email inválido**: Digite um email em formato incorreto (ex: "usuarioteste.com"). Verifique se aparece a mensagem "Formato de email inválido"
- [ ] **Senha vazia**: Digite apenas o email e submeta. Verifique se aparece a mensagem "Senha é obrigatória"
- [ ] **Digitação de campo**: Verifique se ao digitar em um campo com erro, a mensagem de erro desaparece

#### Processo de Login
- [ ] **Login com credenciais inválidas**: Tente fazer login com email e senha que não existem. Verifique se a mensagem de erro é exibida corretamente
- [ ] **Login com credenciais válidas**: Faça login com credenciais corretas. Verifique se o redirecionamento para a página principal ocorre
- [ ] **Estado de loading**: Durante o processo de login, verifique se o botão mostra o estado de loading

#### Navegação e Opções Adicionais
- [ ] **Esqueci minha senha**: Clique no link e verifique se redireciona para a página de recuperação de senha
- [ ] **Criar conta**: Clique no link e verifique se redireciona para a página de cadastro
- [ ] **Login com Google**: Clique no botão e verifique se o popup de autenticação do Google é exibido

### 2. Formulário de Cadastro (SignupForm)

#### Validação de Campos
- [ ] **Email vazio**: Submeta o formulário sem preencher o email. Verifique a mensagem de erro
- [ ] **Email inválido**: Digite um email em formato incorreto e submeta
- [ ] **Senha fraca**: Digite uma senha com menos de 8 caracteres ou sem número/letra
- [ ] **Confirmação de senha diferente**: Digite senhas diferentes nos campos de senha e confirmação
- [ ] **Todos os campos preenchidos corretamente**: Preencha todos os campos corretamente e submeta

#### Processo de Cadastro
- [ ] **Email já em uso**: Tente cadastrar um email já existente. Verifique a mensagem de erro
- [ ] **Cadastro bem-sucedido**: Faça um cadastro com dados válidos. Verifique se há redirecionamento para a página de confirmação
- [ ] **Estado de loading**: Durante o processo de cadastro, verifique se o botão mostra o estado de loading

#### Navegação e Opções Adicionais
- [ ] **Já tenho conta**: Clique no link e verifique se redireciona para a página de login
- [ ] **Cadastro com Google**: Clique no botão e verifique se o processo de cadastro com Google funciona

### 3. Formulário de Recuperação de Senha (PasswordResetForm)

#### Solicitação de Recuperação
- [ ] **Email vazio**: Submeta o formulário sem preencher o email. Verifique a mensagem de erro
- [ ] **Email inválido**: Digite um email em formato incorreto e verifique a validação
- [ ] **Email válido**: Digite um email válido e submeta. Verifique a mensagem de confirmação

#### Definição de Nova Senha
- [ ] **Senha vazia**: Submeta o formulário sem preencher a senha. Verifique a mensagem de erro
- [ ] **Confirmação vazia**: Preencha apenas a senha e submeta. Verifique a mensagem de erro
- [ ] **Senha fraca**: Digite uma senha que não atenda aos requisitos. Verifique a mensagem de erro
- [ ] **Senhas diferentes**: Digite senhas diferentes nos campos. Verifique a mensagem de erro
- [ ] **Senha válida**: Digite uma senha válida em ambos os campos e submeta. Verifique a mensagem de sucesso

#### Estados Visuais
- [ ] **Feedback de carregamento**: Durante o envio do email ou atualização da senha, verifique se o botão mostra o estado de loading
- [ ] **Mensagens de sucesso**: Após o envio do email ou atualização da senha, verifique se as mensagens de sucesso aparecem

### 4. Botões de Login Social (SocialLoginButtons)

- [ ] **Renderização**: Verifique se os botões são renderizados corretamente em todos os formulários
- [ ] **Estado de loading**: Ao clicar no botão, verifique se o estado de loading é exibido
- [ ] **Popup do Google**: Ao clicar no botão de Google, verifique se o popup de autenticação é exibido
- [ ] **Autenticação bem-sucedida**: Complete a autenticação com Google e verifique se o redirecionamento ocorre

### 5. Testes de Responsividade

- [ ] **Mobile**: Verifique se todos os formulários estão bem apresentados em telas pequenas (320px-480px)
- [ ] **Tablet**: Teste em resoluções médias (768px-1024px)
- [ ] **Desktop**: Confirme que a experiência é ótima em telas grandes (1200px+)

### 6. Testes de Acessibilidade

- [ ] **Navegação por teclado**: Teste a navegação usando Tab e Enter
- [ ] **Contraste de cores**: Verifique se o contraste entre texto e fundo é suficiente
- [ ] **Mensagens de erro**: Confirme que as mensagens de erro são claras e acessíveis

## Troubleshooting

Se você encontrar erros nos testes:

1. Verifique se todas as dependências estão instaladas:
   ```bash
   npm install
   ```

2. Se houver erros de tipo, execute os scripts de correção:
   ```bash
   ./fix-all-errors.sh
   ```

3. Verifique se as variáveis de ambiente estão configuradas corretamente:
   ```bash
   cp .env.example .env.local
   ```
   E preencha com suas credenciais do Supabase.
