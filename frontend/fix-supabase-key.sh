#!/bin/bash

# Script para diagnosticar e corrigir problemas com a chave de API do Supabase
# Criado para resolver o erro "Invalid API key"

echo "=== Diagnóstico de Conexão do Supabase ==="
echo ""

ENV_LOCAL="/Users/Amarilho/Documents/2_AgentVox/frontend/.env.local"
ENV_EXAMPLE="/Users/Amarilho/Documents/2_AgentVox/frontend/.env.example.fixed"

# Verificar se .env.local existe
if [ -f "$ENV_LOCAL" ]; then
  echo "✅ Arquivo .env.local encontrado"
  
  # Verificar se contém as variáveis do Supabase
  if grep -q "NEXT_PUBLIC_SUPABASE_URL" "$ENV_LOCAL" && grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$ENV_LOCAL"; then
    echo "✅ Variáveis Supabase estão definidas no arquivo"
    
    # Extrair valores atuais (só mostraremos se há conteúdo, não o conteúdo real)
    URL_VALUE=$(grep "NEXT_PUBLIC_SUPABASE_URL" "$ENV_LOCAL" | cut -d '=' -f2)
    KEY_VALUE=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$ENV_LOCAL" | cut -d '=' -f2)
    
    if [ -z "$URL_VALUE" ]; then
      echo "❌ NEXT_PUBLIC_SUPABASE_URL está vazio!"
    else
      echo "✅ NEXT_PUBLIC_SUPABASE_URL tem valor definido (comprimento: ${#URL_VALUE})"
    fi
    
    if [ -z "$KEY_VALUE" ]; then
      echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY está vazio!"
    else
      echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY tem valor definido (comprimento: ${#KEY_VALUE})"
      
      # Verificar se a chave começa com formato esperado (eyJ...)
      if [[ ! "$KEY_VALUE" == eyJ* ]]; then
        echo "⚠️ AVISO: A chave ANON não tem o formato padrão esperado (eyJ...)"
        echo "   Isso pode indicar que a chave está corrompida ou incompleta"
      fi
    fi
    
    echo ""
    echo "=== Validando formato das variáveis ==="
    
    # Verificar se não há espaços extras ou aspas
    if [[ "$URL_VALUE" == *\"* || "$URL_VALUE" == *\'* ]]; then
      echo "⚠️ NEXT_PUBLIC_SUPABASE_URL contém aspas que podem causar problemas"
    fi
    
    if [[ "$KEY_VALUE" == *\"* || "$KEY_VALUE" == *\'* ]]; then
      echo "⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY contém aspas que podem causar problemas"
    fi
    
    # Verificar espaços extras
    if [[ "$URL_VALUE" == " "* || "$URL_VALUE" == *" " ]]; then
      echo "⚠️ NEXT_PUBLIC_SUPABASE_URL contém espaços extras que podem causar problemas"
    fi
    
    if [[ "$KEY_VALUE" == " "* || "$KEY_VALUE" == *" " ]]; then
      echo "⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY contém espaços extras que podem causar problemas"
    fi
    
  else
    echo "❌ Uma ou ambas variáveis do Supabase estão faltando no arquivo .env.local"
  fi
else
  echo "❌ Arquivo .env.local não encontrado!"
fi

echo ""
echo "=== Instruções para correção ==="
echo ""
echo "1. Vá até seu projeto Supabase (https://app.supabase.io)"
echo "2. Navegue para: Project Settings > API"
echo "3. Copie o valor de 'anon public' em 'Project API keys'"
echo "4. Abra o arquivo .env.local e certifique-se que NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   tenha exatamente o valor copiado, sem aspas ou espaços extras"
echo ""
echo "Exemplo de formato correto em .env.local:"
echo "NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklm.supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
echo ""
echo "Deseja que eu tente corrigir automaticamente o formato do seu arquivo .env.local? (s/n)"
read -r resposta

if [[ "$resposta" == "s" || "$resposta" == "S" ]]; then
  echo "Fazendo backup do arquivo atual..."
  cp "$ENV_LOCAL" "${ENV_LOCAL}.bak.$(date +%s)"
  
  echo "Corrigindo formato do arquivo .env.local..."
  # Remover aspas e espaços extras das variáveis Supabase
  sed -i '' 's/NEXT_PUBLIC_SUPABASE_URL=[ ]*"\([^"]*\)"[ ]*/NEXT_PUBLIC_SUPABASE_URL=\1/g' "$ENV_LOCAL"
  sed -i '' "s/NEXT_PUBLIC_SUPABASE_URL=[ ]*'\([^']*\)'[ ]*/NEXT_PUBLIC_SUPABASE_URL=\1/g" "$ENV_LOCAL"
  sed -i '' 's/NEXT_PUBLIC_SUPABASE_URL=[ ]*\([^ ].*[^ ]\)[ ]*/NEXT_PUBLIC_SUPABASE_URL=\1/g' "$ENV_LOCAL"
  
  sed -i '' 's/NEXT_PUBLIC_SUPABASE_ANON_KEY=[ ]*"\([^"]*\)"[ ]*/NEXT_PUBLIC_SUPABASE_ANON_KEY=\1/g' "$ENV_LOCAL"
  sed -i '' "s/NEXT_PUBLIC_SUPABASE_ANON_KEY=[ ]*'\([^']*\)'[ ]*/NEXT_PUBLIC_SUPABASE_ANON_KEY=\1/g" "$ENV_LOCAL"
  sed -i '' 's/NEXT_PUBLIC_SUPABASE_ANON_KEY=[ ]*\([^ ].*[^ ]\)[ ]*/NEXT_PUBLIC_SUPABASE_ANON_KEY=\1/g' "$ENV_LOCAL"
  
  echo "Correção concluída! Reinicie seu servidor de desenvolvimento para aplicar as mudanças."
else
  echo "Nenhuma alteração foi feita. Você precisará corrigir o arquivo manualmente."
fi
