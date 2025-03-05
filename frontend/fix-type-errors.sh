#!/bin/bash

# Corrigir erros de tipo em arquivos TypeScript/TSX

# Função para substituir padrões em arquivos
replace_in_file() {
  local file=$1
  local pattern=$2
  local replacement=$3
  
  # Substituir o padrão no arquivo
  sed -i '' "s/$pattern/$replacement/g" "$file"
}

# Corrigir erros de tipo em arquivos específicos
echo "Corrigindo erros de tipo..."

# 1. Corrigir erros de tipo em arquivos de API
find /Users/Amarilho/Documents/2_AgentVox/frontend/src/pages/api -type f -name "*.ts" -exec sed -i '' 's/error\.message/error instanceof Error ? error.message : "Unknown error"/g' {} \;

# 2. Corrigir erros de tipo em componentes
find /Users/Amarilho/Documents/2_AgentVox/frontend/src/components -type f -name "*.tsx" -exec sed -i '' 's/\[\.\.\.\(new Set([^)]*)\)\]/Array.from(\1)/g' {} \;

# 3. Corrigir erros de tipo em páginas
find /Users/Amarilho/Documents/2_AgentVox/frontend/src/pages -type f -name "*.tsx" -exec sed -i '' 's/error\.message/error instanceof Error ? error.message : "Unknown error"/g' {} \;

# 4. Corrigir definições de arrays vazios com tipo
find /Users/Amarilho/Documents/2_AgentVox/frontend/src/components -type f -name "*.tsx" -exec sed -i '' 's/links: \[\]/links: [] as string[]/g' {} \;

echo "Correções concluídas!"
