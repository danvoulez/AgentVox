#!/usr/bin/env node

/**
 * Script para testar a conexão com o Supabase
 * Este script verifica se as variáveis de ambiente estão configuradas corretamente
 * e tenta estabelecer uma conexão com o Supabase.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.magenta}=== Teste de Conexão com Supabase ===${colors.reset}\n`);

// Verificar arquivos de ambiente
function checkEnvFiles() {
  console.log(`${colors.blue}Verificando arquivos de ambiente...${colors.reset}`);
  
  const envFiles = [
    '.env.local',
    '.env.development',
    '.env.production'
  ];
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  let foundValidConfig = false;
  let supabaseUrl = '';
  let supabaseKey = '';
  
  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`${colors.yellow}Arquivo ${file} não encontrado${colors.reset}`);
      continue;
    }
    
    console.log(`${colors.green}✓ Arquivo ${file} encontrado${colors.reset}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let hasUrl = false;
    let hasKey = false;
    
    for (const requiredVar of requiredVars) {
      const varLine = lines.find(line => line.startsWith(`${requiredVar}=`));
      
      if (varLine) {
        const value = varLine.split('=')[1].trim();
        console.log(`${colors.green}  ✓ ${requiredVar} configurado${colors.reset}`);
        
        if (requiredVar === 'NEXT_PUBLIC_SUPABASE_URL') {
          supabaseUrl = value;
          hasUrl = true;
        } else if (requiredVar === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
          supabaseKey = value;
          hasKey = true;
        }
      } else {
        console.log(`${colors.red}  ✗ ${requiredVar} não configurado${colors.reset}`);
      }
    }
    
    if (hasUrl && hasKey) {
      foundValidConfig = true;
      console.log(`${colors.green}  ✓ Configuração válida encontrada em ${file}${colors.reset}`);
      break;
    }
  }
  
  return { foundValidConfig, supabaseUrl, supabaseKey };
}

// Testar conexão com o Supabase usando curl
function testSupabaseConnection(url, key) {
  console.log(`\n${colors.blue}Testando conexão com o Supabase...${colors.reset}`);
  console.log(`URL: ${url}`);
  console.log(`API Key: ${key.substring(0, 5)}...${key.substring(key.length - 5)}`);
  
  try {
    // Construir a URL para a API REST do Supabase
    const apiUrl = `${url}/rest/v1/?apikey=${key}`;
    
    // Executar curl para testar a conexão
    console.log(`\n${colors.cyan}Executando curl para testar conexão...${colors.reset}`);
    const result = execSync(`curl -s -I "${apiUrl}" -H "apikey: ${key}" -H "Authorization: Bearer ${key}"`).toString();
    
    // Verificar o status HTTP
    const statusLine = result.split('\n').find(line => line.startsWith('HTTP/'));
    const statusCode = statusLine ? statusLine.split(' ')[1] : null;
    
    if (statusCode && statusCode.startsWith('2')) {
      console.log(`${colors.green}✓ Conexão bem-sucedida (Status ${statusCode})${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Falha na conexão (Status ${statusCode || 'desconhecido'})${colors.reset}`);
      console.log(`${colors.yellow}Resposta:${colors.reset}\n${result}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erro ao testar conexão: ${error.message}${colors.reset}`);
    return false;
  }
}

// Função principal
function main() {
  // Verificar arquivos de ambiente
  const { foundValidConfig, supabaseUrl, supabaseKey } = checkEnvFiles();
  
  if (!foundValidConfig) {
    console.log(`\n${colors.red}✗ Nenhuma configuração válida encontrada nos arquivos de ambiente${colors.reset}`);
    console.log(`${colors.yellow}Dica: Verifique se os arquivos .env.local, .env.development ou .env.production existem e contêm as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY${colors.reset}`);
    return;
  }
  
  // Testar conexão com o Supabase
  const connectionSuccess = testSupabaseConnection(supabaseUrl, supabaseKey);
  
  // Resumo
  console.log(`\n${colors.magenta}=== Resumo ===${colors.reset}`);
  
  if (connectionSuccess) {
    console.log(`${colors.green}✓ Conexão com o Supabase está funcionando corretamente${colors.reset}`);
    console.log(`${colors.green}✓ Configuração do Supabase está correta${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Falha na conexão com o Supabase${colors.reset}`);
    console.log(`${colors.yellow}Possíveis problemas:${colors.reset}`);
    console.log(`  - API Key inválida`);
    console.log(`  - URL do Supabase incorreta`);
    console.log(`  - Projeto do Supabase não está acessível`);
    console.log(`  - Problemas de rede`);
  }
}

// Executar o script
main();
