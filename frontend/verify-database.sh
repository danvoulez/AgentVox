#!/bin/bash

# Script para verificar a integridade do banco de dados e das políticas RLS

# Cores para saída
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir mensagens de erro e sair
error_exit() {
  echo -e "${RED}ERRO: $1${NC}" >&2
  exit 1
}

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
  echo -e "${YELLOW}Supabase CLI não encontrado. Tentando instalar...${NC}"
  
  if command -v brew &> /dev/null; then
    echo "Instalando Supabase CLI via Homebrew..."
    brew install supabase/tap/supabase || error_exit "Falha ao instalar Supabase CLI"
  else
    error_exit "Homebrew não encontrado. Por favor, instale o Supabase CLI manualmente: https://supabase.com/docs/guides/cli"
  fi
  
  echo -e "${GREEN}Supabase CLI instalado com sucesso!${NC}"
fi

# Verificar se o arquivo .env.local existe
if [ ! -f .env.local ]; then
  if [ -f .env.example ]; then
    echo -e "${YELLOW}Arquivo .env.local não encontrado. Criando a partir de .env.example...${NC}"
    cp .env.example .env.local
    echo -e "${YELLOW}Arquivo .env.local criado. Por favor, edite-o com suas credenciais do Supabase.${NC}"
  else
    error_exit "Arquivo .env.local não encontrado e .env.example não está disponível."
  fi
fi

# Carregar variáveis de ambiente
if [ -f .env.local ]; then
  echo "Carregando variáveis de ambiente de .env.local..."
  export $(grep -v '^#' .env.local | xargs)
else
  error_exit "Arquivo .env.local não encontrado."
fi

# Verificar variáveis de ambiente do Supabase
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  error_exit "Variáveis de ambiente do Supabase não configuradas. Verifique seu arquivo .env.local."
fi

# Extrair o ID do projeto do URL do Supabase
PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | grep -oE '[a-z0-9]{20,}')
if [ -z "$PROJECT_ID" ]; then
  echo -e "${YELLOW}Não foi possível extrair o ID do projeto do URL do Supabase.${NC}"
  echo -e "${YELLOW}Você precisará fornecer o ID do projeto manualmente para algumas operações.${NC}"
fi

# Função para verificar o status das políticas RLS
check_rls_status() {
  echo -e "${BLUE}Verificando status das políticas RLS...${NC}"
  
  # Tentar usar a Edge Function check-rls
  echo "Chamando Edge Function check-rls..."
  
  RESPONSE=$(curl -s -X GET "${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/check-rls" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json")
  
  # Verificar se a resposta contém um erro
  if echo "$RESPONSE" | grep -q "error"; then
    echo -e "${YELLOW}Não foi possível verificar o status via Edge Function. Tentando via CLI...${NC}"
    
    # Verificar se o usuário está logado no Supabase CLI
    if ! supabase projects list &> /dev/null; then
      echo "Você precisa fazer login no Supabase CLI primeiro."
      supabase login
    fi
    
    if [ -n "$PROJECT_ID" ]; then
      echo "Verificando status das políticas RLS via CLI para o projeto $PROJECT_ID..."
      supabase db query --project-ref "$PROJECT_ID" \
        "SELECT table_name, row_security FROM pg_tables WHERE schemaname = 'public'" \
        --db-url "$SUPABASE_DB_URL"
    else
      echo -e "${YELLOW}ID do projeto não disponível. Não é possível verificar via CLI.${NC}"
      echo -e "${YELLOW}Por favor, verifique manualmente no Console do Supabase.${NC}"
    fi
  else
    # Exibir resultado da Edge Function
    echo "$RESPONSE" | jq .
  fi
}

# Função para aplicar políticas RLS
apply_rls_policies() {
  echo -e "${BLUE}Aplicando políticas RLS...${NC}"
  
  # Tentar usar a Edge Function apply-rls
  echo "Chamando Edge Function apply-rls..."
  
  RESPONSE=$(curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/apply-rls" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d '{}')
  
  # Verificar se a resposta contém um erro
  if echo "$RESPONSE" | grep -q "error"; then
    echo -e "${YELLOW}Não foi possível aplicar políticas via Edge Function. Tentando via migração...${NC}"
    
    # Verificar se o arquivo de migração existe
    if [ -f "supabase/migrations/20250305_rls_policies.sql" ]; then
      echo "Aplicando migração SQL..."
      
      if [ -n "$PROJECT_ID" ]; then
        supabase db push --project-ref "$PROJECT_ID"
      else
        echo -e "${YELLOW}ID do projeto não disponível. Não é possível aplicar via CLI.${NC}"
        echo -e "${YELLOW}Por favor, aplique manualmente no Console do Supabase.${NC}"
      fi
    else
      echo -e "${YELLOW}Arquivo de migração não encontrado.${NC}"
      echo -e "${YELLOW}Por favor, aplique as políticas manualmente no Console do Supabase.${NC}"
    fi
  else
    # Exibir resultado da Edge Function
    echo "$RESPONSE" | jq .
  fi
}

# Função para gerar documentação do banco de dados
generate_documentation() {
  echo -e "${BLUE}Gerando documentação do banco de dados...${NC}"
  
  # Tentar usar a Edge Function rls-documentation
  echo "Chamando Edge Function rls-documentation..."
  
  RESPONSE=$(curl -s -X GET "${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/rls-documentation" \
    -H "Authorization: Bearer ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json")
  
  # Verificar se a resposta contém um erro
  if echo "$RESPONSE" | grep -q "error"; then
    echo -e "${YELLOW}Não foi possível gerar documentação via Edge Function.${NC}"
  else
    # Extrair o markdown da resposta
    echo "$RESPONSE" | jq -r '.markdown' > "database-documentation-$(date +%Y%m%d).md"
    echo -e "${GREEN}Documentação gerada com sucesso: database-documentation-$(date +%Y%m%d).md${NC}"
  fi
}

# Menu principal
echo -e "${BLUE}=== Verificação de Integridade do Banco de Dados ===${NC}"
echo "1. Verificar status das políticas RLS"
echo "2. Aplicar políticas RLS"
echo "3. Gerar documentação do banco de dados"
echo "4. Executar todas as verificações"
echo "5. Sair"

read -p "Escolha uma opção (1-5): " option

case $option in
  1)
    check_rls_status
    ;;
  2)
    apply_rls_policies
    ;;
  3)
    generate_documentation
    ;;
  4)
    check_rls_status
    apply_rls_policies
    generate_documentation
    ;;
  5)
    echo "Saindo..."
    exit 0
    ;;
  *)
    echo -e "${RED}Opção inválida!${NC}"
    exit 1
    ;;
esac

echo -e "${GREEN}Operação concluída!${NC}"
