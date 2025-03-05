#!/bin/bash

# Script para atualizar a chave de serviço do Supabase no arquivo .env.local
ENV_FILE="/Users/Amarilho/Documents/2_AgentVox/frontend/.env.local"
BACKUP_FILE="${ENV_FILE}.bak.$(date +%s)"

# Fazer backup do arquivo atual
echo "Fazendo backup do arquivo .env.local atual..."
cp "$ENV_FILE" "$BACKUP_FILE"
echo "Backup criado em: $BACKUP_FILE"

# Nova chave de serviço
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDY2NTA1MCwiZXhwIjoyMDU2MjQxMDUwfQ.7-AyTs6wdS7GatZfgu04XLjfVC_WSyUHTfymMq9JnJs"

# Atualizar a chave de serviço no arquivo
if grep -q "SUPABASE_SERVICE_ROLE_KEY" "$ENV_FILE"; then
  # Substituir a variável existente
  sed -i '' "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY|g" "$ENV_FILE"
  echo "SUPABASE_SERVICE_ROLE_KEY atualizada com sucesso."
else
  # Adicionar a variável se não existir
  echo "SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY" >> "$ENV_FILE"
  echo "SUPABASE_SERVICE_ROLE_KEY adicionada com sucesso."
fi

echo ""
echo "Para aplicar as alterações, reinicie o servidor Next.js:"
echo "$ cd frontend && npm run dev"
