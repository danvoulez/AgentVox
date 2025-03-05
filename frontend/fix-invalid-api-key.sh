#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CORREÇÃO DO ERRO 'INVALID API KEY' ===${NC}\n"

# Verificar se o arquivo .env.local existe
if [ ! -f ".env.local" ]; then
  echo -e "${RED}ERRO: Arquivo .env.local não encontrado!${NC}"
  echo -e "Criando um arquivo .env.local baseado no .env.example...\n"
  
  if [ -f ".env.example" ]; then
    cp .env.example .env.local
    echo -e "${GREEN}Arquivo .env.local criado com sucesso!${NC}"
  else
    echo -e "${RED}Arquivo .env.example não encontrado. Não foi possível criar .env.local${NC}"
    exit 1
  fi
fi

# Verificar e corrigir a chave do Supabase
echo -e "${YELLOW}Verificando as credenciais do Supabase...${NC}"

# Extrair valores das variáveis de ambiente do arquivo .env.local
SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d '=' -f2-)
SUPABASE_KEY=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local | cut -d '=' -f2-)

# Verificar se as credenciais estão presentes
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo -e "${RED}ERRO: Credenciais do Supabase não encontradas ou incompletas no arquivo .env.local${NC}"
  
  # Atualizar com as credenciais corretas
  echo -e "${YELLOW}Atualizando com as credenciais corretas do Supabase...${NC}"
  
  # Fazer backup do arquivo atual
  cp .env.local .env.local.bak.$(date +%s)
  
  # Atualizar ou adicionar as variáveis corretas
  if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    sed -i '' "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co|g" .env.local
  else
    echo "NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co" >> .env.local
  fi
  
  if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
    sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ|g" .env.local
  else
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ" >> .env.local
  fi
  
  echo -e "${GREEN}Credenciais do Supabase atualizadas com sucesso!${NC}"
else
  # Verificar se as credenciais são válidas
  if [[ "$SUPABASE_URL" != *"nwvxzlkhoobtotuixvpn.supabase.co"* ]]; then
    echo -e "${RED}URL do Supabase parece incorreto.${NC}"
    
    # Fazer backup do arquivo atual
    cp .env.local .env.local.bak.$(date +%s)
    
    # Atualizar a URL
    sed -i '' "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co|g" .env.local
    echo -e "${GREEN}URL do Supabase corrigido!${NC}"
  else
    echo -e "${GREEN}URL do Supabase parece correto.${NC}"
  fi
  
  if [[ "$SUPABASE_KEY" != "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"* ]]; then
    echo -e "${RED}Chave Anon do Supabase parece incorreta.${NC}"
    
    # Fazer backup do arquivo atual se ainda não foi feito
    if [[ "$SUPABASE_URL" == *"nwvxzlkhoobtotuixvpn.supabase.co"* ]]; then
      cp .env.local .env.local.bak.$(date +%s)
    fi
    
    # Atualizar a chave
    sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ|g" .env.local
    echo -e "${GREEN}Chave Anon do Supabase corrigida!${NC}"
  else
    echo -e "${GREEN}Chave Anon do Supabase parece correta.${NC}"
  fi
fi

# Limpar o cache do Next.js
echo -e "\n${YELLOW}Limpando o cache do Next.js...${NC}"
rm -rf .next
echo -e "${GREEN}Cache do Next.js limpo com sucesso!${NC}"

echo -e "\n${BLUE}=== CONCLUSÃO ===${NC}\n"
echo -e "${GREEN}Processo de correção concluído!${NC}"
echo -e "${YELLOW}Reinicie o servidor de desenvolvimento com: npm run dev${NC}"
echo -e "${YELLOW}Acesse http://localhost:3000/login para testar o login${NC}"
