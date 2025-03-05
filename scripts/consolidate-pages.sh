#!/bin/bash

# Script para consolidar a estrutura de diretórios de páginas
# Move todos os arquivos de pages/ para src/pages/ e remove duplicados

echo "=== Consolidando estrutura de diretórios de páginas ==="

# Verificar se ambos os diretórios existem
if [ ! -d "pages" ] || [ ! -d "src/pages" ]; then
  echo "Erro: Diretório pages/ ou src/pages/ não encontrado"
  exit 1
fi

# Criar backup dos diretórios
TIMESTAMP=$(date +%Y%m%d%H%M%S)
echo "Criando backup dos diretórios..."
mkdir -p backups/$TIMESTAMP
cp -r pages backups/$TIMESTAMP/pages
cp -r src/pages backups/$TIMESTAMP/src_pages

# Listar arquivos em pages/ que não existem em src/pages/
echo "Verificando arquivos únicos em pages/..."
for file in $(find pages -type f); do
  # Obter caminho relativo
  rel_path=${file#pages/}
  
  # Verificar se o arquivo existe em src/pages/
  if [ ! -f "src/pages/$rel_path" ]; then
    echo "Movendo arquivo único: $rel_path"
    # Criar diretório de destino se não existir
    mkdir -p "src/pages/$(dirname "$rel_path")"
    # Mover arquivo
    cp "$file" "src/pages/$rel_path"
  else
    echo "Arquivo duplicado (ignorando): $rel_path"
  fi
done

# Criar arquivo de lista de arquivos para verificação
echo "Criando lista de arquivos consolidados..."
find src/pages -type f > backups/$TIMESTAMP/consolidated_files.txt

echo "Backup criado em: backups/$TIMESTAMP/"
echo "Todos os arquivos foram consolidados em src/pages/"
echo ""
echo "IMPORTANTE: Verifique os arquivos antes de remover o diretório pages/"
echo "Para remover o diretório pages/ após verificação, execute:"
echo "  rm -rf pages"
echo ""
echo "=== Consolidação concluída ==="
