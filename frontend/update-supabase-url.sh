#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== ATUALIZANDO URL DO SUPABASE ===${NC}\n"

# Verificar se o arquivo .env.local existe
if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}Arquivo .env.local não encontrado. Criando a partir do .env.example...${NC}"
  
  if [ -f ".env.example" ]; then
    cp .env.example .env.local
    echo -e "${GREEN}Arquivo .env.local criado com sucesso!${NC}"
  else
    echo -e "${YELLOW}Arquivo .env.example não encontrado. Criando um arquivo .env.local básico...${NC}"
    
    cat > .env.local << EOF
# Configuração do Supabase para o projeto AgentVox
NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica

# OpenAI - API para embeddings e processamento de linguagem natural
OPENAI_API_KEY=sua-chave-da-api-openai
EOF
    
    echo -e "${GREEN}Arquivo .env.local básico criado com sucesso!${NC}"
  fi
fi

# Fazer backup do arquivo .env.local
cp .env.local .env.local.bak
echo -e "${GREEN}Backup do arquivo .env.local criado como .env.local.bak${NC}"

# Atualizar a URL do Supabase
sed -i '' 's|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co|g' .env.local

echo -e "${GREEN}URL do Supabase atualizada para: https://nwvxzlkhoobtotuixvpn.supabase.co${NC}"

# Verificar se NEXT_PUBLIC_USE_SUPABASE_MOCK está definido como true e alterar para false
if grep -q "NEXT_PUBLIC_USE_SUPABASE_MOCK=true" .env.local; then
  sed -i '' 's|NEXT_PUBLIC_USE_SUPABASE_MOCK=true|NEXT_PUBLIC_USE_SUPABASE_MOCK=false|g' .env.local
  echo -e "${GREEN}NEXT_PUBLIC_USE_SUPABASE_MOCK alterado para false${NC}"
fi

echo -e "\n${BLUE}=== LIMPANDO CACHE ===${NC}"
echo -e "${YELLOW}Removendo diretório .next...${NC}"
rm -rf .next
echo -e "${GREEN}Cache limpo com sucesso!${NC}"

echo -e "\n${BLUE}=== VERIFICANDO CONEXÃO ===${NC}"
echo -e "${YELLOW}Execute o comando a seguir para verificar a conexão:${NC}"
echo -e "  ./check-env.sh"

echo -e "\n${BLUE}=== CONCLUÍDO ===${NC}"
echo -e "${YELLOW}Reinicie o servidor com:${NC}"
echo -e "  npm run dev"
