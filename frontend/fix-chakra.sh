#!/bin/bash

# Script para corrigir problemas com o Chakra UI

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CORREÇÃO DO CHAKRA UI ===${NC}"

# 1. Fazer backup do package.json
echo -e "${YELLOW}Fazendo backup do package.json...${NC}"
cp package.json package.json.bak

# 2. Remover o Chakra UI e suas dependências
echo -e "${YELLOW}Removendo o Chakra UI e suas dependências...${NC}"
npm uninstall @chakra-ui/react @chakra-ui/next-js @emotion/react @emotion/styled framer-motion

# 3. Limpar o cache do npm
echo -e "${YELLOW}Limpando o cache do npm...${NC}"
npm cache clean --force

# 4. Reinstalar o Chakra UI com versões específicas
echo -e "${YELLOW}Reinstalando o Chakra UI com versões compatíveis...${NC}"
npm install @chakra-ui/react@2.8.0 @emotion/react@11.11.1 @emotion/styled@11.11.0 framer-motion@10.16.4

# 5. Limpar o cache do Next.js
echo -e "${YELLOW}Limpando o cache do Next.js...${NC}"
rm -rf .next

# 6. Criar um provider personalizado para o Chakra
echo -e "${YELLOW}Criando um provider personalizado para o Chakra...${NC}"

mkdir -p src/providers

cat > src/providers/ChakraProvider.tsx << EOF
import React from 'react';
import { ChakraProvider as ChakraUIProvider, extendTheme } from '@chakra-ui/react';

// Tema personalizado
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'white',
        color: 'gray.800',
      },
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
  },
});

interface ChakraProviderProps {
  children: React.ReactNode;
}

export const ChakraProvider: React.FC<ChakraProviderProps> = ({ children }) => {
  return (
    <ChakraUIProvider theme={theme} resetCSS>
      {children}
    </ChakraUIProvider>
  );
};

export default ChakraProvider;
EOF

# 7. Atualizar _app.tsx para usar o provider personalizado
echo -e "${YELLOW}Atualizando _app.tsx...${NC}"

cat > src/pages/_app.tsx << EOF
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import ChakraProvider from '@/providers/ChakraProvider';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ChakraProvider>
  );
}
EOF

# 8. Criar componentes de erro básicos sem depender do Chakra
echo -e "${YELLOW}Criando componentes de erro básicos...${NC}"

mkdir -p src/components/ErrorFallback

cat > src/components/ErrorFallback/index.tsx << EOF
import React from 'react';
import styles from './ErrorFallback.module.css';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <h2 className={styles.errorTitle}>Algo deu errado</h2>
        <p className={styles.errorMessage}>
          {error?.message || 'Ocorreu um erro inesperado'}
        </p>
        {resetErrorBoundary && (
          <button 
            onClick={resetErrorBoundary}
            className={styles.errorButton}
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
EOF

cat > src/components/ErrorFallback/ErrorFallback.module.css << EOF
.errorContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 20px;
}

.errorContent {
  background-color: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.errorTitle {
  color: #cf1322;
  font-size: 18px;
  margin-bottom: 12px;
}

.errorMessage {
  color: #434343;
  margin-bottom: 16px;
}

.errorButton {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.errorButton:hover {
  background-color: #40a9ff;
}
EOF

# 9. Criar um arquivo de fallback para quando o Chakra falhar
echo -e "${YELLOW}Criando página de fallback...${NC}"

cat > src/pages/error.tsx << EOF
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Error.module.css';

export default function ErrorPage() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Erro - AgentVox</title>
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>
          Oops! Algo deu errado
        </h1>
        
        <p className={styles.description}>
          Estamos enfrentando problemas técnicos.
        </p>
        
        <div className={styles.grid}>
          <Link href="/" className={styles.card}>
            <h2>Voltar para o início &rarr;</h2>
            <p>Retorne para a página inicial e tente novamente.</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
EOF

cat > src/styles/Error.module.css << EOF
.container {
  padding: 0 2rem;
}

.main {
  min-height: 100vh;
  padding: 4rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.title {
  margin: 0;
  line-height: 1.15;
  font-size: 3rem;
  text-align: center;
}

.description {
  margin: 2rem 0;
  line-height: 1.5;
  font-size: 1.5rem;
  text-align: center;
}

.grid {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 800px;
}

.card {
  margin: 1rem;
  padding: 1.5rem;
  text-align: left;
  color: inherit;
  text-decoration: none;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  transition: color 0.15s ease, border-color 0.15s ease;
  max-width: 300px;
}

.card:hover,
.card:focus,
.card:active {
  color: #0070f3;
  border-color: #0070f3;
}

.card h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.card p {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.5;
}
EOF

echo -e "${BLUE}=== CORREÇÃO CONCLUÍDA ===${NC}"
echo -e "${YELLOW}Reiniciando o servidor...${NC}"

# Reiniciar o servidor
npm run dev
