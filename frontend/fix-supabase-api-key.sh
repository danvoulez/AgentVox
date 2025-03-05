#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CORREÇÃO DO ERRO 'INVALID API KEY' NO SUPABASE ===${NC}\n"

# Verificar se o arquivo .env.local existe
if [ ! -f ".env.local" ]; then
  echo -e "${RED}ERRO: Arquivo .env.local não encontrado!${NC}"
  echo -e "Criando um arquivo .env.local com as credenciais corretas...\n"
  
  # Criar arquivo .env.local com as credenciais corretas
  cat > .env.local << EOF
# Configuração do Supabase para o projeto AgentVox
NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ

# OpenAI - API para embeddings e processamento de linguagem natural
OPENAI_API_KEY=sua-chave-da-api-openai
EOF
  
  echo -e "${GREEN}Arquivo .env.local criado com sucesso!${NC}"
else
  echo -e "${YELLOW}Arquivo .env.local encontrado. Verificando credenciais...${NC}"
  
  # Fazer backup do arquivo atual
  cp .env.local .env.local.backup.$(date +%s)
  echo -e "${GREEN}Backup do arquivo .env.local criado.${NC}"
  
  # Verificar e atualizar as credenciais
  if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo -e "${YELLOW}Atualizando URL do Supabase...${NC}"
    sed -i '' "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co|g" .env.local
  else
    echo -e "${YELLOW}Adicionando URL do Supabase...${NC}"
    echo "NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co" >> .env.local
  fi
  
  if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
    echo -e "${YELLOW}Atualizando chave anônima do Supabase...${NC}"
    sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ|g" .env.local
  else
    echo -e "${YELLOW}Adicionando chave anônima do Supabase...${NC}"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ" >> .env.local
  fi
  
  echo -e "${GREEN}Credenciais do Supabase atualizadas com sucesso!${NC}"
fi

# Limpar o cache do Next.js
echo -e "\n${YELLOW}Limpando o cache do Next.js...${NC}"
rm -rf .next
echo -e "${GREEN}Cache do Next.js limpo com sucesso!${NC}"

# Verificar se o Node.js está carregando as variáveis de ambiente corretamente
echo -e "\n${YELLOW}Verificando se o Node.js está carregando as variáveis de ambiente...${NC}"

# Criar um script temporário para verificar as variáveis de ambiente
cat > check-env.js << EOF
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'não definida');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'definida (comprimento: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'não definida');
EOF

# Executar o script com dotenv
echo -e "${YELLOW}Resultado da verificação:${NC}"
node -r dotenv/config check-env.js

# Remover o script temporário
rm check-env.js

echo -e "\n${BLUE}=== PRÓXIMOS PASSOS ===${NC}\n"
echo -e "1. ${YELLOW}Reinicie o servidor Next.js:${NC} npm run dev"
echo -e "2. ${YELLOW}Acesse a página de diagnóstico:${NC} http://localhost:3000/diagnose"
echo -e "3. ${YELLOW}Tente fazer login:${NC} http://localhost:3000/auth/login"
echo -e "\n${BLUE}=== CONCLUSÃO ===${NC}\n"
echo -e "${GREEN}Script de correção concluído!${NC}"
echo -e "${YELLOW}Se o problema persistir, verifique se o projeto Supabase está ativo e acessível.${NC}"
