#!/bin/bash

# Script para corrigir rapidamente problemas com a chave API do Supabase
# Soluciona o erro "Invalid API key"

ENV_FILE="/Users/Amarilho/Documents/2_AgentVox/frontend/.env.local"
BACKUP_FILE="${ENV_FILE}.bak.$(date +%s)"

echo "Fazendo backup do .env.local atual..."
cp "$ENV_FILE" "$BACKUP_FILE"
echo "Backup criado em: $BACKUP_FILE"

echo "Corrigindo formato das variáveis Supabase (removendo aspas e espaços extras)..."
sed -i '' 's/NEXT_PUBLIC_SUPABASE_URL=[ ]*"\([^"]*\)"[ ]*/NEXT_PUBLIC_SUPABASE_URL=\1/g' "$ENV_FILE"
sed -i '' "s/NEXT_PUBLIC_SUPABASE_URL=[ ]*'\([^']*\)'[ ]*/NEXT_PUBLIC_SUPABASE_URL=\1/g" "$ENV_FILE"
sed -i '' 's/NEXT_PUBLIC_SUPABASE_URL=[ ]*\([^ ].*[^ ]\)[ ]*/NEXT_PUBLIC_SUPABASE_URL=\1/g' "$ENV_FILE"

sed -i '' 's/NEXT_PUBLIC_SUPABASE_ANON_KEY=[ ]*"\([^"]*\)"[ ]*/NEXT_PUBLIC_SUPABASE_ANON_KEY=\1/g' "$ENV_FILE"
sed -i '' "s/NEXT_PUBLIC_SUPABASE_ANON_KEY=[ ]*'\([^']*\)'[ ]*/NEXT_PUBLIC_SUPABASE_ANON_KEY=\1/g" "$ENV_FILE"
sed -i '' 's/NEXT_PUBLIC_SUPABASE_ANON_KEY=[ ]*\([^ ].*[^ ]\)[ ]*/NEXT_PUBLIC_SUPABASE_ANON_KEY=\1/g' "$ENV_FILE"

echo "Verificando valores atuais..."
URL_VALUE=$(grep "NEXT_PUBLIC_SUPABASE_URL" "$ENV_FILE" | cut -d '=' -f2)
KEY_VALUE=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$ENV_FILE" | cut -d '=' -f2)

if [ -z "$URL_VALUE" ]; then
  echo "ALERTA: NEXT_PUBLIC_SUPABASE_URL está vazio!"
else
  echo "URL do Supabase configurado (comprimento: ${#URL_VALUE})"
fi

if [ -z "$KEY_VALUE" ]; then
  echo "ALERTA: NEXT_PUBLIC_SUPABASE_ANON_KEY está vazio!"
else
  echo "Chave Anon do Supabase configurada (comprimento: ${#KEY_VALUE})"
fi

echo ""
echo "Para obter uma nova chave válida:"
echo "1. Acesse https://app.supabase.io e faça login"
echo "2. Selecione seu projeto"
echo "3. Vá para Project Settings > API"
echo "4. Copie o valor da 'anon public key'"
echo "5. Substitua em .env.local sem aspas ou espaços extras"
echo ""
echo "IMPORTANTE: Reinicie o servidor Next.js após atualizar suas chaves:"
echo "$ cd frontend && npm run dev"
