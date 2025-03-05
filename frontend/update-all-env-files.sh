#!/bin/bash

# Script para atualizar as chaves do Supabase em todos os arquivos de ambiente
BASE_DIR="/Users/Amarilho/Documents/2_AgentVox/frontend"

# Chaves do Supabase
SUPABASE_URL="https://nwvxzlkhoobtotuixvpn.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDY2NTA1MCwiZXhwIjoyMDU2MjQxMDUwfQ.7-AyTs6wdS7GatZfgu04XLjfVC_WSyUHTfymMq9JnJs"

# Arquivos de ambiente a serem atualizados
ENV_FILES=(
  ".env.local"
  ".env.development"
  ".env.production"
  ".env.example"
  ".env.example.fixed"
)

echo "Iniciando atualização de chaves do Supabase em todos os arquivos de ambiente..."

for env_file in "${ENV_FILES[@]}"; do
  full_path="$BASE_DIR/$env_file"
  
  if [ -f "$full_path" ]; then
    echo "Processando $env_file..."
    
    # Fazer backup do arquivo
    backup_file="${full_path}.bak.$(date +%s)"
    cp "$full_path" "$backup_file"
    echo "  Backup criado em: $backup_file"
    
    # Atualizar ou adicionar NEXT_PUBLIC_SUPABASE_URL
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" "$full_path"; then
      sed -i '' "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|g" "$full_path"
      echo "  NEXT_PUBLIC_SUPABASE_URL atualizada."
    else
      echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" >> "$full_path"
      echo "  NEXT_PUBLIC_SUPABASE_URL adicionada."
    fi
    
    # Atualizar ou adicionar NEXT_PUBLIC_SUPABASE_ANON_KEY
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$full_path"; then
      sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|g" "$full_path"
      echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY atualizada."
    else
      echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> "$full_path"
      echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY adicionada."
    fi
    
    # Atualizar ou adicionar SUPABASE_SERVICE_ROLE_KEY
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" "$full_path"; then
      sed -i '' "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY|g" "$full_path"
      echo "  SUPABASE_SERVICE_ROLE_KEY atualizada."
    else
      echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY" >> "$full_path"
      echo "  SUPABASE_SERVICE_ROLE_KEY adicionada."
    fi
    
    echo "  $env_file atualizado com sucesso."
  else
    echo "Arquivo $env_file não encontrado, criando..."
    echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" > "$full_path"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY" >> "$full_path"
    echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY" >> "$full_path"
    echo "  $env_file criado com as chaves do Supabase."
  fi
  
  echo ""
done

echo "Atualização de chaves do Supabase concluída em todos os arquivos de ambiente."
echo ""
echo "Para aplicar as alterações, reinicie o servidor Next.js:"
echo "$ cd frontend && npm run dev"
