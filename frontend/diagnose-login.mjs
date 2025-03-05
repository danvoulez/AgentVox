#!/usr/bin/env node

/**
 * Diagnóstico avançado de problemas de login com Supabase
 * Este script tenta diagnosticar e resolver problemas com a API key do Supabase
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obter diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("========================================================");
console.log("🔍 DIAGNÓSTICO DE PROBLEMAS DE LOGIN NO AGENTVOX");
console.log("========================================================");

// Funções de utilidade
const tryReadFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return null;
  }
};

// Variáveis principais
const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, '.env.example.fixed');
const envContent = tryReadFile(envPath);
const envExampleContent = tryReadFile(envExamplePath);

if (!envContent) {
  console.error("❌ Arquivo .env.local não encontrado. Este arquivo é necessário para a configuração do Supabase.");
  process.exit(1);
}

// Extrair variáveis do arquivo .env.local
const extractEnvVar = (content, varName) => {
  const match = content.match(new RegExp(`${varName}=(.+)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = extractEnvVar(envContent, 'NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = extractEnvVar(envContent, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

console.log("\n🔑 Verificando configuração do Supabase:");
console.log("----------------------------------------");

// Verificar URL
if (!supabaseUrl) {
  console.log("❌ NEXT_PUBLIC_SUPABASE_URL não encontrada no arquivo .env.local");
} else {
  console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl.slice(0, 20)}...`);
  
  // Verificar formato da URL
  const urlValid = supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
  if (!urlValid) {
    console.log("⚠️  ALERTA: O formato da URL do Supabase parece incorreto.");
    console.log("   Formato correto: https://[project-id].supabase.co");
  }
}

// Verificar API Key
if (!supabaseKey) {
  console.log("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrada no arquivo .env.local");
} else {
  // Mostrar apenas parte da chave por segurança
  console.log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey.slice(0, 10)}...${supabaseKey.slice(-5)}`);
  console.log(`   Comprimento da chave: ${supabaseKey.length} caracteres`);
  
  // Verificar formato da API key
  const keyValid = supabaseKey.length > 20;
  if (!keyValid) {
    console.log("⚠️  ALERTA: A chave API do Supabase parece muito curta.");
  }
  
  const formatValid = supabaseKey.startsWith('eyJ');
  if (!formatValid) {
    console.log("❌ ERRO: O formato da chave API do Supabase está incorreto.");
    console.log("   Chaves API do Supabase geralmente começam com 'eyJ'");
  }
  
  // Verificar por aspas ou espaços extras
  if (supabaseKey.startsWith('"') || supabaseKey.endsWith('"') || 
      supabaseKey.startsWith("'") || supabaseKey.endsWith("'") ||
      supabaseKey.startsWith(' ') || supabaseKey.endsWith(' ')) {
    console.log("❌ ERRO: A chave API contém aspas ou espaços extras que precisam ser removidos.");
  }
}

// Diagnóstico adicional
console.log("\n🔄 Verificando carregamento de variáveis de ambiente:");
console.log("---------------------------------------------------");

const nextConfigPath = path.join(__dirname, 'next.config.js');
const nextConfigContent = tryReadFile(nextConfigPath);

if (nextConfigContent) {
  console.log("✅ next.config.js encontrado");
  
  // Verificar se há configuração para variáveis de ambiente
  const hasEnvConfig = nextConfigContent.includes('env:') || 
                      nextConfigContent.includes('publicRuntimeConfig:');
  
  if (hasEnvConfig) {
    console.log("✅ Configuração de variáveis de ambiente encontrada em next.config.js");
  } else {
    console.log("ℹ️  next.config.js não contém configuração explícita para variáveis de ambiente.");
    console.log("   Isto não é um problema se você está usando .env.local corretamente.");
  }
} else {
  console.log("ℹ️  next.config.js não encontrado. O Next.js usará configurações padrão.");
}

// Testar conexão com Supabase
console.log("\n🌐 Tentando teste de conexão com Supabase:");
console.log("---------------------------------------------------");

try {
  // Criar um arquivo JS temporário para testar a conexão
  const testFile = path.join(__dirname, 'temp-test-supabase.mjs');
  fs.writeFileSync(testFile, `
    import { createClient } from '@supabase/supabase-js';
    
    const url = '${supabaseUrl || ''}';
    const key = '${supabaseKey || ''}';
    
    if (!url || !key) {
      console.log("❌ Impossível testar: URL ou chave não configuradas");
      process.exit(1);
    }
    
    console.log("🔄 Testando conexão com Supabase...");
    
    try {
      const supabase = createClient(url, key);
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log("❌ Erro na conexão:");
        console.log(error.message);
        process.exit(1);
      }
      
      console.log("✅ Conexão com Supabase bem-sucedida!");
    } catch (err) {
      console.log("❌ Erro ao conectar com Supabase:");
      console.log(err.message);
      process.exit(1);
    }
  `);
  
  try {
    execSync(`node ${testFile}`, { stdio: 'inherit' });
  } catch (err) {
    // Erro já mostrado pelo processo filho
  }
  
  // Limpar arquivo temporário
  fs.unlinkSync(testFile);
} catch (err) {
  console.log("❌ Erro ao tentar teste de conexão:", err.message);
}

// Possíveis soluções
console.log("\n🔧 SOLUÇÕES SUGERIDAS:");
console.log("====================");

// Se a chave for inválida
if (!supabaseKey || !supabaseKey.startsWith('eyJ') || supabaseKey.length < 20) {
  console.log("\n1. Obtenha uma nova chave API do Supabase:");
  console.log("   a. Acesse https://app.supabase.io e faça login");
  console.log("   b. Selecione seu projeto");
  console.log("   c. Vá para Project Settings > API");
  console.log("   d. Copie o valor de 'anon public' em 'Project API keys'");
  
  console.log("\n2. Atualize seu arquivo .env.local:");
  console.log("   a. Abra o arquivo .env.local em um editor de texto");
  console.log("   b. Substitua a linha NEXT_PUBLIC_SUPABASE_ANON_KEY=... pela nova chave");
  console.log("   c. Certifique-se de que não há aspas ou espaços extras");
  console.log("   d. Salve o arquivo");
  
  console.log("\n3. Reinicie o servidor de desenvolvimento:");
  console.log("   $ cd frontend && npm run dev");
}

// Se há problemas de formato (aspas, espaços)
if (supabaseKey && (supabaseKey.startsWith('"') || supabaseKey.endsWith('"') || 
    supabaseKey.startsWith("'") || supabaseKey.endsWith("'") ||
    supabaseKey.startsWith(' ') || supabaseKey.endsWith(' '))) {
  
  console.log("\nDeseja corrigir automaticamente problemas de formato na chave? (s/n)");
  console.log("[Este script irá remover aspas e espaços extras da chave API]");
}

console.log("\n========================================================");
console.log("💡 DICA ADICIONAL");
console.log("========================================================");
console.log("Se continuar enfrentando problemas, considere:");
console.log("1. Verificar se suas credenciais do Supabase ainda são válidas");
console.log("2. Limpar o cache do navegador ou testar em um navegador diferente");
console.log("3. Verificar os logs do navegador (F12 > Console) para erros específicos");
console.log("========================================================");
