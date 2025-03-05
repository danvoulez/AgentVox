#!/bin/bash

# Script para diagnóstico completo de problemas com componentes de erro

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== DIAGNÓSTICO DE COMPONENTES DE ERRO ===${NC}"

# Verificar estrutura de diretórios
echo -e "${YELLOW}Verificando estrutura de diretórios...${NC}"
if [ ! -d "src/components/Common" ]; then
  echo -e "${RED}Diretório src/components/Common não existe!${NC}"
  exit 1
fi

# Listar todos os arquivos no diretório Common
echo -e "${YELLOW}Arquivos no diretório Common:${NC}"
ls -la src/components/Common

# Verificar conteúdo do arquivo index.tsx
echo -e "${YELLOW}Conteúdo do arquivo index.tsx:${NC}"
if [ -f "src/components/Common/index.tsx" ]; then
  cat src/components/Common/index.tsx
else
  echo -e "${RED}Arquivo index.tsx não existe!${NC}"
fi

# Verificar importações nos arquivos que usam os componentes de erro
echo -e "${YELLOW}Verificando importações em arquivos que usam componentes de erro...${NC}"

# LoginForm.tsx
echo -e "${BLUE}LoginForm.tsx:${NC}"
grep -n "import.*FormErrorMessage" src/components/Auth/LoginForm.tsx
grep -n "import.*FormHelperText" src/components/Auth/LoginForm.tsx
grep -n "<FormErrorMessage" src/components/Auth/LoginForm.tsx
grep -n "<FormHelperText" src/components/Auth/LoginForm.tsx

# SignupForm.tsx
echo -e "${BLUE}SignupForm.tsx:${NC}"
grep -n "import.*FormErrorMessage" src/components/Auth/SignupForm.tsx
grep -n "import.*FormHelperText" src/components/Auth/SignupForm.tsx
grep -n "<FormErrorMessage" src/components/Auth/SignupForm.tsx
grep -n "<FormHelperText" src/components/Auth/SignupForm.tsx

# Verificar se há conflitos de importação
echo -e "${YELLOW}Verificando conflitos de importação...${NC}"
grep -r "import.*FormErrorMessage.*from '@chakra-ui/react'" src/components
grep -r "import.*FormHelperText.*from '@chakra-ui/react'" src/components
grep -r "import.*from '@/components/Common'" src/components

echo -e "${BLUE}=== FIM DO DIAGNÓSTICO ===${NC}"
