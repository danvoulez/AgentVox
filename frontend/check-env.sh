#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE ===${NC}\n"

# Função para mascarar strings sensíveis
mask_string() {
  local str=$1
  local len=${#str}
  
  if [ -z "$str" ]; then
    echo "[NÃO CONFIGURADO]"
    return
  fi
  
  if [ $len -le 8 ]; then
    echo "$(printf '*%.0s' $(seq 1 $len))"
    return
  fi
  
  local prefix="${str:0:4}"
  local suffix="${str: -4}"
  local middle_len=$((len - 8))
  local middle="$(printf '*%.0s' $(seq 1 $middle_len))"
  
  echo "${prefix}${middle}${suffix}"
}

# Verificar se o arquivo .env.local existe
if [ ! -f ".env.local" ]; then
  echo -e "${RED}ERRO: Arquivo .env.local não encontrado!${NC}"
  echo -e "Crie um arquivo .env.local na raiz do projeto frontend baseado no .env.example\n"
  
  # Mostrar conteúdo do .env.example
  if [ -f ".env.example" ]; then
    echo -e "${YELLOW}Conteúdo do .env.example:${NC}"
    cat .env.example
    echo ""
  fi
  
  exit 1
fi

# Extrair valores das variáveis de ambiente do arquivo .env.local
SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d '=' -f2-)
SUPABASE_KEY=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local | cut -d '=' -f2-)

# Verificar URL do Supabase
echo -e "NEXT_PUBLIC_SUPABASE_URL:"
if [ -z "$SUPABASE_URL" ]; then
  echo -e "  ${RED}✖ NÃO CONFIGURADO${NC}"
else
  echo -e "  ${GREEN}✓ CONFIGURADO${NC}: $(mask_string "$SUPABASE_URL")"
  echo -e "  Comprimento: ${#SUPABASE_URL} caracteres"
  
  # Verificar se começa com https://
  if [[ "$SUPABASE_URL" == https://* ]]; then
    echo -e "  Formato HTTPS: ${GREEN}✓${NC}"
  else
    echo -e "  Formato HTTPS: ${RED}✖${NC} (deve começar com https://)"
  fi
  
  # Verificar se contém .supabase.co
  if [[ "$SUPABASE_URL" == *supabase.co* ]]; then
    echo -e "  Domínio Supabase: ${GREEN}✓${NC}"
  else
    echo -e "  Domínio Supabase: ${RED}✖${NC} (deve conter .supabase.co)"
  fi
fi

echo ""

# Verificar chave anônima do Supabase
echo -e "NEXT_PUBLIC_SUPABASE_ANON_KEY:"
if [ -z "$SUPABASE_KEY" ]; then
  echo -e "  ${RED}✖ NÃO CONFIGURADO${NC}"
else
  echo -e "  ${GREEN}✓ CONFIGURADO${NC}: $(mask_string "$SUPABASE_KEY")"
  echo -e "  Comprimento: ${#SUPABASE_KEY} caracteres"
  
  if [ ${#SUPABASE_KEY} -ge 20 ]; then
    echo -e "  Tamanho da chave: ${GREEN}✓${NC}"
  else
    echo -e "  Tamanho da chave: ${RED}✖${NC} (deve ter pelo menos 20 caracteres)"
  fi
fi

echo -e "\n${BLUE}=== DIAGNÓSTICO ===${NC}\n"

# Verificar se há problemas com as variáveis
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo -e "${RED}ERRO: Variáveis de ambiente ausentes.${NC}"
  echo -e "Verifique seu arquivo .env.local e certifique-se de que contém:"
  echo -e "NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co"
  echo -e "NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima"
elif [[ "$SUPABASE_URL" != https://* ]] || [[ "$SUPABASE_URL" != *supabase.co* ]]; then
  echo -e "${RED}ERRO: A URL do Supabase parece estar incorreta.${NC}"
  echo -e "O formato correto é: https://seu-projeto.supabase.co"
elif [ ${#SUPABASE_KEY} -lt 20 ]; then
  echo -e "${RED}ERRO: A chave anônima do Supabase parece estar incorreta.${NC}"
  echo -e "A chave anônima deve ter pelo menos 20 caracteres."
else
  echo -e "${GREEN}As variáveis de ambiente parecem estar configuradas corretamente!${NC}"
  echo -e "Se ainda estiver enfrentando problemas de conexão, verifique:"
  echo -e "1. Se o projeto Supabase está ativo e acessível"
  echo -e "2. Se a chave anônima está correta e não expirou"
  echo -e "3. Se há problemas de rede ou firewall bloqueando a conexão"
fi

echo -e "\n${BLUE}=== INSTRUÇÕES PARA RESOLVER PROBLEMAS ===${NC}\n"
echo -e "1. Acesse o painel do Supabase: https://app.supabase.io"
echo -e "2. Selecione seu projeto"
echo -e "3. Vá para Configurações > API"
echo -e "4. Copie a \"URL do projeto\" e a \"chave anon pública\""
echo -e "5. Atualize seu arquivo .env.local com esses valores"
echo -e "6. Reinicie o servidor de desenvolvimento: npm run dev"

# Testar a conexão com o Supabase
echo -e "\n${BLUE}=== TESTE DE CONECTIVIDADE ===${NC}\n"
echo -e "${YELLOW}Testando conexão com o Supabase...${NC}"

# Remover protocolo e caminho para obter apenas o domínio
if [ ! -z "$SUPABASE_URL" ]; then
  DOMAIN=$(echo "$SUPABASE_URL" | sed -e 's|^[^/]*//||' -e 's|/.*$||')
  
  # Testar resolução de DNS
  echo -e "Resolvendo DNS para $DOMAIN..."
  if host "$DOMAIN" > /dev/null 2>&1; then
    echo -e "  Resolução de DNS: ${GREEN}✓ SUCESSO${NC}"
  else
    echo -e "  Resolução de DNS: ${RED}✖ FALHA${NC}"
    echo -e "  ${YELLOW}O domínio $DOMAIN não pode ser resolvido.${NC}"
    echo -e "  Verifique se o nome do projeto Supabase está correto."
  fi
  
  # Testar conectividade HTTP
  echo -e "Testando conectividade HTTP para $SUPABASE_URL..."
  if curl --output /dev/null --silent --head --fail "$SUPABASE_URL"; then
    echo -e "  Conectividade HTTP: ${GREEN}✓ SUCESSO${NC}"
  else
    echo -e "  Conectividade HTTP: ${RED}✖ FALHA${NC}"
    echo -e "  ${YELLOW}Não foi possível conectar-se a $SUPABASE_URL${NC}"
    echo -e "  Verifique se o projeto Supabase está ativo e acessível."
  fi
else
  echo -e "${RED}Não é possível testar a conexão sem uma URL válida.${NC}"
fi
