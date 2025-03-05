#!/bin/bash

# Script para identificar e substituir placeholders no projeto AgentVox

# Cores para saída
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Função para exibir mensagens de erro e sair
error_exit() {
  echo -e "${RED}ERRO: $1${NC}" >&2
  exit 1
}

# Função para verificar se um comando existe
check_command() {
  if ! command -v $1 &> /dev/null; then
    error_exit "O comando '$1' não está instalado. Por favor, instale-o para continuar."
  fi
}

# Verificar comandos necessários
check_command "grep"
check_command "sed"

echo -e "${BLUE}=== Detector de Placeholders do AgentVox ===${NC}"
echo -e "Este script irá identificar e ajudar a substituir placeholders no projeto.\n"

# Diretório raiz do projeto
PROJECT_ROOT="/Users/Amarilho/Documents/2_AgentVox"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo -e "${BLUE}Verificando placeholders conhecidos...${NC}"

# Array com os placeholders a serem procurados
PLACEHOLDERS=(
  "nwvxzlkhoobtotuixvpn"
  "sua-chave-anon-publica"
  "sua-chave-service-role"
  "sua-chave-da-api-openai"
  "sua-chave-anonima"
)

# Array com as descrições dos placeholders
PLACEHOLDER_DESCRIPTIONS=(
  "ID do projeto Supabase"
  "Chave anônima do Supabase"
  "Chave de serviço do Supabase"
  "Chave da API OpenAI"
  "Chave anônima do Supabase (alternativa)"
)

# Arquivos a verificar
FILES_TO_CHECK=(
  "*.ts"
  "*.js"
  "*.tsx"
  "*.jsx"
  "*.md"
  "*.sh"
  "*.json"
  "*.env*"
  "*.sql"
)

# Função para verificar se um placeholder existe
check_placeholder() {
  local placeholder=$1
  local count=0
  
  for file_pattern in "${FILES_TO_CHECK[@]}"; do
    local files=$(find "$PROJECT_ROOT" -name "$file_pattern" -type f -not -path "*/node_modules/*" -not -path "*/\.git/*")
    for file in $files; do
      if grep -q "$placeholder" "$file"; then
        count=$((count + 1))
      fi
    done
  done
  
  echo $count
}

# Verificar cada placeholder e contá-los
echo -e "${MAGENTA}Verificando placeholders no projeto...${NC}"
echo -e "Isso pode levar alguns segundos...\n"

total_placeholders=0
placeholder_counts=()

for placeholder in "${PLACEHOLDERS[@]}"; do
  count=$(check_placeholder "$placeholder")
  placeholder_counts+=($count)
  total_placeholders=$((total_placeholders + count))
done

if [ $total_placeholders -eq 0 ]; then
  echo -e "${GREEN}Nenhum placeholder conhecido encontrado no projeto!${NC}"
  exit 0
fi

echo -e "${YELLOW}Foram encontrados placeholders que precisam ser substituídos:${NC}\n"

for i in "${!PLACEHOLDERS[@]}"; do
  if [ ${placeholder_counts[$i]} -gt 0 ]; then
    echo -e "${RED}→ ${PLACEHOLDERS[$i]}${NC} (${PLACEHOLDER_DESCRIPTIONS[$i]}): ${placeholder_counts[$i]} ocorrências"
  fi
done

echo -e "\n${BLUE}=== Verificação de Arquivos Específicos ===${NC}"

# Verificar arquivos específicos importantes
CRITICAL_FILES=(
  "$FRONTEND_DIR/.env.local"
  "$FRONTEND_DIR/.env.example"
  "$FRONTEND_DIR/update-supabase-url.sh"
  "$FRONTEND_DIR/supabase/functions/README.md"
  "$FRONTEND_DIR/check-rls.sh"
  "$FRONTEND_DIR/supabase-setup.sh"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "\n${MAGENTA}Verificando arquivo crítico: ${file}${NC}"
    
    has_placeholder=false
    for placeholder in "${PLACEHOLDERS[@]}"; do
      if grep -q "$placeholder" "$file"; then
        has_placeholder=true
        echo -e "${YELLOW}  ✗ Contém placeholder: ${placeholder}${NC}"
        
        # Mostrar linhas com o placeholder
        echo -e "${BLUE}    Linhas:${NC}"
        grep -n "$placeholder" "$file" | while read -r line; do
          line_num=$(echo "$line" | cut -d':' -f1)
          line_content=$(echo "$line" | cut -d':' -f2-)
          echo -e "      Linha $line_num: $line_content"
        done
      fi
    done
    
    if [ "$has_placeholder" = false ]; then
      echo -e "${GREEN}  ✓ Não contém placeholders conhecidos${NC}"
    fi
  fi
done

echo -e "\n${BLUE}=== Recomendações ===${NC}"
echo -e "Para substituir os placeholders, você tem várias opções:\n"

echo -e "1. ${GREEN}Substituição automática de valores críticos:${NC}"
echo -e "   Este script pode ajudá-lo a substituir os placeholders mais importantes.\n"

echo -e "2. ${GREEN}Configuração manual:${NC}"
echo -e "   - Supabase URL e chaves: Obtenha-os no console do Supabase (https://app.supabase.io)"
echo -e "   - OpenAI API key: Obtenha em https://platform.openai.com/api-keys\n"

# Perguntar se o usuário quer substituir os placeholders automaticamente
read -p "Deseja corrigir os placeholders automaticamente? (s/n): " auto_fix

if [[ "$auto_fix" == "s" || "$auto_fix" == "S" ]]; then
  echo -e "\n${BLUE}=== Substituição de Placeholders ===${NC}"
  
  # Obter ID do projeto Supabase
  read -p "Digite o ID do projeto Supabase (ou deixe em branco para pular): " supabase_id
  if [[ -n "$supabase_id" ]]; then
    find "$PROJECT_ROOT" -type f -not -path "*/node_modules/*" -not -path "*/\.git/*" -exec sed -i '' "s/nwvxzlkhoobtotuixvpn/$supabase_id/g" {} \;
    echo -e "${GREEN}✓ ID do projeto Supabase substituído${NC}"
  fi
  
  # Obter chave anônima do Supabase
  read -p "Digite a chave anônima do Supabase (ou deixe em branco para pular): " supabase_anon_key
  if [[ -n "$supabase_anon_key" ]]; then
    find "$PROJECT_ROOT" -type f -not -path "*/node_modules/*" -not -path "*/\.git/*" -exec sed -i '' "s/sua-chave-anon-publica/$supabase_anon_key/g" {} \;
    find "$PROJECT_ROOT" -type f -not -path "*/node_modules/*" -not -path "*/\.git/*" -exec sed -i '' "s/sua-chave-anonima/$supabase_anon_key/g" {} \;
    echo -e "${GREEN}✓ Chave anônima do Supabase substituída${NC}"
  fi
  
  # Obter chave de serviço do Supabase
  read -p "Digite a chave de serviço do Supabase (ou deixe em branco para pular): " supabase_service_key
  if [[ -n "$supabase_service_key" ]]; then
    find "$PROJECT_ROOT" -type f -not -path "*/node_modules/*" -not -path "*/\.git/*" -exec sed -i '' "s/sua-chave-service-role/$supabase_service_key/g" {} \;
    echo -e "${GREEN}✓ Chave de serviço do Supabase substituída${NC}"
  fi
  
  # Obter chave da API OpenAI
  read -p "Digite a chave da API OpenAI (ou deixe em branco para pular): " openai_api_key
  if [[ -n "$openai_api_key" ]]; then
    find "$PROJECT_ROOT" -type f -not -path "*/node_modules/*" -not -path "*/\.git/*" -exec sed -i '' "s/sua-chave-da-api-openai/$openai_api_key/g" {} \;
    echo -e "${GREEN}✓ Chave da API OpenAI substituída${NC}"
  fi
  
  echo -e "\n${GREEN}Substituição de placeholders concluída!${NC}"
  echo -e "${YELLOW}Nota: Alguns placeholders podem não ter sido substituídos.${NC}"
  echo -e "${YELLOW}Recomendamos verificar novamente executando este script.${NC}"
else
  echo -e "\n${YELLOW}Nenhuma substituição automática será realizada.${NC}"
  echo -e "Você precisará substituir os placeholders manualmente em cada arquivo."
fi

echo -e "\n${BLUE}=== Verificando arquivos .env ===${NC}"

# Verificar se .env.local existe e se tem valores reais (não placeholders)
if [ -f "$FRONTEND_DIR/.env.local" ]; then
  echo -e "${MAGENTA}Verificando .env.local:${NC}"
  
  # Verificar NEXT_PUBLIC_SUPABASE_URL
  if grep -q "NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co" "$FRONTEND_DIR/.env.local"; then
    echo -e "${RED}  ✗ NEXT_PUBLIC_SUPABASE_URL ainda é um placeholder${NC}"
  else
    echo -e "${GREEN}  ✓ NEXT_PUBLIC_SUPABASE_URL parece configurado${NC}"
  fi
  
  # Verificar NEXT_PUBLIC_SUPABASE_ANON_KEY
  if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave" "$FRONTEND_DIR/.env.local"; then
    echo -e "${RED}  ✗ NEXT_PUBLIC_SUPABASE_ANON_KEY ainda é um placeholder${NC}"
  else
    echo -e "${GREEN}  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY parece configurado${NC}"
  fi
  
  # Verificar OPENAI_API_KEY
  if grep -q "OPENAI_API_KEY=sua-chave" "$FRONTEND_DIR/.env.local"; then
    echo -e "${RED}  ✗ OPENAI_API_KEY ainda é um placeholder${NC}"
  else
    echo -e "${GREEN}  ✓ OPENAI_API_KEY parece configurado${NC}"
  fi
else
  echo -e "${RED}.env.local não encontrado. Você precisa criar este arquivo a partir de .env.example.${NC}"
fi

echo -e "\n${BLUE}=== Resumo ===${NC}"
echo -e "${GREEN}1. Este script identificou placeholders no projeto que precisam ser substituídos.${NC}"
echo -e "${GREEN}2. Arquivos críticos foram verificados individualmente.${NC}"
echo -e "${GREEN}3. Um processo de substituição automática foi oferecido.${NC}"

echo -e "\n${BLUE}=== Próximos Passos ===${NC}"
echo -e "${YELLOW}1. Certifique-se de que o arquivo .env.local está configurado corretamente.${NC}"
echo -e "${YELLOW}2. Execute novamente os scripts de verificação do ambiente:${NC}"
echo -e "   - ./check-env.sh ou node check-env.js"
echo -e "${YELLOW}3. Verifique as configurações do Supabase e OpenAI antes de iniciar o servidor.${NC}"

echo -e "\n${GREEN}Script concluído!${NC}"
