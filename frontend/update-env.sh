#!/bin/bash

# Script para atualizar as credenciais do Supabase no arquivo .env.local
ENV_FILE="/Users/Amarilho/Documents/2_AgentVox/frontend/.env.local"
BACKUP_FILE="${ENV_FILE}.bak.$(date +%s)"

# Fazer backup do arquivo atual
echo "Fazendo backup do arquivo .env.local atual..."
cp "$ENV_FILE" "$BACKUP_FILE"
echo "Backup criado em: $BACKUP_FILE"

# Atualizar as variáveis do Supabase
echo "Atualizando as credenciais do Supabase..."
SUPABASE_URL="https://nwvxzlkhoobtotuixvpn.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.-BHyRvjNy-C0LLnOcJOlXOb67wtbuzdcE_ZGzEU4d9c"

# Verificar se as variáveis já existem no arquivo
if grep -q "NEXT_PUBLIC_SUPABASE_URL" "$ENV_FILE"; then
  # Substituir as variáveis existentes
  sed -i '' "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|g" "$ENV_FILE"
  echo "NEXT_PUBLIC_SUPABASE_URL atualizada."
else
  # Adicionar a variável se não existir
  echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" >> "$ENV_FILE"
  echo "NEXT_PUBLIC_SUPABASE_URL adicionada."
fi

if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$ENV_FILE"; then
  # Substituir as variáveis existentes
  sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY|g" "$ENV_FILE"
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY atualizada."
else
  # Adicionar a variável se não existir
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY" >> "$ENV_FILE"
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY adicionada."
fi

echo "Credenciais do Supabase atualizadas com sucesso!"
echo ""
echo "Para aplicar as alterações, reinicie o servidor Next.js:"
echo "$ cd frontend && npm run dev"
