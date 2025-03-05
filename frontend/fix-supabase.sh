#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CORREÇÃO DE PROBLEMAS DO SUPABASE ===${NC}\n"

# Diretório do frontend
FRONTEND_DIR="/Users/Amarilho/Documents/2_AgentVox/frontend"
ENV_FILE="${FRONTEND_DIR}/.env.local"

# Fazer backup do arquivo original
if [ -f "$ENV_FILE" ]; then
  cp "$ENV_FILE" "${ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"
  echo -e "${GREEN}Backup do arquivo .env.local criado.${NC}"
fi

# Restaurar as credenciais originais do Supabase
echo -e "${YELLOW}Restaurando as credenciais originais do Supabase...${NC}"

cat > "$ENV_FILE" << EOF
# Configuração do Supabase para o projeto AgentVox
NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ

# OpenAI - API para embeddings e processamento de linguagem natural
OPENAI_API_KEY=sua-chave-da-api-openai
EOF

echo -e "${GREEN}Arquivo .env.local atualizado com as credenciais originais.${NC}"

# Limpar o cache do Next.js
echo -e "\n${YELLOW}Limpando o cache do Next.js...${NC}"
rm -rf "${FRONTEND_DIR}/.next"
echo -e "${GREEN}Cache do Next.js limpo com sucesso!${NC}"

# Verificar e corrigir a estrutura do projeto
echo -e "\n${YELLOW}Verificando a estrutura do projeto...${NC}"

# Verificar se o diretório pages existe
if [ ! -d "${FRONTEND_DIR}/pages" ]; then
  mkdir -p "${FRONTEND_DIR}/pages"
  echo -e "${GREEN}Diretório 'pages' criado.${NC}"
fi

# Verificar se o diretório src/pages existe e se tem arquivos
if [ -d "${FRONTEND_DIR}/src/pages" ]; then
  # Copiar arquivos de src/pages para pages
  echo -e "${YELLOW}Copiando arquivos de src/pages para pages...${NC}"
  cp -r "${FRONTEND_DIR}/src/pages/"* "${FRONTEND_DIR}/pages/" 2>/dev/null || true
  echo -e "${GREEN}Arquivos copiados.${NC}"
fi

# Verificar se o arquivo next.config.js existe
if [ ! -f "${FRONTEND_DIR}/next.config.js" ]; then
  echo -e "${YELLOW}Criando arquivo next.config.js...${NC}"
  cat > "${FRONTEND_DIR}/next.config.js" << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
EOF
  echo -e "${GREEN}Arquivo next.config.js criado.${NC}"
fi

# Reiniciar o servidor Next.js
echo -e "\n${YELLOW}Parando instâncias do Next.js em execução...${NC}"
pkill -f "next dev" || true
echo -e "${GREEN}Instâncias do Next.js paradas!${NC}"

echo -e "\n${YELLOW}Iniciando o servidor Next.js...${NC}"
cd "${FRONTEND_DIR}" && npm run dev &

echo -e "\n${BLUE}=== PRÓXIMOS PASSOS ===${NC}"
echo -e "1. ${YELLOW}Aguarde o servidor iniciar completamente${NC}"
echo -e "2. ${YELLOW}Acesse a página de teste:${NC} http://localhost:3000/login-test"
echo -e "3. ${YELLOW}Verifique se a conexão com o Supabase está funcionando corretamente.${NC}"

echo -e "\n${GREEN}Script concluído com sucesso!${NC}"
