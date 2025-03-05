#!/usr/bin/env node

/**
 * Script para verificar o status de autenticação com o Supabase
 * Executa fora do navegador para diagnosticar problemas de API
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obter diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("========================================================");
console.log("🔍 VERIFICAÇÃO DE STATUS DE AUTENTICAÇÃO SUPABASE");
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
const envContent = tryReadFile(envPath);

if (!envContent) {
  console.error("❌ Arquivo .env.local não encontrado.");
  process.exit(1);
}

// Extrair variáveis do arquivo .env.local
const extractEnvVar = (content, varName) => {
  const match = content.match(new RegExp(`${varName}=(.+)`));
  return match ? match[1].trim() : null;
};

const supabaseUrl = extractEnvVar(envContent, 'NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = extractEnvVar(envContent, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente do Supabase não encontradas no arquivo .env.local");
  process.exit(1);
}

console.log(`✅ URL do Supabase: ${supabaseUrl}`);
console.log(`✅ Chave do Supabase: ${supabaseKey.substring(0, 10)}...${supabaseKey.substring(supabaseKey.length - 5)}`);

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Verificar status de autenticação
async function checkAuthStatus() {
  try {
    console.log("\n🔄 Verificando sessão atual...");
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("❌ Erro ao verificar sessão:", error.message);
      return;
    }
    
    if (data && data.session) {
      console.log("✅ Usuário autenticado!");
      console.log(`   Email: ${data.session.user.email}`);
      console.log(`   ID: ${data.session.user.id}`);
      console.log(`   Sessão expira em: ${new Date(data.session.expires_at * 1000).toLocaleString()}`);
    } else {
      console.log("ℹ️  Nenhum usuário autenticado no momento.");
      
      // Oferecer opção de login
      console.log("\n🔑 Para testar o login, acesse:");
      console.log("   http://localhost:3000/test-login");
    }
  } catch (err) {
    console.error("❌ Erro ao verificar autenticação:", err.message);
  }
}

// Verificar conexão com Supabase
async function testConnection() {
  try {
    console.log("\n🔄 Testando conexão com Supabase...");
    
    // Tentar uma operação simples para testar a conexão
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Este é um erro esperado se a tabela não existir, mas indica que a conexão funciona
        console.log("✅ Conexão com Supabase bem-sucedida! (Tabela 'profiles' não encontrada, mas a API está respondendo)");
      } else {
        console.error("❌ Erro ao testar conexão:", error.message);
      }
    } else {
      console.log("✅ Conexão com Supabase bem-sucedida!");
    }
  } catch (err) {
    console.error("❌ Erro ao testar conexão:", err.message);
  }
}

// Executar verificações
async function run() {
  await testConnection();
  await checkAuthStatus();
  
  console.log("\n========================================================");
  console.log("✅ VERIFICAÇÃO CONCLUÍDA");
  console.log("========================================================");
}

run();
