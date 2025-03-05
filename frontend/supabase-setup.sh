#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CONFIGURAÇÃO DO SUPABASE E EDGE FUNCTIONS ===${NC}\n"

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}Supabase CLI não encontrado. Instalando...${NC}"
    
    # Verificar se o Homebrew está instalado
    if command -v brew &> /dev/null; then
        brew install supabase/tap/supabase
    else
        echo -e "${RED}Homebrew não encontrado. Por favor, instale o Supabase CLI manualmente:${NC}"
        echo -e "npm install -g supabase"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Supabase CLI encontrado${NC}"

# Verificar se o usuário está logado no Supabase
echo -e "\n${BLUE}Verificando login no Supabase...${NC}"
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}Você precisa fazer login no Supabase CLI. Executando 'supabase login'...${NC}"
    supabase login
else
    echo -e "${GREEN}✓ Usuário já está logado no Supabase${NC}"
fi

# Perguntar se o usuário deseja implantar as Edge Functions
echo -e "\n${BLUE}Deseja implantar as Edge Functions para o projeto Supabase?${NC}"
echo -e "1) Sim, implantar Edge Functions"
echo -e "2) Não, apenas configurar localmente"
read -p "Escolha uma opção (1/2): " deploy_choice

if [ "$deploy_choice" == "1" ]; then
    # Verificar se o usuário já tem um projeto Supabase
    echo -e "\n${BLUE}Verificando projetos Supabase...${NC}"
    supabase projects list
    
    # Perguntar pelo ID do projeto
    echo -e "\n${YELLOW}Digite o ID do projeto Supabase (ref) para implantar as Edge Functions:${NC}"
    read -p "Project ref: " project_ref
    
    if [ -z "$project_ref" ]; then
        echo -e "${RED}ID do projeto não fornecido. Usando 'nwvxzlkhoobtotuixvpn' como padrão.${NC}"
        project_ref="nwvxzlkhoobtotuixvpn"
    fi
    
    # Vincular o projeto local ao projeto remoto
    echo -e "\n${BLUE}Vinculando projeto local ao projeto remoto...${NC}"
    supabase link --project-ref "$project_ref"
    
    # Configurar secrets para as Edge Functions
    echo -e "\n${BLUE}Configurando secrets para as Edge Functions...${NC}"
    echo -e "${YELLOW}Digite a URL do Supabase (ex: https://nwvxzlkhoobtotuixvpn.supabase.co):${NC}"
    read -p "URL: " supabase_url
    
    echo -e "${YELLOW}Digite a chave anônima do Supabase:${NC}"
    read -p "Anon Key: " supabase_anon_key
    
    echo -e "${YELLOW}Digite a chave de serviço do Supabase:${NC}"
    read -p "Service Role Key: " supabase_service_key
    
    # Configurar secrets
    echo -e "\n${BLUE}Configurando secrets no Supabase...${NC}"
    supabase secrets set SUPABASE_URL="$supabase_url" --project-ref "$project_ref"
    supabase secrets set SUPABASE_ANON_KEY="$supabase_anon_key" --project-ref "$project_ref"
    supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$supabase_service_key" --project-ref "$project_ref"
    
    # Implantar as Edge Functions
    echo -e "\n${BLUE}Implantando Edge Functions...${NC}"
    supabase functions deploy auth-handler --project-ref "$project_ref"
    supabase functions deploy check-connection --project-ref "$project_ref"
    
    echo -e "\n${GREEN}✓ Edge Functions implantadas com sucesso!${NC}"
    
    # Atualizar o arquivo .env.local com a URL das Edge Functions
    echo -e "\n${BLUE}Atualizando arquivo .env.local...${NC}"
    
    # Verificar se o arquivo .env.local existe
    if [ ! -f ".env.local" ]; then
        echo -e "${YELLOW}Arquivo .env.local não encontrado. Criando a partir do .env.example...${NC}"
        
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            echo -e "${GREEN}Arquivo .env.local criado com sucesso!${NC}"
        else
            echo -e "${RED}Arquivo .env.example não encontrado. Criando um arquivo .env.local básico...${NC}"
            
            cat > .env.local << EOF
# Configuração do Supabase para o projeto AgentVox
NEXT_PUBLIC_SUPABASE_URL=$supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_anon_key
NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=$supabase_url/functions/v1

# OpenAI - API para embeddings e processamento de linguagem natural
OPENAI_API_KEY=sua-chave-da-api-openai
EOF
            
            echo -e "${GREEN}Arquivo .env.local básico criado com sucesso!${NC}"
        fi
    else
        # Fazer backup do arquivo .env.local
        cp .env.local .env.local.bak
        echo -e "${GREEN}Backup do arquivo .env.local criado como .env.local.bak${NC}"
        
        # Adicionar ou atualizar a variável NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL
        if grep -q "NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL" .env.local; then
            sed -i '' "s|NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=.*|NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=$supabase_url/functions/v1|g" .env.local
        else
            echo -e "\n# URL das Edge Functions do Supabase" >> .env.local
            echo "NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=$supabase_url/functions/v1" >> .env.local
        fi
        
        echo -e "${GREEN}Arquivo .env.local atualizado com a URL das Edge Functions${NC}"
    fi
    
    # Mostrar URLs das Edge Functions
    echo -e "\n${BLUE}URLs das Edge Functions:${NC}"
    echo -e "${GREEN}Auth Handler:${NC} $supabase_url/functions/v1/auth-handler"
    echo -e "${GREEN}Check Connection:${NC} $supabase_url/functions/v1/check-connection"
    
else
    echo -e "\n${BLUE}Configurando apenas localmente...${NC}"
    
    # Verificar se o Deno está instalado
    if ! command -v deno &> /dev/null; then
        echo -e "${YELLOW}Deno não encontrado. É necessário para testar as Edge Functions localmente.${NC}"
        echo -e "${YELLOW}Visite https://deno.land/#installation para instruções de instalação.${NC}"
    else
        echo -e "${GREEN}✓ Deno encontrado${NC}"
        
        # Perguntar se o usuário deseja testar as Edge Functions localmente
        echo -e "\n${BLUE}Deseja testar as Edge Functions localmente?${NC}"
        echo -e "1) Sim, iniciar servidor local"
        echo -e "2) Não, pular esta etapa"
        read -p "Escolha uma opção (1/2): " test_choice
        
        if [ "$test_choice" == "1" ]; then
            echo -e "\n${BLUE}Iniciando servidor local para testar Edge Functions...${NC}"
            echo -e "${YELLOW}Pressione Ctrl+C para parar o servidor quando terminar.${NC}"
            
            # Iniciar servidor local
            supabase functions serve
        fi
    fi
fi

echo -e "\n${BLUE}=== CONCLUÍDO ===${NC}"
echo -e "${YELLOW}Para mais informações, consulte o arquivo README.md na pasta supabase/functions${NC}"
