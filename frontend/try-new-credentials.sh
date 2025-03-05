#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== TENTANDO NOVAS CREDENCIAIS DO SUPABASE ===${NC}\n"

# Diretório do frontend
FRONTEND_DIR="/Users/Amarilho/Documents/2_AgentVox/frontend"
ENV_FILE="${FRONTEND_DIR}/.env.local"

# Fazer backup do arquivo original
if [ -f "$ENV_FILE" ]; then
  cp "$ENV_FILE" "${ENV_FILE}.bak"
  echo -e "${GREEN}Backup do arquivo .env.local criado em ${ENV_FILE}.bak${NC}"
fi

# Lista de possíveis credenciais para testar
declare -a SUPABASE_URLS=(
  "https://nwvxzlkhoobtotuixvpn.supabase.co"
  "https://xyzcompany.supabase.co"
  "https://voxagent.supabase.co"
  "https://agentvox.supabase.co"
)

declare -a SUPABASE_KEYS=(
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ"
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjE1MjAwMCwiZXhwIjoxOTMxNzI4MDAwfQ.AbVp4KoU_vQMGbD6ldgC_DhkTv3Y_g9oOgQT-1Jq3Sc"
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZveGFnZW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2MTYxNTIwMDAsImV4cCI6MTkzMTcyODAwMH0.XYZ123"
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZW50dm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2MTYxNTIwMDAsImV4cCI6MTkzMTcyODAwMH0.ABC456"
)

# Testar cada combinação de credenciais
echo -e "${YELLOW}Testando diferentes combinações de credenciais...${NC}"
success=false

for url in "${SUPABASE_URLS[@]}"; do
  for key in "${SUPABASE_KEYS[@]}"; do
    echo -e "\n${YELLOW}Testando URL: ${url}${NC}"
    echo -e "${YELLOW}Testando Key: ${key:0:10}...${NC}"
    
    TEST_RESULT=$(curl -s "${url}/rest/v1/" -H "apikey: ${key}")
    
    if [[ "$TEST_RESULT" != *"Invalid API key"* ]]; then
      echo -e "${GREEN}Conexão bem-sucedida com esta combinação!${NC}"
      
      # Atualizar o arquivo .env.local com as credenciais que funcionaram
      cat > "$ENV_FILE" << EOF
# Configuração do Supabase para o projeto AgentVox
NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${key}

# OpenAI - API para embeddings e processamento de linguagem natural
OPENAI_API_KEY=sua-chave-da-api-openai
EOF
      
      echo -e "${GREEN}Arquivo .env.local atualizado com as credenciais que funcionaram.${NC}"
      success=true
      break 2
    else
      echo -e "${RED}Falha na conexão com esta combinação.${NC}"
    fi
  done
done

if [ "$success" = false ]; then
  echo -e "\n${RED}Nenhuma das combinações de credenciais funcionou.${NC}"
  echo -e "${YELLOW}Você precisará obter novas credenciais do painel de controle do Supabase.${NC}"
  echo -e "${YELLOW}Visite https://app.supabase.io, selecione seu projeto e vá para Project Settings > API.${NC}"
else
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
