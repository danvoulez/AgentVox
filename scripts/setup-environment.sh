#!/bin/bash

# Script para configuração inicial do ambiente
# Este script ajuda a configurar o ambiente de desenvolvimento para o AgentVox

echo "=== Configuração do Ambiente AgentVox ==="
echo

# Verifica se o arquivo env.example existe
if [ ! -f "env.example" ]; then
  echo "❌ Arquivo env.example não encontrado!"
  echo "Execute este script no diretório raiz do projeto."
  exit 1
fi

# Verifica se já existem arquivos .env
if [ -f ".env.local" ]; then
  echo "⚠️ Arquivo .env.local já existe."
  read -p "Deseja sobrescrevê-lo? (s/n): " overwrite
  if [ "$overwrite" != "s" ]; then
    echo "Operação cancelada."
    exit 0
  fi
fi

# Copia o arquivo de exemplo para .env.local
cp env.example .env.local
echo "✅ Arquivo .env.local criado."

# Solicita informações do Supabase
echo
echo "Configuração do Supabase:"
echo "------------------------"
echo "Você precisará das seguintes informações do seu projeto Supabase:"
echo "1. URL do projeto (formato: https://seu-projeto.supabase.co)"
echo "2. Chave anônima (encontrada no painel do Supabase em Configurações > API)"
echo

read -p "URL do Supabase: " supabase_url
read -p "Chave anônima do Supabase: " supabase_key

# Atualiza o arquivo .env.local
sed -i '' "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$supabase_url|g" .env.local
sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_key|g" .env.local

echo "✅ Arquivo .env.local atualizado com as credenciais do Supabase."

# Cria cópias para outros ambientes
cp .env.local .env.development
cp .env.local .env.production
echo "✅ Arquivos .env.development e .env.production criados."

# Testa a conexão com o Supabase
echo
echo "Testando conexão com o Supabase..."
if [ -f "scripts/test-supabase.js" ]; then
  node scripts/test-supabase.js
else
  echo "⚠️ Script de teste do Supabase não encontrado."
  echo "Você pode testar manualmente executando 'node scripts/test-supabase.js'."
fi

echo
echo "=== Configuração concluída ==="
echo
echo "Próximos passos:"
echo "1. Execute 'npm run dev' para iniciar o servidor de desenvolvimento"
echo "2. Acesse http://localhost:3000 para verificar se tudo está funcionando"
echo "3. Verifique a página /status para confirmar a conexão com o Supabase"
echo
echo "Para mais informações, consulte o arquivo DEPLOYMENT.md"
