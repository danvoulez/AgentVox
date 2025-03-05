#!/bin/bash

# Script para corrigir a página inicial

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CORREÇÃO DA PÁGINA INICIAL ===${NC}"

# 1. Fazer backup da página atual
echo -e "${YELLOW}Fazendo backup da página inicial atual...${NC}"
cp src/pages/index.tsx src/pages/index.tsx.bak

# 2. Substituir pela versão simplificada
echo -e "${YELLOW}Substituindo pela versão simplificada...${NC}"
cp src/pages/index-simple.tsx src/pages/index.tsx

# 3. Criar página de login simplificada
echo -e "${YELLOW}Criando página de login simplificada...${NC}"

cat > src/pages/login.tsx << EOF
import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Simulação de login bem-sucedido
      setTimeout(() => {
        setIsLoading(false);
        alert('Login simulado com sucesso! Em um ambiente real, você seria redirecionado para o dashboard.');
      }, 1500);
    } catch (err) {
      setIsLoading(false);
      setError('Falha ao fazer login. Por favor, verifique suas credenciais.');
    }
  };

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '400px',
      margin: '0 auto',
      padding: '40px 20px'
    }}>
      <Head>
        <title>Login - Agent Vox</title>
      </Head>
      
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '10px' }}>Agent Vox</h1>
        <p style={{ color: '#666' }}>Faça login para acessar sua conta</p>
      </div>
      
      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          color: '#B91C1C',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label 
            htmlFor="email" 
            style={{ 
              display: 'block', 
              marginBottom: '5px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333'
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="password" 
            style={{ 
              display: 'block', 
              marginBottom: '5px',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333'
            }}
          >
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Não tem uma conta?{' '}
          <Link href="/auth/signup" style={{ color: '#4F46E5', textDecoration: 'none' }}>
            Cadastre-se
          </Link>
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          <Link href="/auth/forgot-password" style={{ color: '#4F46E5', textDecoration: 'none' }}>
            Esqueceu sua senha?
          </Link>
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>
          <Link href="/" style={{ color: '#666', textDecoration: 'none' }}>
            ← Voltar para a página inicial
          </Link>
        </p>
      </div>
    </div>
  );
}
EOF

echo -e "${GREEN}Página de login simplificada criada com sucesso!${NC}"

# 4. Limpar o cache do Next.js
echo -e "${YELLOW}Limpando o cache do Next.js...${NC}"
rm -rf .next

echo -e "${BLUE}=== CORREÇÃO CONCLUÍDA ===${NC}"
echo -e "${YELLOW}Reiniciando o servidor...${NC}"

# Reiniciar o servidor
npm run dev
