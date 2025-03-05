#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== SOLUÇÃO DEFINITIVA PARA PROBLEMAS DE CONEXÃO COM SUPABASE ===${NC}\n"

# Diretório do frontend
FRONTEND_DIR="/Users/Amarilho/Documents/2_AgentVox/frontend"
ENV_FILE="${FRONTEND_DIR}/.env.local"
BACKUP_DIR="${FRONTEND_DIR}/backups"
BACKUP_FILE="${BACKUP_DIR}/env.local.bak.$(date +%s)"

# Criar diretório de backups se não existir
mkdir -p "$BACKUP_DIR"

# Verificar se o arquivo .env.local existe
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}ERRO: Arquivo .env.local não encontrado!${NC}"
  echo -e "Criando um arquivo .env.local com as credenciais corretas...\n"
  
  # Criar arquivo .env.local com as credenciais corretas
  cat > "$ENV_FILE" << EOF
# Configuração do Supabase para o projeto AgentVox
NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ

# OpenAI - API para embeddings e processamento de linguagem natural
OPENAI_API_KEY=sua-chave-da-api-openai
EOF
  
  echo -e "${GREEN}Arquivo .env.local criado com sucesso!${NC}"
else
  echo -e "${YELLOW}Arquivo .env.local encontrado. Fazendo backup...${NC}"
  
  # Fazer backup do arquivo atual
  cp "$ENV_FILE" "$BACKUP_FILE"
  echo -e "${GREEN}Backup do arquivo .env.local criado em ${BACKUP_FILE}${NC}"
  
  # Verificar e corrigir o formato das variáveis (remover aspas e espaços extras)
  echo -e "${YELLOW}Corrigindo formato das variáveis Supabase...${NC}"
  sed -i '' 's/NEXT_PUBLIC_SUPABASE_URL=[ ]*"\([^"]*\)"[ ]*/NEXT_PUBLIC_SUPABASE_URL=\1/g' "$ENV_FILE"
  sed -i '' "s/NEXT_PUBLIC_SUPABASE_URL=[ ]*'\([^']*\)'[ ]*/NEXT_PUBLIC_SUPABASE_URL=\1/g" "$ENV_FILE"
  sed -i '' 's/NEXT_PUBLIC_SUPABASE_URL=[ ]*\([^ ].*[^ ]\)[ ]*/NEXT_PUBLIC_SUPABASE_URL=\1/g' "$ENV_FILE"

  sed -i '' 's/NEXT_PUBLIC_SUPABASE_ANON_KEY=[ ]*"\([^"]*\)"[ ]*/NEXT_PUBLIC_SUPABASE_ANON_KEY=\1/g' "$ENV_FILE"
  sed -i '' "s/NEXT_PUBLIC_SUPABASE_ANON_KEY=[ ]*'\([^']*\)'[ ]*/NEXT_PUBLIC_SUPABASE_ANON_KEY=\1/g" "$ENV_FILE"
  sed -i '' 's/NEXT_PUBLIC_SUPABASE_ANON_KEY=[ ]*\([^ ].*[^ ]\)[ ]*/NEXT_PUBLIC_SUPABASE_ANON_KEY=\1/g' "$ENV_FILE"
  
  # Verificar e atualizar as credenciais
  if grep -q "NEXT_PUBLIC_SUPABASE_URL" "$ENV_FILE"; then
    echo -e "${YELLOW}Atualizando URL do Supabase...${NC}"
    sed -i '' "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co|g" "$ENV_FILE"
  else
    echo -e "${YELLOW}Adicionando URL do Supabase...${NC}"
    echo "NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co" >> "$ENV_FILE"
  fi
  
  if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$ENV_FILE"; then
    echo -e "${YELLOW}Atualizando chave anônima do Supabase...${NC}"
    sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ|g" "$ENV_FILE"
  else
    echo -e "${YELLOW}Adicionando chave anônima do Supabase...${NC}"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ" >> "$ENV_FILE"
  fi
  
  echo -e "${GREEN}Credenciais do Supabase atualizadas com sucesso!${NC}"
fi

# Verificar valores atuais
echo -e "\n${YELLOW}Verificando valores atuais...${NC}"
URL_VALUE=$(grep "NEXT_PUBLIC_SUPABASE_URL" "$ENV_FILE" | cut -d '=' -f2)
KEY_VALUE=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$ENV_FILE" | cut -d '=' -f2)

if [ -z "$URL_VALUE" ]; then
  echo -e "${RED}ALERTA: NEXT_PUBLIC_SUPABASE_URL está vazio!${NC}"
else
  echo -e "${GREEN}URL do Supabase configurado (comprimento: ${#URL_VALUE})${NC}"
fi

if [ -z "$KEY_VALUE" ]; then
  echo -e "${RED}ALERTA: NEXT_PUBLIC_SUPABASE_ANON_KEY está vazio!${NC}"
else
  echo -e "${GREEN}Chave Anon do Supabase configurada (comprimento: ${#KEY_VALUE})${NC}"
fi

# Criar página de teste simples
echo -e "\n${YELLOW}Criando página de teste simples...${NC}"
TEST_PAGE_DIR="${FRONTEND_DIR}/src/pages"
TEST_PAGE_FILE="${TEST_PAGE_DIR}/supabase-test.js"

mkdir -p "$TEST_PAGE_DIR"

cat > "$TEST_PAGE_FILE" << 'EOF'
// Página de teste para verificar a conexão com o Supabase
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function SupabaseTest() {
  const [status, setStatus] = useState('Verificando...');
  const [envVars, setEnvVars] = useState({
    url: '',
    keyLength: 0
  });
  
  useEffect(() => {
    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    setEnvVars({
      url: supabaseUrl,
      keyLength: supabaseKey.length
    });
    
    // Testar conexão
    const testConnection = async () => {
      try {
        if (!supabaseUrl || !supabaseKey) {
          setStatus('Erro: Variáveis de ambiente não configuradas');
          return;
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        
        if (error) {
          setStatus(`Erro de conexão: ${error.message}`);
        } else {
          setStatus('Conexão estabelecida com sucesso!');
        }
      } catch (err) {
        setStatus(`Erro: ${err.message}`);
      }
    };
    
    testConnection();
  }, []);
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Teste de Conexão com Supabase</h1>
      
      <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '20px' }}>
        <h2>Status da Conexão</h2>
        <p style={{ 
          padding: '10px', 
          backgroundColor: status.includes('sucesso') ? '#d4edda' : '#f8d7da',
          color: status.includes('sucesso') ? '#155724' : '#721c24',
          borderRadius: '3px'
        }}>
          {status}
        </p>
      </div>
      
      <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Variáveis de Ambiente</h2>
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {envVars.url || 'Não definida'}</p>
        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {envVars.keyLength > 0 ? `Definida (comprimento: ${envVars.keyLength})` : 'Não definida'}</p>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Próximos Passos</h2>
        <ol>
          <li>Se a conexão foi estabelecida com sucesso, tente fazer login em <a href="/auth/login">/auth/login</a></li>
          <li>Se ainda houver problemas, verifique se o projeto Supabase está ativo e acessível</li>
          <li>Verifique se as credenciais não expiraram</li>
        </ol>
      </div>
    </div>
  );
}
EOF

echo -e "${GREEN}Página de teste criada em ${TEST_PAGE_FILE}${NC}"

# Limpar o cache do Next.js
echo -e "\n${YELLOW}Limpando o cache do Next.js...${NC}"
rm -rf "${FRONTEND_DIR}/.next"
echo -e "${GREEN}Cache do Next.js limpo com sucesso!${NC}"

# Verificar se o pacote @supabase/supabase-js está instalado
echo -e "\n${YELLOW}Verificando se o pacote @supabase/supabase-js está instalado...${NC}"
if grep -q "@supabase/supabase-js" "${FRONTEND_DIR}/package.json"; then
  echo -e "${GREEN}Pacote @supabase/supabase-js encontrado no package.json.${NC}"
else
  echo -e "${RED}Pacote @supabase/supabase-js não encontrado no package.json. Instalando...${NC}"
  cd "${FRONTEND_DIR}" && npm install @supabase/supabase-js
  echo -e "${GREEN}Pacote @supabase/supabase-js instalado com sucesso!${NC}"
fi

# Parar instâncias do Next.js em execução
echo -e "\n${YELLOW}Parando instâncias do Next.js em execução...${NC}"
pkill -f "next dev" || true
echo -e "${GREEN}Instâncias do Next.js paradas!${NC}"

# Iniciar o servidor Next.js com as variáveis de ambiente
echo -e "\n${YELLOW}Iniciando o servidor Next.js com as variáveis de ambiente...${NC}"
cd "${FRONTEND_DIR}" && NEXT_PUBLIC_SUPABASE_URL="$URL_VALUE" NEXT_PUBLIC_SUPABASE_ANON_KEY="$KEY_VALUE" npm run dev &
SERVER_PID=$!

echo -e "\n${BLUE}=== PRÓXIMOS PASSOS ===${NC}"
echo -e "1. ${YELLOW}Aguarde o servidor iniciar completamente${NC}"
echo -e "2. ${YELLOW}Acesse a página de teste:${NC} http://localhost:3000/supabase-test"
echo -e "3. ${YELLOW}Se a conexão estiver funcionando, tente fazer login:${NC} http://localhost:3000/auth/login"

echo -e "\n${GREEN}Script concluído com sucesso!${NC}"
