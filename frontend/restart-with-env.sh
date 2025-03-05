#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== REINICIANDO O SERVIDOR NEXT.JS COM VARIÁVEIS DE AMBIENTE ===${NC}\n"

# Verificar se o arquivo .env.local existe
if [ ! -f ".env.local" ]; then
  echo -e "${RED}ERRO: Arquivo .env.local não encontrado!${NC}"
  exit 1
fi

# Ler as variáveis de ambiente do arquivo .env.local
echo -e "${YELLOW}Lendo variáveis de ambiente do arquivo .env.local...${NC}"
export $(grep -v '^#' .env.local | xargs)

# Verificar se as variáveis foram carregadas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo -e "${RED}ERRO: Variáveis de ambiente não foram carregadas corretamente!${NC}"
  exit 1
fi

echo -e "${GREEN}Variáveis de ambiente carregadas com sucesso!${NC}"
echo -e "NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}"
echo -e "NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:10}...\n"

# Parar qualquer instância do Next.js em execução
echo -e "${YELLOW}Parando instâncias do Next.js em execução...${NC}"
pkill -f "next dev" || true
echo -e "${GREEN}Instâncias do Next.js paradas!${NC}\n"

# Limpar o cache do Next.js
echo -e "${YELLOW}Limpando o cache do Next.js...${NC}"
rm -rf .next
echo -e "${GREEN}Cache do Next.js limpo com sucesso!${NC}\n"

# Iniciar o servidor Next.js com as variáveis de ambiente
echo -e "${YELLOW}Iniciando o servidor Next.js...${NC}"
echo -e "${BLUE}Acesse http://localhost:3000/simple-login para testar o login${NC}\n"

# Iniciar o servidor Next.js com as variáveis de ambiente
NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY npm run dev
