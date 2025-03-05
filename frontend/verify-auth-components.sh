#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_PATH="/Users/Amarilho/Documents/2_AgentVox/frontend"
SRC_PATH="$BASE_PATH/src"

echo -e "${BLUE}=== Verificando componentes de autenticação ===${NC}"

# Função para verificar se um arquivo existe
check_file() {
  local file_path="$1"
  local file_desc="$2"
  
  if [ -f "$file_path" ]; then
    echo -e "${GREEN}✓ $file_desc encontrado${NC}"
    return 0
  else
    echo -e "${RED}✗ $file_desc não encontrado: $file_path${NC}"
    return 1
  fi
}

# Função para verificar conteúdo do arquivo
check_content() {
  local file_path="$1"
  local search_pattern="$2"
  local desc="$3"
  
  if grep -q "$search_pattern" "$file_path"; then
    echo -e "${GREEN}✓ $desc verificado${NC}"
    return 0
  else
    echo -e "${YELLOW}! $desc não encontrado em $file_path${NC}"
    return 1
  fi
}

# Verificar arquivos principais de autenticação
echo -e "\n${YELLOW}Verificando arquivos principais de autenticação...${NC}"
AUTH_ERRORS=0

check_file "$SRC_PATH/utils/auth/supabase.ts" "Cliente Supabase" || ((AUTH_ERRORS++))
check_file "$SRC_PATH/contexts/AuthContext.tsx" "Contexto de autenticação" || ((AUTH_ERRORS++))
check_file "$SRC_PATH/components/Auth/LoginForm.tsx" "Formulário de login" || ((AUTH_ERRORS++))
check_file "$SRC_PATH/components/Auth/SignupForm.tsx" "Formulário de cadastro" || ((AUTH_ERRORS++))
check_file "$SRC_PATH/components/Auth/ProtectedRoute.tsx" "Componente de rota protegida" || ((AUTH_ERRORS++))
check_file "$SRC_PATH/middleware.ts" "Middleware de autenticação" || ((AUTH_ERRORS++))

# Verificar páginas de autenticação
echo -e "\n${YELLOW}Verificando páginas de autenticação...${NC}"
PAGE_ERRORS=0

check_file "$SRC_PATH/pages/auth/login.tsx" "Página de login" || ((PAGE_ERRORS++))
check_file "$SRC_PATH/pages/auth/signup.tsx" "Página de cadastro" || ((PAGE_ERRORS++))
check_file "$SRC_PATH/pages/auth/forgot-password.tsx" "Página de recuperação de senha" || ((PAGE_ERRORS++))
check_file "$SRC_PATH/pages/auth/reset-password.tsx" "Página de redefinição de senha" || ((PAGE_ERRORS++))
check_file "$SRC_PATH/pages/_app.tsx" "Arquivo _app.tsx" || ((PAGE_ERRORS++))

# Verificar testes
echo -e "\n${YELLOW}Verificando arquivos de teste...${NC}"
TEST_ERRORS=0

check_file "$BASE_PATH/jest.config.js" "Configuração do Jest" || ((TEST_ERRORS++))
check_file "$BASE_PATH/jest.setup.js" "Setup do Jest" || ((TEST_ERRORS++))
check_file "$BASE_PATH/cypress.config.ts" "Configuração do Cypress" || ((TEST_ERRORS++))
check_file "$SRC_PATH/utils/auth/__tests__/supabase.test.ts" "Testes de autenticação" || ((TEST_ERRORS++))
check_file "$SRC_PATH/components/Auth/__tests__/LoginForm.test.tsx" "Testes do formulário de login" || ((TEST_ERRORS++))

# Verificar conteúdo dos arquivos principais
echo -e "\n${YELLOW}Verificando implementação dos componentes...${NC}"
CONTENT_ERRORS=0

if [ -f "$SRC_PATH/contexts/AuthContext.tsx" ]; then
  check_content "$SRC_PATH/contexts/AuthContext.tsx" "createContext" "Context API" || ((CONTENT_ERRORS++))
  check_content "$SRC_PATH/contexts/AuthContext.tsx" "useContext" "Hook useContext" || ((CONTENT_ERRORS++))
  check_content "$SRC_PATH/contexts/AuthContext.tsx" "useState" "Hook useState" || ((CONTENT_ERRORS++))
  check_content "$SRC_PATH/contexts/AuthContext.tsx" "useEffect" "Hook useEffect" || ((CONTENT_ERRORS++))
fi

if [ -f "$SRC_PATH/utils/auth/supabase.ts" ]; then
  check_content "$SRC_PATH/utils/auth/supabase.ts" "createClient" "Criação do cliente Supabase" || ((CONTENT_ERRORS++))
  check_content "$SRC_PATH/utils/auth/supabase.ts" "supabase" "Exportação da instância" || ((CONTENT_ERRORS++))
fi

if [ -f "$SRC_PATH/components/Auth/ProtectedRoute.tsx" ]; then
  check_content "$SRC_PATH/components/Auth/ProtectedRoute.tsx" "useAuth" "Uso do hook useAuth" || ((CONTENT_ERRORS++))
  check_content "$SRC_PATH/components/Auth/ProtectedRoute.tsx" "useRouter" "Uso do hook useRouter" || ((CONTENT_ERRORS++))
fi

# Verificar package.json por dependências necessárias
echo -e "\n${YELLOW}Verificando dependências no package.json...${NC}"
PKG_ERRORS=0

if [ -f "$BASE_PATH/package.json" ]; then
  check_content "$BASE_PATH/package.json" "@supabase/supabase-js" "Dependência do Supabase" || ((PKG_ERRORS++))
  check_content "$BASE_PATH/package.json" "@chakra-ui/react" "Dependência do Chakra UI" || ((PKG_ERRORS++))
  check_content "$BASE_PATH/package.json" "jest" "Dependência do Jest" || ((PKG_ERRORS++))
  check_content "$BASE_PATH/package.json" "cypress" "Dependência do Cypress" || ((PKG_ERRORS++))
  check_content "$BASE_PATH/package.json" "@testing-library/react" "Testing Library" || ((PKG_ERRORS++))
else
  echo -e "${RED}✗ Arquivo package.json não encontrado${NC}"
  ((PKG_ERRORS++))
fi

# Resumo
echo -e "\n${BLUE}=== Resumo da verificação ===${NC}"
TOTAL_ERRORS=$((AUTH_ERRORS + PAGE_ERRORS + TEST_ERRORS + CONTENT_ERRORS + PKG_ERRORS))

echo "Arquivos de autenticação: $AUTH_ERRORS erros"
echo "Páginas: $PAGE_ERRORS erros"
echo "Testes: $TEST_ERRORS erros"
echo "Implementação: $CONTENT_ERRORS erros"
echo "Dependências: $PKG_ERRORS erros"
echo -e "${YELLOW}Total: $TOTAL_ERRORS problemas encontrados${NC}"

if [ $TOTAL_ERRORS -eq 0 ]; then
  echo -e "\n${GREEN}✓ Todos os componentes de autenticação estão corretamente configurados!${NC}"
  echo -e "Agora você pode executar os testes com ./run-all-tests.sh"
else
  echo -e "\n${YELLOW}Alguns componentes precisam ser corrigidos. Execute o script de correção:${NC}"
  echo -e "${BLUE}./fix-auth-and-testing-errors.sh${NC}"
fi

# Criar README para explicar os scripts
if [ ! -f "$BASE_PATH/AUTH_TESTING_README.md" ]; then
  echo -e "\n${YELLOW}Criando arquivo de instruções AUTH_TESTING_README.md...${NC}"
  
  cat > "$BASE_PATH/AUTH_TESTING_README.md" << 'EOL'
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
EOL

  echo -e "${GREEN}✓ Arquivo AUTH_TESTING_README.md criado com sucesso!${NC}"
fi

exit $TOTAL_ERRORS
