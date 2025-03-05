#!/bin/bash

# Script para verificar e corrigir as variáveis de ambiente do Supabase

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Verificando configuração do Supabase...${NC}"

# Verificar se o arquivo .env.local existe
if [ ! -f .env.local ]; then
  echo -e "${RED}Arquivo .env.local não encontrado!${NC}"
  echo -e "${YELLOW}Criando arquivo .env.local a partir de .env.example...${NC}"
  cp .env.example .env.local
  echo -e "${GREEN}Arquivo .env.local criado. Por favor, edite-o com suas credenciais do Supabase.${NC}"
  exit 1
fi

# Verificar se as variáveis do Supabase estão configuradas
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)
SUPABASE_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2)

if [ -z "$SUPABASE_URL" ] || [[ "$SUPABASE_URL" == *"seu-projeto"* ]]; then
  echo -e "${RED}NEXT_PUBLIC_SUPABASE_URL não está configurado corretamente em .env.local${NC}"
  echo -e "${YELLOW}Por favor, edite o arquivo .env.local e defina NEXT_PUBLIC_SUPABASE_URL com a URL do seu projeto Supabase.${NC}"
  CONFIG_ERROR=1
else
  echo -e "${GREEN}NEXT_PUBLIC_SUPABASE_URL está configurado: $SUPABASE_URL${NC}"
fi

if [ -z "$SUPABASE_KEY" ] || [[ "$SUPABASE_KEY" == *"sua-chave"* ]]; then
  echo -e "${RED}NEXT_PUBLIC_SUPABASE_ANON_KEY não está configurado corretamente em .env.local${NC}"
  echo -e "${YELLOW}Por favor, edite o arquivo .env.local e defina NEXT_PUBLIC_SUPABASE_ANON_KEY com a chave anônima do seu projeto Supabase.${NC}"
  CONFIG_ERROR=1
else
  echo -e "${GREEN}NEXT_PUBLIC_SUPABASE_ANON_KEY está configurado (comprimento: ${#SUPABASE_KEY})${NC}"
fi

if [ "$CONFIG_ERROR" == "1" ]; then
  echo -e "${YELLOW}Instruções para configurar o Supabase:${NC}"
  echo -e "1. Acesse o dashboard do Supabase (https://app.supabase.io)"
  echo -e "2. Selecione seu projeto"
  echo -e "3. Vá para Configurações > API"
  echo -e "4. Copie a URL do projeto e a chave anônima"
  echo -e "5. Cole essas informações no arquivo .env.local"
  echo -e "6. Reinicie o servidor de desenvolvimento com 'npm run dev'"
  exit 1
fi

echo -e "${GREEN}Configuração do Supabase parece estar correta!${NC}"
echo -e "${YELLOW}Reiniciando o servidor de desenvolvimento...${NC}"

# Reiniciar o servidor de desenvolvimento
npm run dev
