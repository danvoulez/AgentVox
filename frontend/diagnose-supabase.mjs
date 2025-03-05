#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Cores para saída
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

// Obtém o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Função para carregar variáveis de ambiente
function loadEnvVars() {
  console.log(`${BLUE}Carregando variáveis de ambiente...${RESET}`);
  
  // Tenta carregar do .env.local
  const envLocalPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    console.log(`${GREEN}Arquivo .env.local encontrado.${RESET}`);
    dotenv.config({ path: envLocalPath });
  } else {
    console.log(`${RED}Arquivo .env.local não encontrado.${RESET}`);
  }
  
  // Verifica se as variáveis foram carregadas
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? GREEN + 'Definido ✓' + RESET : RED + 'Não definido ✗' + RESET}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? GREEN + 'Definido ✓' + RESET : RED + 'Não definido ✗' + RESET}`);
  
  return { supabaseUrl, supabaseKey };
}

// Função para testar a conexão com o Supabase
async function testSupabaseConnection(supabaseUrl, supabaseKey) {
  console.log(`\n${BLUE}Testando conexão com o Supabase...${RESET}`);
  
  if (!supabaseUrl || !supabaseKey) {
    console.log(`${RED}Erro: Variáveis de ambiente não definidas corretamente.${RESET}`);
    return false;
  }
  
  try {
    console.log(`${YELLOW}Criando cliente Supabase...${RESET}`);
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`${YELLOW}Tentando fazer uma consulta simples...${RESET}`);
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1).maybeSingle();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Este erro é esperado se a tabela não existir, mas indica que a conexão está funcionando
        console.log(`${GREEN}Conexão com Supabase estabelecida com sucesso!${RESET}`);
        console.log(`${YELLOW}Nota: Tabela '_test_connection' não existe, mas isso é esperado.${RESET}`);
        return true;
      } else {
        throw error;
      }
    } else {
      console.log(`${GREEN}Conexão com Supabase estabelecida com sucesso!${RESET}`);
      return true;
    }
  } catch (error) {
    console.log(`${RED}Erro ao conectar com o Supabase: ${error.message}${RESET}`);
    
    if (error.message.includes('fetch failed')) {
      console.log(`${YELLOW}Possível problema de rede. Verifique sua conexão com a internet.${RESET}`);
    } else if (error.message.includes('invalid API key')) {
      console.log(`${YELLOW}Chave de API inválida. Verifique se NEXT_PUBLIC_SUPABASE_ANON_KEY está correta.${RESET}`);
    } else if (error.message.includes('invalid URL')) {
      console.log(`${YELLOW}URL inválida. Verifique se NEXT_PUBLIC_SUPABASE_URL está correta.${RESET}`);
    }
    
    return false;
  }
}

// Função para criar um arquivo .env.local com valores corretos
function createEnvFile() {
  console.log(`\n${BLUE}Criando arquivo .env.local com valores corretos...${RESET}`);
  
  const envContent = `# Configuração do Supabase para o projeto AgentVox
NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ

# OpenAI - API para embeddings e processamento de linguagem natural
OPENAI_API_KEY=sua-chave-da-api-openai
`;
  
  const envPath = path.join(__dirname, '.env.local');
  fs.writeFileSync(envPath, envContent);
  console.log(`${GREEN}Arquivo .env.local criado com sucesso em: ${envPath}${RESET}`);
}

// Função principal
async function main() {
  console.log(`${BLUE}=== DIAGNÓSTICO DO SUPABASE ===${RESET}\n`);
  
  // Carregar variáveis de ambiente
  const { supabaseUrl, supabaseKey } = loadEnvVars();
  
  // Se as variáveis não estiverem definidas, criar arquivo .env.local
  if (!supabaseUrl || !supabaseKey) {
    console.log(`${YELLOW}Variáveis de ambiente não encontradas ou incompletas.${RESET}`);
    createEnvFile();
    
    // Recarregar variáveis
    console.log(`\n${BLUE}Recarregando variáveis de ambiente...${RESET}`);
    dotenv.config({ path: path.join(__dirname, '.env.local'), override: true });
    
    // Verificar novamente
    const newSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const newSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log(`NEXT_PUBLIC_SUPABASE_URL: ${newSupabaseUrl ? GREEN + 'Definido ✓' + RESET : RED + 'Não definido ✗' + RESET}`);
    console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${newSupabaseKey ? GREEN + 'Definido ✓' + RESET : RED + 'Não definido ✗' + RESET}`);
    
    // Testar conexão com novos valores
    await testSupabaseConnection(newSupabaseUrl, newSupabaseKey);
  } else {
    // Testar conexão com valores existentes
    await testSupabaseConnection(supabaseUrl, supabaseKey);
  }
  
  console.log(`\n${BLUE}=== DIAGNÓSTICO CONCLUÍDO ===${RESET}`);
  console.log(`\n${YELLOW}Próximos passos:${RESET}`);
  console.log(`1. Reinicie o servidor Next.js: ${GREEN}npm run dev${RESET}`);
  console.log(`2. Acesse a página de teste: ${GREEN}http://localhost:3000/simple-login-test${RESET}`);
  console.log(`3. Verifique se a conexão com o Supabase está funcionando corretamente.`);
}

// Executar função principal
main().catch(error => {
  console.error(`${RED}Erro inesperado: ${error.message}${RESET}`);
  process.exit(1);
});
