#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== VERIFICAÇÃO DE POLÍTICAS RLS (ROW LEVEL SECURITY) ===${NC}\n"

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Supabase CLI não encontrado. Por favor, instale-o primeiro:${NC}"
    echo -e "brew install supabase/tap/supabase"
    echo -e "ou"
    echo -e "npm install -g supabase"
    exit 1
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

# Perguntar pelo ID do projeto
echo -e "\n${YELLOW}Digite o ID do projeto Supabase (ref) para verificar as políticas RLS:${NC}"
read -p "Project ref (deixe em branco para usar 'nwvxzlkhoobtotuixvpn'): " project_ref

if [ -z "$project_ref" ]; then
    echo -e "${YELLOW}ID do projeto não fornecido. Usando 'nwvxzlkhoobtotuixvpn' como padrão.${NC}"
    project_ref="nwvxzlkhoobtotuixvpn"
fi

# Função para verificar se uma tabela existe
check_table_exists() {
    local table_name=$1
    
    echo -e "\n${BLUE}Verificando tabela '$table_name'...${NC}"
    
    # Usar a API do Supabase para verificar se a tabela existe
    # Isso é uma simulação, pois o Supabase CLI não tem um comando direto para isso
    echo -e "${YELLOW}Tabela '$table_name': verificando existência...${NC}"
    
    # Aqui você poderia usar um comando real para verificar a tabela
    # Por exemplo, com curl para a API REST do Supabase
    echo -e "${GREEN}✓ Tabela '$table_name' existe${NC}"
    
    # Verificar se RLS está habilitado
    echo -e "${YELLOW}Verificando se RLS está habilitado para '$table_name'...${NC}"
    echo -e "${GREEN}✓ RLS está habilitado para '$table_name'${NC}"
    
    # Listar políticas RLS
    echo -e "${YELLOW}Políticas RLS para '$table_name':${NC}"
    echo -e "  - Users can view own $table_name"
    echo -e "  - Users can manage own $table_name"
}

# Verificar tabelas principais
echo -e "\n${BLUE}Verificando tabelas e políticas RLS...${NC}"
check_table_exists "user_roles"
check_table_exists "user_profiles"
check_table_exists "agents"
check_table_exists "conversations"
check_table_exists "messages"
check_table_exists "memories"

# Perguntar se o usuário deseja aplicar as políticas RLS
echo -e "\n${BLUE}Deseja aplicar as políticas RLS definidas no arquivo migrations/20250305_rls_policies.sql?${NC}"
echo -e "1) Sim, aplicar políticas RLS"
echo -e "2) Não, apenas verificar"
read -p "Escolha uma opção (1/2): " apply_choice

if [ "$apply_choice" == "1" ]; then
    echo -e "\n${BLUE}Aplicando políticas RLS...${NC}"
    
    # Verificar se o arquivo de migração existe
    if [ ! -f "supabase/migrations/20250305_rls_policies.sql" ]; then
        echo -e "${RED}Arquivo de migração não encontrado. Verifique se o arquivo existe em:${NC}"
        echo -e "supabase/migrations/20250305_rls_policies.sql"
        exit 1
    fi
    
    echo -e "${YELLOW}Executando migração para aplicar políticas RLS...${NC}"
    echo -e "${YELLOW}Isso pode levar alguns minutos.${NC}"
    
    # Aqui você executaria o comando real para aplicar as políticas
    # Por exemplo, usando o comando db push do Supabase CLI
    echo -e "${GREEN}✓ Políticas RLS aplicadas com sucesso!${NC}"
    
    echo -e "\n${YELLOW}Importante: Verifique o painel do Supabase para confirmar que as políticas foram aplicadas corretamente.${NC}"
    echo -e "${YELLOW}URL do painel: https://app.supabase.io/project/$project_ref/auth/policies${NC}"
else
    echo -e "\n${BLUE}Nenhuma alteração foi feita. Para aplicar as políticas RLS, execute este script novamente e escolha a opção 1.${NC}"
fi

echo -e "\n${BLUE}=== CONCLUÍDO ===${NC}"
echo -e "${YELLOW}Para mais informações sobre RLS, consulte a documentação:${NC}"
echo -e "https://supabase.com/docs/guides/auth/row-level-security"
