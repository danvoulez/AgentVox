#!/usr/bin/env node

/**
 * Script para verificar variáveis de ambiente sem revelar seus valores
 * Este script verifica se as variáveis de ambiente necessárias estão configuradas
 * nos arquivos .env.local, .env.development e .env.production
 */

const fs = require('fs');
const path = require('path');

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

console.log(`${colors.magenta}=== Verificação de Variáveis de Ambiente ===${colors.reset}\n`);

// Variáveis de ambiente necessárias
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

// Arquivos de ambiente a verificar
const envFiles = [
  '.env.local',
  '.env.development',
  '.env.production'
];

// Função para verificar um arquivo de ambiente
function checkEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false, vars: {} };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const vars = {};
  
  for (const requiredVar of requiredVars) {
    const varLine = lines.find(line => line.startsWith(`${requiredVar}=`));
    
    if (varLine) {
      const value = varLine.split('=')[1].trim();
      vars[requiredVar] = {
        exists: true,
        // Mostrar apenas os primeiros e últimos caracteres para segurança
        maskedValue: value.length > 10 
          ? `${value.substring(0, 3)}...${value.substring(value.length - 3)}`
          : '***'
      };
    } else {
      vars[requiredVar] = { exists: false };
    }
  }
  
  return { exists: true, vars };
}

// Verificar todos os arquivos de ambiente
function checkAllEnvFiles() {
  const results = {};
  
  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    console.log(`${colors.blue}Verificando ${file}...${colors.reset}`);
    
    const result = checkEnvFile(filePath);
    results[file] = result;
    
    if (!result.exists) {
      console.log(`${colors.yellow}  Arquivo não encontrado${colors.reset}`);
      continue;
    }
    
    for (const [varName, varInfo] of Object.entries(result.vars)) {
      if (varInfo.exists) {
        console.log(`${colors.green}  ✓ ${varName}=${varInfo.maskedValue}${colors.reset}`);
      } else {
        console.log(`${colors.red}  ✗ ${varName} não encontrado${colors.reset}`);
      }
    }
    
    console.log('');
  }
  
  return results;
}

// Verificar se as variáveis de ambiente estão configuradas no vercel.json
function checkVercelConfig() {
  console.log(`${colors.blue}Verificando vercel.json...${colors.reset}`);
  
  const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
  
  if (!fs.existsSync(vercelJsonPath)) {
    console.log(`${colors.yellow}  Arquivo vercel.json não encontrado${colors.reset}`);
    return { exists: false };
  }
  
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    
    if (!vercelConfig.env) {
      console.log(`${colors.yellow}  Seção 'env' não encontrada no vercel.json${colors.reset}`);
      return { exists: true, hasEnvSection: false };
    }
    
    const envVars = vercelConfig.env;
    const results = {};
    
    for (const requiredVar of requiredVars) {
      if (requiredVar in envVars) {
        console.log(`${colors.green}  ✓ ${requiredVar} configurado no vercel.json${colors.reset}`);
        results[requiredVar] = true;
      } else {
        console.log(`${colors.red}  ✗ ${requiredVar} não configurado no vercel.json${colors.reset}`);
        results[requiredVar] = false;
      }
    }
    
    return { exists: true, hasEnvSection: true, vars: results };
  } catch (error) {
    console.log(`${colors.red}  Erro ao ler vercel.json: ${error.message}${colors.reset}`);
    return { exists: true, error: error.message };
  }
}

// Função principal
function main() {
  // Verificar arquivos de ambiente
  const envResults = checkAllEnvFiles();
  
  // Verificar vercel.json
  console.log('');
  const vercelResults = checkVercelConfig();
  
  // Resumo
  console.log(`\n${colors.magenta}=== Resumo ===${colors.reset}\n`);
  
  // Verificar se as variáveis estão configuradas em pelo menos um arquivo
  const varsConfigured = {};
  
  for (const requiredVar of requiredVars) {
    varsConfigured[requiredVar] = false;
    
    for (const file of envFiles) {
      if (envResults[file] && 
          envResults[file].exists && 
          envResults[file].vars[requiredVar] && 
          envResults[file].vars[requiredVar].exists) {
        varsConfigured[requiredVar] = true;
        break;
      }
    }
  }
  
  // Exibir status de cada variável
  for (const [varName, isConfigured] of Object.entries(varsConfigured)) {
    if (isConfigured) {
      console.log(`${colors.green}✓ ${varName} está configurado${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ${varName} não está configurado em nenhum arquivo${colors.reset}`);
    }
  }
  
  // Verificar se as variáveis estão configuradas no vercel.json
  console.log('');
  if (vercelResults.exists && vercelResults.hasEnvSection) {
    const missingVars = requiredVars.filter(v => !vercelResults.vars[v]);
    
    if (missingVars.length > 0) {
      console.log(`${colors.yellow}⚠ As seguintes variáveis não estão configuradas no vercel.json:${colors.reset}`);
      missingVars.forEach(v => console.log(`  - ${v}`));
    } else {
      console.log(`${colors.green}✓ Todas as variáveis necessárias estão configuradas no vercel.json${colors.reset}`);
    }
  }
  
  // Recomendações
  console.log(`\n${colors.blue}Recomendações:${colors.reset}`);
  
  const allVarsConfigured = Object.values(varsConfigured).every(v => v);
  
  if (!allVarsConfigured) {
    console.log(`  - Configure todas as variáveis de ambiente necessárias em .env.local`);
  }
  
  if (vercelResults.exists && vercelResults.hasEnvSection) {
    const missingVars = requiredVars.filter(v => !vercelResults.vars[v]);
    
    if (missingVars.length > 0) {
      console.log(`  - Adicione as variáveis ${missingVars.join(', ')} ao vercel.json`);
    }
  } else if (vercelResults.exists && !vercelResults.hasEnvSection) {
    console.log(`  - Adicione uma seção 'env' ao vercel.json com as variáveis necessárias`);
  } else {
    console.log(`  - Crie um arquivo vercel.json com as configurações necessárias`);
  }
  
  console.log(`\n${colors.magenta}Verificação concluída!${colors.reset}`);
}

// Executar o script
main();
