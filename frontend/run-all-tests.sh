#!/bin/bash

# Cores para facilitar a leitura
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Executando todos os testes do AgentVox ====${NC}"
echo ""

# Verificar se as dependências estão instaladas
echo -e "${YELLOW}Verificando dependências...${NC}"
if ! npm list jest &> /dev/null; then
  echo -e "${YELLOW}Instalando Jest e dependências de teste...${NC}"
  npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom ts-jest @types/jest
fi

if ! npm list cypress &> /dev/null; then
  echo -e "${YELLOW}Instalando Cypress...${NC}"
  npm install --save-dev cypress
fi

echo -e "${GREEN}✓ Dependências verificadas${NC}"
echo ""

# Criar diretório de testes se não existir
mkdir -p .jest-coverage

# Limpar resultados anteriores
rm -rf .jest-coverage/*
rm -rf cypress/videos/*
rm -rf cypress/screenshots/*

# Configuração do ambiente para testes
export NODE_ENV=test
export NEXT_PUBLIC_SUPABASE_URL="https://meu-projeto.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="teste-auth-key"
export SUPABASE_SERVICE_ROLE_KEY="teste-service-key"

# PARTE 1: Executar testes unitários com Jest
echo -e "${BLUE}=== EXECUTANDO TESTES UNITÁRIOS ===${NC}"
echo -e "${YELLOW}Iniciando testes com Jest...${NC}"

# Adiciona uma flag para evitar erros de ESM no Jest
NODE_OPTIONS="--experimental-vm-modules" npx jest --coverage --coverageDirectory=.jest-coverage --detectOpenHandles

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Testes unitários concluídos com sucesso!${NC}"
  UNIT_TESTS_SUCCESS=true
else
  echo -e "${RED}✗ Alguns testes unitários falharam.${NC}"
  echo -e "${YELLOW}Consulte os detalhes acima para mais informações.${NC}"
  UNIT_TESTS_SUCCESS=false
fi
echo ""

# PARTE 2: Verificar se o servidor está em execução para os testes E2E
NEXT_RUNNING=false
echo -e "${YELLOW}Verificando se o servidor Next.js está em execução...${NC}"
if lsof -i :3000 > /dev/null; then
  echo -e "${GREEN}✓ Servidor Next.js está rodando na porta 3000${NC}"
  NEXT_RUNNING=true
else
  echo -e "${YELLOW}Servidor Next.js não está em execução. Iniciando em modo de teste...${NC}"
  # Inicia o servidor em segundo plano
  npm run dev > /dev/null 2>&1 &
  SERVER_PID=$!
  echo -e "${YELLOW}Aguardando servidor inicializar...${NC}"
  
  # Espera o servidor iniciar
  for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null; then
      echo -e "${GREEN}✓ Servidor Next.js inicializado na porta 3000${NC}"
      break
    fi
    echo -n "."
    sleep 1
    
    if [ $i -eq 30 ]; then
      echo -e "${RED}✗ Falha ao iniciar o servidor Next.js${NC}"
      exit 1
    fi
  done
fi
echo ""

# PARTE 3: Executar testes E2E com Cypress
echo -e "${BLUE}=== EXECUTANDO TESTES E2E ===${NC}"
echo -e "${YELLOW}Iniciando testes Cypress...${NC}"

# Execute os testes Cypress em modo headless
npx cypress run

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Testes E2E concluídos com sucesso!${NC}"
  E2E_TESTS_SUCCESS=true
else
  echo -e "${RED}✗ Alguns testes E2E falharam.${NC}"
  echo -e "${YELLOW}Consulte os detalhes acima e verifique as capturas de tela em 'cypress/screenshots'${NC}"
  E2E_TESTS_SUCCESS=false
fi
echo ""

# Se iniciamos o servidor, devemos encerrá-lo
if [ "$NEXT_RUNNING" = false ] && [ -n "$SERVER_PID" ]; then
  echo -e "${YELLOW}Encerrando servidor de testes...${NC}"
  kill $SERVER_PID
  wait $SERVER_PID 2>/dev/null
  echo -e "${GREEN}✓ Servidor encerrado${NC}"
fi

# RESUMO FINAL
echo -e "${BLUE}=== RESUMO DOS TESTES ===${NC}"

if [ "$UNIT_TESTS_SUCCESS" = true ] && [ "$E2E_TESTS_SUCCESS" = true ]; then
  echo -e "${GREEN}✓ Todos os testes foram concluídos com sucesso!${NC}"
  echo -e "${YELLOW}Você pode visualizar o relatório de cobertura abrindo:${NC}"
  echo -e "  ${BLUE}file://$(pwd)/.jest-coverage/lcov-report/index.html${NC}"
  
  # Abrir o relatório automaticamente
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open .jest-coverage/lcov-report/index.html
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open .jest-coverage/lcov-report/index.html
  fi
  
  exit 0
else
  echo -e "${RED}✗ Pelo menos um conjunto de testes falhou.${NC}"
  echo -e "${YELLOW}Verifique os detalhes acima para identificar os problemas.${NC}"
  exit 1
fi
