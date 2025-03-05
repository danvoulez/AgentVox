#!/bin/bash

# Script para corrigir problemas com componentes de erro - Versão 2
# Este script foca especificamente em resolver o erro "missing required error components"

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CORREÇÃO DE COMPONENTES DE ERRO V2 ===${NC}"

# 1. Criar um arquivo de barril (barrel file) para os componentes de erro
echo -e "${YELLOW}Criando arquivo de barril para componentes de erro...${NC}"

cat > "src/components/Common/ErrorComponents.tsx" << EOF
// Este arquivo exporta todos os componentes de erro em um único lugar
import ErrorBoundary from './ErrorBoundary';
import ErrorMessage from './ErrorMessage';
import LoadingError from './LoadingError';
import NotFound from './NotFound';
import AlertMessage from './AlertMessage';
import LoadingSpinner from './LoadingSpinner';
import ValidationError from './ValidationError';
import NetworkError from './NetworkError';
import PermissionError from './PermissionError';
import TimeoutError from './TimeoutError';

// Exportações nomeadas para uso com destructuring
export {
  ErrorBoundary,
  ErrorMessage,
  LoadingError,
  NotFound,
  AlertMessage,
  LoadingSpinner,
  ValidationError,
  NetworkError,
  PermissionError,
  TimeoutError
};

// Exportação default como objeto para uso com namespace
const ErrorComponents = {
  ErrorBoundary,
  ErrorMessage,
  LoadingError,
  NotFound,
  AlertMessage,
  LoadingSpinner,
  ValidationError,
  NetworkError,
  PermissionError,
  TimeoutError
};

export default ErrorComponents;
EOF

echo -e "${GREEN}Arquivo de barril criado com sucesso!${NC}"

# 2. Criar um arquivo de barril para os componentes de formulário
echo -e "${YELLOW}Criando arquivo de barril para componentes de formulário...${NC}"

cat > "src/components/Common/FormComponents.tsx" << EOF
// Este arquivo exporta todos os componentes de formulário em um único lugar
import FormErrorMessage from './FormErrorMessage';
import FormHelperText from './FormHelperText';
import FormLabel from './FormLabel';
import FormControl from './FormControl';

// Exportações nomeadas para uso com destructuring
export {
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  FormControl
};

// Exportação default como objeto para uso com namespace
const FormComponents = {
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  FormControl
};

export default FormComponents;
EOF

echo -e "${GREEN}Arquivo de barril criado com sucesso!${NC}"

# 3. Atualizar o arquivo index.tsx para usar os arquivos de barril
echo -e "${YELLOW}Atualizando arquivo index.tsx...${NC}"

cat > "src/components/Common/index.tsx" << EOF
// Re-exportar todos os componentes de erro
export * from './ErrorComponents';

// Re-exportar todos os componentes de formulário
export * from './FormComponents';

// Exportar os namespaces
export { default as ErrorComponents } from './ErrorComponents';
export { default as FormComponents } from './FormComponents';
EOF

echo -e "${GREEN}Arquivo index.tsx atualizado com sucesso!${NC}"

# 4. Verificar e corrigir os componentes personalizados
echo -e "${YELLOW}Verificando componentes personalizados...${NC}"

# Verificar se todos os componentes existem
COMPONENTS=(
  "ErrorBoundary"
  "ErrorMessage"
  "LoadingError"
  "NotFound"
  "AlertMessage"
  "LoadingSpinner"
  "ValidationError"
  "NetworkError"
  "PermissionError"
  "TimeoutError"
  "FormErrorMessage"
  "FormHelperText"
  "FormLabel"
  "FormControl"
)

for component in "${COMPONENTS[@]}"; do
  if [ ! -f "src/components/Common/${component}.tsx" ]; then
    echo -e "${RED}Componente ${component} não encontrado. Criando...${NC}"
    
    # Criar um componente básico
    cat > "src/components/Common/${component}.tsx" << EOF
import React from 'react';
import { Box, Text, Heading } from '@chakra-ui/react';

interface ${component}Props {
  children?: React.ReactNode;
  message?: string;
}

/**
 * ${component} component
 */
const ${component}: React.FC<${component}Props> = ({ 
  children,
  message = "Informação do componente"
}) => {
  return (
    <Box p={4}>
      <Heading size="sm">${component}</Heading>
      {message && <Text>{message}</Text>}
      {children}
    </Box>
  );
};

export default ${component};
EOF
    
    echo -e "${GREEN}Componente ${component} criado!${NC}"
  else
    echo -e "${GREEN}Componente ${component} já existe.${NC}"
  fi
done

# 5. Criar um arquivo de tipos para os componentes
echo -e "${YELLOW}Criando arquivo de tipos...${NC}"

cat > "src/components/Common/types.ts" << EOF
import { ReactNode } from 'react';
import { BoxProps, TextProps } from '@chakra-ui/react';

// Tipos comuns para componentes de erro
export interface ErrorComponentProps extends BoxProps {
  message?: string;
  children?: ReactNode;
  onRetry?: () => void;
}

// Tipos para componentes de formulário
export interface FormComponentProps extends TextProps {
  children?: ReactNode;
}
EOF

echo -e "${GREEN}Arquivo de tipos criado com sucesso!${NC}"

# 6. Limpar o cache do Next.js
echo -e "${YELLOW}Limpando cache do Next.js...${NC}"
rm -rf .next

echo -e "${BLUE}=== CORREÇÃO CONCLUÍDA ===${NC}"
echo -e "${YELLOW}Reiniciando o servidor...${NC}"

# Reiniciar o servidor
npm run dev
