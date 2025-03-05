#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== RESET COMPLETO DO NEXT.JS ===${NC}\n"

# Diretório do frontend
FRONTEND_DIR="/Users/Amarilho/Documents/2_AgentVox/frontend"

# Parar instâncias do Next.js em execução
echo -e "${YELLOW}Parando instâncias do Next.js em execução...${NC}"
pkill -f "next dev" || true
echo -e "${GREEN}Instâncias do Next.js paradas!${NC}"

# Limpar o cache do Next.js
echo -e "\n${YELLOW}Limpando o cache do Next.js...${NC}"
rm -rf "${FRONTEND_DIR}/.next"
echo -e "${GREEN}Cache do Next.js limpo com sucesso!${NC}"

# Limpar o cache do npm
echo -e "\n${YELLOW}Limpando o cache do npm...${NC}"
cd "${FRONTEND_DIR}" && npm cache clean --force
echo -e "${GREEN}Cache do npm limpo com sucesso!${NC}"

# Remover node_modules
echo -e "\n${YELLOW}Removendo node_modules...${NC}"
rm -rf "${FRONTEND_DIR}/node_modules"
echo -e "${GREEN}node_modules removido com sucesso!${NC}"

# Reinstalar as dependências
echo -e "\n${YELLOW}Reinstalando as dependências...${NC}"
cd "${FRONTEND_DIR}" && npm install
echo -e "${GREEN}Dependências reinstaladas com sucesso!${NC}"

# Verificar variáveis de ambiente
echo -e "\n${YELLOW}Verificando variáveis de ambiente...${NC}"
ENV_FILE="${FRONTEND_DIR}/.env.local"

if [ -f "$ENV_FILE" ]; then
  echo -e "${GREEN}Arquivo .env.local encontrado!${NC}"
  
  # Verificar e atualizar as credenciais
  if grep -q "NEXT_PUBLIC_SUPABASE_URL" "$ENV_FILE"; then
    echo -e "${GREEN}NEXT_PUBLIC_SUPABASE_URL encontrado!${NC}"
  else
    echo -e "${RED}NEXT_PUBLIC_SUPABASE_URL não encontrado! Adicionando...${NC}"
    echo "NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co" >> "$ENV_FILE"
  fi
  
  if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$ENV_FILE"; then
    echo -e "${GREEN}NEXT_PUBLIC_SUPABASE_ANON_KEY encontrado!${NC}"
  else
    echo -e "${RED}NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrado! Adicionando...${NC}"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ" >> "$ENV_FILE"
  fi
else
  echo -e "${RED}Arquivo .env.local não encontrado! Criando...${NC}"
  cat > "$ENV_FILE" << EOF
# Configuração do Supabase para o projeto AgentVox
NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ

# OpenAI - API para embeddings e processamento de linguagem natural
OPENAI_API_KEY=sua-chave-da-api-openai
EOF
  echo -e "${GREEN}Arquivo .env.local criado com sucesso!${NC}"
fi

# Criar página de teste extremamente simples
echo -e "\n${YELLOW}Criando página de teste extremamente simples...${NC}"
TEST_PAGE_FILE="${FRONTEND_DIR}/src/pages/hello.js"

cat > "$TEST_PAGE_FILE" << 'EOF'
// Página de teste extremamente simples

export default function Hello() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Hello World!</h1>
      <p>Esta é uma página de teste extremamente simples.</p>
      
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Variáveis de Ambiente</h2>
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não definida'}</p>
        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Definida (comprimento: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'Não definida'}</p>
      </div>
    </div>
  );
}
EOF

echo -e "${GREEN}Página de teste criada em ${TEST_PAGE_FILE}${NC}"

# Iniciar o servidor Next.js
echo -e "\n${YELLOW}Iniciando o servidor Next.js...${NC}"
cd "${FRONTEND_DIR}" && npm run dev &

echo -e "\n${BLUE}=== PRÓXIMOS PASSOS ===${NC}"
echo -e "1. ${YELLOW}Aguarde o servidor iniciar completamente${NC}"
echo -e "2. ${YELLOW}Acesse a página de teste:${NC} http://localhost:3000/hello"

echo -e "\n${GREEN}Script concluído com sucesso!${NC}"
