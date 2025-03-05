#!/bin/bash

# Script para corrigir problemas com componentes de erro de forma abrangente

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CORREÇÃO DE COMPONENTES DE ERRO ===${NC}"

# 1. Corrigir importações no LoginForm.tsx
echo -e "${YELLOW}Corrigindo importações no LoginForm.tsx...${NC}"

# Backup do arquivo original
cp src/components/Auth/LoginForm.tsx src/components/Auth/LoginForm.tsx.bak

# Substituir importações do Chakra UI por importações dos componentes personalizados
sed -i '' 's/import {/import {\\
  FormErrorMessage,\\
  FormHelperText,\\
} from '\''@\/components\/Common'\'';\\
\\
import {/g' src/components/Auth/LoginForm.tsx

# Remover FormErrorMessage e FormHelperText da importação do Chakra UI
sed -i '' 's/FormErrorMessage,//g' src/components/Auth/LoginForm.tsx
sed -i '' 's/FormHelperText,//g' src/components/Auth/LoginForm.tsx
sed -i '' 's/,  /,/g' src/components/Auth/LoginForm.tsx

echo -e "${GREEN}LoginForm.tsx corrigido!${NC}"

# 2. Garantir que o arquivo index.tsx esteja correto
echo -e "${YELLOW}Verificando arquivo index.tsx...${NC}"

# Atualizar o arquivo index.tsx
cat > "src/components/Common/index.tsx" << EOF
// Form Components
export { default as FormErrorMessage } from './FormErrorMessage';
export { default as FormHelperText } from './FormHelperText';
export { default as FormLabel } from './FormLabel';
export { default as FormControl } from './FormControl';

// Error Components
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ErrorMessage } from './ErrorMessage';
export { default as LoadingError } from './LoadingError';
export { default as NotFound } from './NotFound';
export { default as AlertMessage } from './AlertMessage';
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as ValidationError } from './ValidationError';
export { default as NetworkError } from './NetworkError';
export { default as PermissionError } from './PermissionError';
export { default as TimeoutError } from './TimeoutError';
EOF

echo -e "${GREEN}Arquivo index.tsx atualizado com sucesso!${NC}"

# 3. Verificar e corrigir os componentes personalizados
echo -e "${YELLOW}Verificando componentes personalizados...${NC}"

# FormErrorMessage.tsx
cat > "src/components/Common/FormErrorMessage.tsx" << EOF
import React from 'react';
import { Text, TextProps } from '@chakra-ui/react';

interface FormErrorMessageProps extends TextProps {
  children: React.ReactNode;
}

/**
 * Custom form error message component
 * Displays validation errors with consistent styling
 */
const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ children, ...props }) => {
  if (!children) return null;
  
  return (
    <Text
      color="red.500"
      fontSize="sm"
      mt={1}
      {...props}
    >
      {children}
    </Text>
  );
};

export default FormErrorMessage;
EOF

# FormHelperText.tsx
cat > "src/components/Common/FormHelperText.tsx" << EOF
import React from 'react';
import { Text, TextProps } from '@chakra-ui/react';

interface FormHelperTextProps extends TextProps {
  children: React.ReactNode;
}

/**
 * Custom form helper text component
 * Provides additional guidance or information about form fields
 */
const FormHelperText: React.FC<FormHelperTextProps> = ({ children, ...props }) => {
  if (!children) return null;
  
  return (
    <Text
      fontSize="sm"
      color="gray.500"
      mt={1}
      {...props}
    >
      {children}
    </Text>
  );
};

export default FormHelperText;
EOF

echo -e "${GREEN}Componentes personalizados atualizados com sucesso!${NC}"

# 4. Criar um componente de erro global para capturar erros de carregamento
echo -e "${YELLOW}Criando componente ErrorProvider...${NC}"

mkdir -p src/contexts

cat > "src/contexts/ErrorContext.tsx" << EOF
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  ErrorMessage, 
  NetworkError, 
  ValidationError, 
  TimeoutError 
} from '@/components/Common';
import { Box } from '@chakra-ui/react';

type ErrorType = 'network' | 'validation' | 'timeout' | 'general' | null;

interface ErrorContextType {
  error: {
    type: ErrorType;
    message: string;
  } | null;
  setError: (type: ErrorType, message: string) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError deve ser usado dentro de um ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setErrorState] = useState<{
    type: ErrorType;
    message: string;
  } | null>(null);

  const setError = (type: ErrorType, message: string) => {
    setErrorState({ type, message });
  };

  const clearError = () => {
    setErrorState(null);
  };

  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {error ? (
        <Box position="fixed" top={4} right={4} zIndex={9999} maxW="sm">
          {error.type === 'network' && <NetworkError message={error.message} />}
          {error.type === 'validation' && <ValidationError message={error.message} />}
          {error.type === 'timeout' && <TimeoutError message={error.message} />}
          {error.type === 'general' && <ErrorMessage message={error.message} />}
        </Box>
      ) : null}
      {children}
    </ErrorContext.Provider>
  );
};
EOF

echo -e "${GREEN}Componente ErrorProvider criado com sucesso!${NC}"

# 5. Atualizar _app.tsx para incluir o ErrorProvider
echo -e "${YELLOW}Atualizando _app.tsx...${NC}"

# Backup do arquivo original
cp src/pages/_app.tsx src/pages/_app.tsx.bak

# Adicionar ErrorProvider
sed -i '' 's/import { ChakraProvider } from '\''@chakra-ui\/react'\'';/import { ChakraProvider } from '\''@chakra-ui\/react'\'';\\
import { ErrorProvider } from '\''@\/contexts\/ErrorContext'\'';/g' src/pages/_app.tsx

sed -i '' 's/<ChakraProvider>/<ChakraProvider>\\
      <ErrorProvider>/g' src/pages/_app.tsx

sed -i '' 's/<\/ChakraProvider>/<\/ErrorProvider>\\
    <\/ChakraProvider>/g' src/pages/_app.tsx

echo -e "${GREEN}_app.tsx atualizado com sucesso!${NC}"

echo -e "${BLUE}=== CORREÇÃO CONCLUÍDA ===${NC}"
echo -e "${YELLOW}Reiniciando o servidor...${NC}"

# Reiniciar o servidor
npm run dev
