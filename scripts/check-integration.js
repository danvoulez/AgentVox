#!/usr/bin/env node

/**
 * Script para verificar a integridade das integrações entre GitHub, Vercel e Supabase
 * 
 * Uso: node scripts/check-integration.js
 */

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Função para fazer requisições HTTP
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, data });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

// Verificar arquivos de ambiente
async function checkEnvFiles() {
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
  
  const results = {};
  
  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      results[file] = { exists: false, vars: {} };
      console.log(`${colors.yellow}Arquivo ${file} não encontrado${colors.reset}`);
      continue;
    }
    
    results[file] = { exists: true, vars: {} };
    console.log(`${colors.green}✓ Arquivo ${file} encontrado${colors.reset}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (const requiredVar of requiredVars) {
      const varLine = lines.find(line => line.startsWith(`${requiredVar}=`));
      
      if (varLine) {
        const value = varLine.split('=')[1];
        results[file].vars[requiredVar] = {
          exists: true,
          value: value.substring(0, 3) + '...' + value.substring(value.length - 3)
        };
        console.log(`${colors.green}  ✓ ${requiredVar} configurado${colors.reset}`);
      } else {
        results[file].vars[requiredVar] = { exists: false };
        console.log(`${colors.red}  ✗ ${requiredVar} não configurado${colors.reset}`);
      }
    }
  }
  
  return results;
}

// Verificar configuração do Git
async function checkGitConfig() {
  console.log(`\n${colors.blue}Verificando configuração do Git...${colors.reset}`);
  
  try {
    // Verificar se o diretório é um repositório Git
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    console.log(`${colors.green}✓ Diretório é um repositório Git${colors.reset}`);
    
    // Obter URL remota
    const remoteUrl = execSync('git remote get-url origin').toString().trim();
    console.log(`${colors.green}✓ URL remota: ${remoteUrl}${colors.reset}`);
    
    // Obter branch atual
    const currentBranch = execSync('git branch --show-current').toString().trim();
    console.log(`${colors.green}✓ Branch atual: ${currentBranch}${colors.reset}`);
    
    // Verificar se há alterações não commitadas
    const status = execSync('git status --porcelain').toString();
    if (status) {
      console.log(`${colors.yellow}⚠ Há alterações não commitadas:${colors.reset}`);
      console.log(status);
    } else {
      console.log(`${colors.green}✓ Não há alterações não commitadas${colors.reset}`);
    }
    
    return {
      isGitRepo: true,
      remoteUrl,
      currentBranch,
      hasUncommittedChanges: !!status
    };
  } catch (error) {
    console.log(`${colors.red}✗ Erro ao verificar configuração do Git: ${error.message}${colors.reset}`);
    return {
      isGitRepo: false,
      error: error.message
    };
  }
}

// Verificar configuração do Vercel
async function checkVercelConfig() {
  console.log(`\n${colors.blue}Verificando configuração do Vercel...${colors.reset}`);
  
  const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
  
  if (!fs.existsSync(vercelJsonPath)) {
    console.log(`${colors.yellow}⚠ Arquivo vercel.json não encontrado${colors.reset}`);
    return { exists: false };
  }
  
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    console.log(`${colors.green}✓ Arquivo vercel.json encontrado e válido${colors.reset}`);
    
    // Verificar configurações importantes
    if (vercelConfig.buildCommand) {
      console.log(`${colors.green}✓ Comando de build: ${vercelConfig.buildCommand}${colors.reset}`);
    }
    
    if (vercelConfig.outputDirectory) {
      console.log(`${colors.green}✓ Diretório de saída: ${vercelConfig.outputDirectory}${colors.reset}`);
    }
    
    if (vercelConfig.env) {
      console.log(`${colors.green}✓ Variáveis de ambiente configuradas no vercel.json${colors.reset}`);
    }
    
    return {
      exists: true,
      config: vercelConfig
    };
  } catch (error) {
    console.log(`${colors.red}✗ Erro ao ler vercel.json: ${error.message}${colors.reset}`);
    return {
      exists: true,
      isValid: false,
      error: error.message
    };
  }
}

// Verificar estrutura de arquivos
async function checkFileStructure() {
  console.log(`\n${colors.blue}Verificando estrutura de arquivos...${colors.reset}`);
  
  const criticalFiles = [
    'src/pages/login.tsx',
    'src/pages/simple-login.tsx',
    'src/pages/status.tsx',
    'src/pages/index.tsx'
  ];
  
  const results = {};
  
  for (const file of criticalFiles) {
    const filePath = path.join(process.cwd(), file);
    
    if (fs.existsSync(filePath)) {
      results[file] = { exists: true };
      console.log(`${colors.green}✓ ${file} encontrado${colors.reset}`);
    } else {
      results[file] = { exists: false };
      console.log(`${colors.red}✗ ${file} não encontrado${colors.reset}`);
    }
  }
  
  // Verificar se há arquivos duplicados em pages/ e src/pages/
  const pagesDir = path.join(process.cwd(), 'pages');
  const srcPagesDir = path.join(process.cwd(), 'src/pages');
  
  if (fs.existsSync(pagesDir) && fs.existsSync(srcPagesDir)) {
    console.log(`${colors.yellow}⚠ Ambos os diretórios pages/ e src/pages/ existem, isso pode causar confusão${colors.reset}`);
    
    // Listar arquivos em ambos os diretórios
    const pagesFiles = fs.readdirSync(pagesDir);
    const srcPagesFiles = fs.readdirSync(srcPagesDir);
    
    const duplicates = pagesFiles.filter(file => srcPagesFiles.includes(file));
    
    if (duplicates.length > 0) {
      console.log(`${colors.red}✗ Arquivos duplicados encontrados em ambos os diretórios:${colors.reset}`);
      duplicates.forEach(file => console.log(`  - ${file}`));
    }
    
    results.duplicateStructure = {
      hasDuplicateDirectories: true,
      duplicateFiles: duplicates
    };
  } else {
    results.duplicateStructure = {
      hasDuplicateDirectories: false
    };
  }
  
  return results;
}

// Função principal
async function main() {
  console.log(`${colors.magenta}=== Verificação de Integrações do AgentVox ===${colors.reset}\n`);
  
  const envResults = await checkEnvFiles();
  const gitResults = await checkGitConfig();
  const vercelResults = await checkVercelConfig();
  const fileResults = await checkFileStructure();
  
  console.log(`\n${colors.magenta}=== Resumo ===${colors.reset}\n`);
  
  // Verificar problemas críticos
  const criticalIssues = [];
  
  // Verificar variáveis de ambiente
  const productionEnv = envResults['.env.production'];
  if (!productionEnv || !productionEnv.exists) {
    criticalIssues.push('Arquivo .env.production não encontrado');
  } else {
    if (!productionEnv.vars.NEXT_PUBLIC_SUPABASE_URL.exists) {
      criticalIssues.push('NEXT_PUBLIC_SUPABASE_URL não configurado em .env.production');
    }
    if (!productionEnv.vars.NEXT_PUBLIC_SUPABASE_ANON_KEY.exists) {
      criticalIssues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY não configurado em .env.production');
    }
  }
  
  // Verificar estrutura de arquivos
  if (fileResults.duplicateStructure.hasDuplicateDirectories && 
      fileResults.duplicateStructure.duplicateFiles.length > 0) {
    criticalIssues.push('Arquivos duplicados encontrados em pages/ e src/pages/');
  }
  
  // Verificar arquivos críticos
  if (!fileResults['src/pages/login.tsx']?.exists) {
    criticalIssues.push('Arquivo src/pages/login.tsx não encontrado');
  }
  
  if (!fileResults['src/pages/simple-login.tsx']?.exists) {
    criticalIssues.push('Arquivo src/pages/simple-login.tsx não encontrado');
  }
  
  // Exibir problemas críticos
  if (criticalIssues.length > 0) {
    console.log(`${colors.red}Problemas críticos encontrados:${colors.reset}`);
    criticalIssues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log(`${colors.green}Nenhum problema crítico encontrado!${colors.reset}`);
  }
  
  // Exibir recomendações
  console.log(`\n${colors.blue}Recomendações:${colors.reset}`);
  
  if (gitResults.hasUncommittedChanges) {
    console.log(`  - Commit e push das alterações pendentes`);
  }
  
  if (fileResults.duplicateStructure.hasDuplicateDirectories) {
    console.log(`  - Consolidar a estrutura de páginas em um único diretório (preferencialmente src/pages/)`);
  }
  
  if (!vercelResults.exists) {
    console.log(`  - Criar arquivo vercel.json para configurar o deploy`);
  }
  
  console.log(`\n${colors.magenta}Verificação concluída!${colors.reset}`);
  
  rl.close();
}

// Executar o script
main().catch(error => {
  console.error(`${colors.red}Erro ao executar o script: ${error.message}${colors.reset}`);
  process.exit(1);
});
