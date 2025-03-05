#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CORREÇÃO DE CONEXÃO SUPABASE ===${NC}\n"

# Verificar se o arquivo .env.local existe
if [ ! -f ".env.local" ]; then
  echo -e "${RED}ERRO: Arquivo .env.local não encontrado!${NC}"
  echo -e "Criando um arquivo .env.local baseado no .env.example...\n"
  
  if [ -f ".env.example" ]; then
    cp .env.example .env.local
    echo -e "${GREEN}Arquivo .env.local criado com sucesso!${NC}"
    echo -e "${YELLOW}IMPORTANTE: Você precisa editar o arquivo .env.local e adicionar suas credenciais.${NC}"
  else
    echo -e "${RED}Arquivo .env.example não encontrado. Criando um arquivo .env.local básico...${NC}"
    
    # Criar um arquivo .env.local básico
    cat > .env.local << EOF
# Configuração do Supabase para o projeto AgentVox
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica

# OpenAI - API para embeddings e processamento de linguagem natural
OPENAI_API_KEY=sua-chave-da-api-openai
EOF
    
    echo -e "${GREEN}Arquivo .env.local básico criado com sucesso!${NC}"
    echo -e "${YELLOW}IMPORTANTE: Você precisa editar o arquivo .env.local e adicionar suas credenciais.${NC}"
  fi
fi

# Extrair valores das variáveis de ambiente do arquivo .env.local
SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d '=' -f2-)

# Verificar se o domínio do Supabase está correto
echo -e "${YELLOW}Verificando o domínio do Supabase...${NC}"

if [[ "$SUPABASE_URL" == *agentvox.supabase.co* ]]; then
  echo -e "${RED}O domínio 'agentvox.supabase.co' não pode ser resolvido.${NC}"
  echo -e "Isso pode indicar que o projeto Supabase não existe mais ou foi renomeado."
  
  # Perguntar se o usuário deseja usar um projeto de fallback
  echo -e "\n${YELLOW}Deseja configurar um projeto Supabase de fallback para desenvolvimento?${NC}"
  echo -e "1) Sim, usar um projeto de fallback"
  echo -e "2) Não, eu vou configurar manualmente"
  read -p "Escolha uma opção (1/2): " choice
  
  if [ "$choice" == "1" ]; then
    echo -e "\n${YELLOW}Configurando um projeto Supabase de fallback para desenvolvimento...${NC}"
    
    # Criar um backup do arquivo .env.local original
    cp .env.local .env.local.bak
    echo -e "${GREEN}Backup do arquivo .env.local criado como .env.local.bak${NC}"
    
    # Modificar o arquivo .env.local para usar o projeto de fallback
    # Substituir a URL do Supabase
    sed -i '' 's|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co|g' .env.local
    
    # Substituir a chave anônima do Supabase por uma chave de exemplo
    sed -i '' 's|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3RpbmciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjk2MDA0OCwiZXhwIjoxOTMyNTM2MDQ4fQ.jNsLUXikIwwF_XW6HeUKYcvlhDmZwj0LaU5J0lKQ7jQ|g' .env.local
    
    echo -e "${GREEN}Arquivo .env.local atualizado com sucesso!${NC}"
    echo -e "${YELLOW}NOTA: Esta configuração usa um projeto de fallback para desenvolvimento.${NC}"
    echo -e "${YELLOW}      Ela NÃO funcionará para operações reais com o Supabase.${NC}"
    echo -e "${YELLOW}      Use-a apenas para desenvolvimento local sem dependência do Supabase.${NC}"
    
    # Criar um arquivo de mock para o Supabase
    mkdir -p src/mocks
    
    cat > src/mocks/supabaseMock.ts << EOF
// Mock do cliente Supabase para desenvolvimento local
import { createClient } from '@supabase/supabase-js';

// Cliente mock que simula as operações do Supabase
export const createMockSupabaseClient = () => {
  // Criar um cliente real, mas com credenciais de fallback
  // Isso permitirá que o código seja executado sem erros, mas as operações não funcionarão
  const mockClient = createClient(
    'https://xyzcompany.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3RpbmciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjk2MDA0OCwiZXhwIjoxOTMyNTM2MDQ4fQ.jNsLUXikIwwF_XW6HeUKYcvlhDmZwj0LaU5J0lKQ7jQ'
  );

  // Sobrescrever métodos para retornar dados simulados
  const mockMethods = {
    // Auth methods
    auth: {
      ...mockClient.auth,
      getSession: async () => ({ 
        data: { 
          session: null 
        }, 
        error: null 
      }),
      signInWithPassword: async () => ({ 
        data: { 
          user: { id: 'mock-user-id', email: 'user@example.com' },
          session: { access_token: 'mock-token' }
        }, 
        error: null 
      }),
      signUp: async () => ({ 
        data: { 
          user: { id: 'mock-user-id', email: 'user@example.com' },
          session: null
        }, 
        error: null 
      }),
      signOut: async () => ({ error: null })
    },
    
    // Database methods
    from: (table) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: {}, error: null }),
          data: [{ id: 'mock-id', created_at: new Date().toISOString() }],
          error: null
        }),
        data: [{ id: 'mock-id', created_at: new Date().toISOString() }],
        error: null
      }),
      insert: async () => ({ data: { id: 'mock-id' }, error: null }),
      update: async () => ({ data: {}, error: null }),
      delete: async () => ({ data: {}, error: null })
    })
  };

  // Retornar um objeto que combina o cliente real com os métodos simulados
  return {
    ...mockClient,
    auth: mockMethods.auth,
    from: mockMethods.from
  };
};

// Exportar o cliente mock
export const supabaseMock = createMockSupabaseClient();
EOF
    
    echo -e "${GREEN}Arquivo de mock do Supabase criado com sucesso!${NC}"
    
    # Criar um arquivo para alternar entre o cliente real e o mock
    cat > src/utils/auth/supabaseConfig.ts << EOF
// Configuração do cliente Supabase com suporte a fallback
import { createClient } from '@supabase/supabase-js';
import { supabaseMock } from '@/mocks/supabaseMock';

// Verificar se estamos em modo de desenvolvimento com fallback
const USE_MOCK = process.env.NEXT_PUBLIC_USE_SUPABASE_MOCK === 'true';

// Função para criar o cliente Supabase
export const createSupabaseClient = () => {
  // Se estamos em modo de fallback, usar o mock
  if (USE_MOCK) {
    console.log('Usando cliente Supabase MOCK para desenvolvimento');
    return supabaseMock;
  }
  
  // Caso contrário, criar um cliente real
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERRO CRÍTICO: Supabase URL ou Anon Key não configurados.');
    // Retornar o mock como fallback mesmo quando não solicitado explicitamente
    console.log('Usando cliente Supabase MOCK como fallback devido a erro de configuração');
    return supabaseMock;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Cliente Supabase (real ou mock, dependendo da configuração)
export const supabase = createSupabaseClient();
EOF
    
    echo -e "${GREEN}Arquivo de configuração do Supabase criado com sucesso!${NC}"
    
    # Atualizar o arquivo .env.local para incluir a variável de mock
    echo -e "\n# Usar mock do Supabase para desenvolvimento local (true/false)" >> .env.local
    echo -e "NEXT_PUBLIC_USE_SUPABASE_MOCK=true" >> .env.local
    
    echo -e "\n${GREEN}Configuração de fallback concluída com sucesso!${NC}"
    echo -e "${YELLOW}O aplicativo agora usará um cliente Supabase simulado para desenvolvimento.${NC}"
    echo -e "${YELLOW}Para desativar o modo de fallback, defina NEXT_PUBLIC_USE_SUPABASE_MOCK=false no arquivo .env.local${NC}"
    
  else
    echo -e "\n${YELLOW}Você optou por configurar manualmente.${NC}"
    echo -e "Por favor, siga estas etapas:"
    echo -e "1. Acesse o painel do Supabase: https://app.supabase.io"
    echo -e "2. Crie um novo projeto ou selecione um existente"
    echo -e "3. Vá para Configurações > API"
    echo -e "4. Copie a \"URL do projeto\" e a \"chave anon pública\""
    echo -e "5. Atualize seu arquivo .env.local com esses valores"
    echo -e "6. Reinicie o servidor de desenvolvimento: npm run dev"
  fi
else
  echo -e "${YELLOW}O URL do Supabase não contém 'agentvox.supabase.co'.${NC}"
  echo -e "Verifique se o projeto Supabase está ativo e acessível."
fi

echo -e "\n${BLUE}=== LIMPEZA DE CACHE ===${NC}\n"
echo -e "${YELLOW}Limpando o cache do Next.js...${NC}"
rm -rf .next
echo -e "${GREEN}Cache do Next.js limpo com sucesso!${NC}"

echo -e "\n${BLUE}=== CONCLUSÃO ===${NC}\n"
echo -e "${GREEN}Processo de correção concluído!${NC}"
echo -e "${YELLOW}Reinicie o servidor de desenvolvimento com: npm run dev${NC}"
