#!/bin/bash

# Script para verificar a presença de segredos em arquivos antes de commit
# Uso: ./scripts/check-secrets.sh [--staged]
#   --staged: Verifica apenas arquivos staged para commit

echo "=== Verificação de Segredos no Código ==="
echo

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Padrões de segredos para procurar
PATTERNS=(
  "AKIA[0-9A-Z]{16}"                         # AWS Access Key
  "sk_live_[0-9a-zA-Z]{24}"                  # Stripe Secret Key
  "sk-[a-zA-Z0-9]{48}"                       # OpenAI API Key
  "eyJ[a-zA-Z0-9_-]{10,}\\.[a-zA-Z0-9_-]{10,}\\.[a-zA-Z0-9_-]{10,}" # JWT
  "xox[baprs]-([0-9a-zA-Z]{10,48})"          # Slack Token
  "github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}" # GitHub Personal Access Token
  "-----BEGIN (RSA|EC|DSA|OPENSSH) PRIVATE KEY-----" # Private Keys
)

# Arquivos e diretórios a ignorar
IGNORE_PATTERNS=(
  ".git/"
  "node_modules/"
  "*.min.js"
  "*.lock"
  "*.svg"
  "*.png"
  "*.jpg"
  "*.jpeg"
  "*.gif"
  "*.ico"
  "*.woff"
  "*.ttf"
  "*.eot"
)

# Montar string de exclusão para grep
EXCLUDE_STRING=""
for pattern in "${IGNORE_PATTERNS[@]}"; do
  EXCLUDE_STRING="$EXCLUDE_STRING --exclude-dir=$pattern --exclude=$pattern"
done

# Determinar quais arquivos verificar
if [[ "$1" == "--staged" ]]; then
  echo "Verificando apenas arquivos staged para commit..."
  FILES=$(git diff --name-only --cached)
else
  echo "Verificando todos os arquivos no diretório..."
  FILES=$(find . -type f | grep -v -E "$(echo "${IGNORE_PATTERNS[@]}" | tr ' ' '|')")
fi

# Verificar se há arquivos .env
ENV_FILES=$(find . -name ".env*" | grep -v ".env.example")
if [[ -n "$ENV_FILES" ]]; then
  echo -e "${YELLOW}⚠️ Arquivos de ambiente detectados:${NC}"
  echo "$ENV_FILES"
  echo -e "${YELLOW}Estes arquivos podem conter segredos e não devem ser commitados.${NC}"
  echo
fi

# Verificar segredos nos arquivos
FOUND_SECRETS=0
for pattern in "${PATTERNS[@]}"; do
  echo -e "Procurando por: ${YELLOW}$pattern${NC}"
  
  for file in $FILES; do
    if [[ -f "$file" ]]; then
      RESULT=$(grep -E "$pattern" "$file" $EXCLUDE_STRING)
      if [[ -n "$RESULT" ]]; then
        echo -e "${RED}✗ Possível segredo encontrado em:${NC} $file"
        echo -e "${YELLOW}$(grep -n -E "$pattern" "$file")${NC}"
        echo
        FOUND_SECRETS=1
      fi
    fi
  done
done

# Verificar se há hardcoded URLs do Supabase
SUPABASE_URLS=$(grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" "supabase\.co" . | grep -v "process.env")
if [[ -n "$SUPABASE_URLS" ]]; then
  echo -e "${YELLOW}⚠️ URLs do Supabase hardcoded detectadas:${NC}"
  echo "$SUPABASE_URLS"
  echo -e "${YELLOW}Estas URLs devem usar variáveis de ambiente.${NC}"
  echo
  FOUND_SECRETS=1
fi

# Resumo
if [[ $FOUND_SECRETS -eq 0 ]]; then
  echo -e "${GREEN}✓ Nenhum segredo encontrado nos arquivos verificados.${NC}"
  echo
  echo "Recomendações para commits seguros:"
  echo "1. Faça commits pequenos e frequentes"
  echo "2. Use mensagens descritivas (ex: 'feat: adiciona autenticação com Google')"
  echo "3. Verifique novamente antes de push para o repositório remoto"
  exit 0
else
  echo -e "${RED}✗ Segredos encontrados! Corrija os problemas antes de commit.${NC}"
  echo
  echo "Ações recomendadas:"
  echo "1. Remova os segredos dos arquivos"
  echo "2. Use variáveis de ambiente para armazenar segredos"
  echo "3. Adicione os arquivos com segredos ao .gitignore"
  echo "4. Se um segredo foi exposto, revogue-o imediatamente"
  exit 1
fi
