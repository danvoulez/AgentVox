#!/bin/bash

# Script para adicionar a chave de serviço do Supabase ao arquivo .env.local
ENV_FILE="/Users/Amarilho/Documents/2_AgentVox/frontend/.env.local"
BACKUP_FILE="${ENV_FILE}.bak.$(date +%s)"

# Fazer backup do arquivo atual
echo "Fazendo backup do arquivo .env.local atual..."
cp "$ENV_FILE" "$BACKUP_FILE"
echo "Backup criado em: $BACKUP_FILE"

# Verificar se a chave de serviço já existe
if grep -q "SUPABASE_SERVICE_ROLE_KEY" "$ENV_FILE"; then
  echo "A variável SUPABASE_SERVICE_ROLE_KEY já existe no arquivo .env.local"
  echo "Para atualizar, edite o arquivo manualmente ou remova a linha primeiro."
  exit 1
fi

# Obter a URL e a chave anônima atuais
SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" "$ENV_FILE" | cut -d '=' -f2)
SUPABASE_ANON_KEY=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$ENV_FILE" | cut -d '=' -f2)

echo "URL atual do Supabase: $SUPABASE_URL"
echo "Chave anônima atual: ${SUPABASE_ANON_KEY:0:10}...${SUPABASE_ANON_KEY: -5}"

echo ""
echo "Para o login com Google funcionar corretamente, você precisa adicionar a chave de serviço (service role key) do Supabase."
echo "Esta chave é diferente da chave anônima e tem permissões mais elevadas."
echo ""
echo "Siga estas etapas para obter a chave de serviço:"
echo "1. Acesse https://app.supabase.io e faça login"
echo "2. Selecione seu projeto"
echo "3. Vá para Project Settings > API"
echo "4. Copie o valor de 'service_role' em 'Project API keys'"
echo ""
echo "ATENÇÃO: Esta chave tem permissões elevadas e não deve ser exposta publicamente!"
echo ""

# Solicitar a chave de serviço
read -p "Cole a chave de serviço do Supabase aqui: " SERVICE_KEY

# Validar a chave de serviço
if [[ -z "$SERVICE_KEY" ]]; then
  echo "Nenhuma chave fornecida. Operação cancelada."
  exit 1
fi

if [[ ${#SERVICE_KEY} -lt 20 ]]; then
  echo "A chave fornecida parece muito curta. Verifique se você copiou corretamente."
  exit 1
fi

# Adicionar a chave de serviço ao arquivo .env.local
echo "Adicionando SUPABASE_SERVICE_ROLE_KEY ao arquivo .env.local..."
echo "SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY" >> "$ENV_FILE"

echo "Chave de serviço adicionada com sucesso!"
echo ""
echo "Para aplicar as alterações, reinicie o servidor Next.js:"
echo "$ cd frontend && npm run dev"
