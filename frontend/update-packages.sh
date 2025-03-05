#!/bin/bash

# Instalar dependências para testes
echo "Instalando dependências para testes..."
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom cypress ts-node

# Instalar dependências para autenticação
echo "Instalando dependências para autenticação..."
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

echo "Instalação completa!"
