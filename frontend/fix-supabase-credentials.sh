#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CORREÇÃO DE CREDENCIAIS DO SUPABASE ===${NC}\n"

# Diretório do frontend
FRONTEND_DIR="/Users/Amarilho/Documents/2_AgentVox/frontend"
ENV_FILE="${FRONTEND_DIR}/.env.local"

# Verificar se o arquivo .env.local existe
if [ -f "$ENV_FILE" ]; then
  echo -e "${GREEN}Arquivo .env.local encontrado.${NC}"
  
  # Fazer backup do arquivo original
  cp "$ENV_FILE" "${ENV_FILE}.bak"
  echo -e "${GREEN}Backup do arquivo .env.local criado em ${ENV_FILE}.bak${NC}"
else
  echo -e "${YELLOW}Arquivo .env.local não encontrado. Criando um novo...${NC}"
fi

# Solicitar novas credenciais do Supabase
echo -e "\n${YELLOW}Precisamos atualizar as credenciais do Supabase.${NC}"
echo -e "${YELLOW}Por favor, acesse o painel de controle do Supabase (https://app.supabase.io) e obtenha as seguintes informações:${NC}"
echo -e "1. URL do projeto (Project URL)"
echo -e "2. Chave anônima (anon key)"
echo -e "\n${YELLOW}Instruções para encontrar essas informações:${NC}"
echo -e "1. Faça login no Supabase (https://app.supabase.io)"
echo -e "2. Selecione seu projeto 'AgentVox'"
echo -e "3. No menu lateral, clique em 'Project Settings'"
echo -e "4. Clique em 'API'"
echo -e "5. Copie a 'Project URL' e a 'anon key'"

# Perguntar se o usuário deseja tentar com credenciais alternativas
echo -e "\n${YELLOW}Deseja tentar com credenciais alternativas que podem funcionar? (s/n)${NC}"
read -p "Resposta: " try_alternative

if [[ "$try_alternative" == "s" || "$try_alternative" == "S" ]]; then
  # Credenciais alternativas (podem ser obtidas de um projeto de teste)
  SUPABASE_URL="https://xyzcompany.supabase.co"
  SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjE1MjAwMCwiZXhwIjoxOTMxNzI4MDAwfQ.AbVp4KoU_vQMGbD6ldgC_DhkTv3Y_g9oOgQT-1Jq3Sc"
  
  echo -e "${GREEN}Usando credenciais alternativas para teste.${NC}"
else
  # Solicitar novas credenciais
  echo -e "\n${YELLOW}Digite a URL do projeto Supabase:${NC}"
  read -p "URL: " SUPABASE_URL
  
  echo -e "\n${YELLOW}Digite a chave anônima (anon key) do Supabase:${NC}"
  read -p "Chave: " SUPABASE_KEY
fi

# Criar ou atualizar o arquivo .env.local
cat > "$ENV_FILE" << EOF
# Configuração do Supabase para o projeto AgentVox
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_KEY}

# OpenAI - API para embeddings e processamento de linguagem natural
OPENAI_API_KEY=sua-chave-da-api-openai
EOF

echo -e "\n${GREEN}Arquivo .env.local atualizado com as novas credenciais.${NC}"

# Testar a conexão com o Supabase
echo -e "\n${YELLOW}Testando a conexão com o Supabase...${NC}"
TEST_RESULT=$(curl -s "${SUPABASE_URL}/rest/v1/" -H "apikey: ${SUPABASE_KEY}")

if [[ "$TEST_RESULT" == *"Invalid API key"* ]]; then
  echo -e "${RED}Erro: Chave de API inválida.${NC}"
  echo -e "${YELLOW}As credenciais fornecidas não são válidas. Por favor, verifique e tente novamente.${NC}"
else
  echo -e "${GREEN}Conexão com o Supabase estabelecida com sucesso!${NC}"
  
  # Reiniciar o servidor Next.js
  echo -e "\n${YELLOW}Parando instâncias do Next.js em execução...${NC}"
  pkill -f "next dev" || true
  echo -e "${GREEN}Instâncias do Next.js paradas!${NC}"
  
  echo -e "\n${YELLOW}Limpando o cache do Next.js...${NC}"
  rm -rf "${FRONTEND_DIR}/.next"
  echo -e "${GREEN}Cache do Next.js limpo com sucesso!${NC}"
  
  echo -e "\n${YELLOW}Iniciando o servidor Next.js...${NC}"
  cd "${FRONTEND_DIR}" && npm run dev &
fi

echo -e "\n${BLUE}=== PRÓXIMOS PASSOS ===${NC}"
echo -e "1. ${YELLOW}Aguarde o servidor iniciar completamente${NC}"
echo -e "2. ${YELLOW}Acesse a página de teste:${NC} http://localhost:3000/simple-login-test"
echo -e "3. ${YELLOW}Verifique se a conexão com o Supabase está funcionando corretamente.${NC}"

echo -e "\n${GREEN}Script concluído com sucesso!${NC}"
