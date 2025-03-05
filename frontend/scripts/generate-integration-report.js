#!/usr/bin/env node

/**
 * Script para gerar um relatório completo sobre a integração entre GitHub, Vercel e Supabase
 * 
 * Este script verifica:
 * 1. Configuração do Git e status do repositório
 * 2. Configuração do Vercel
 * 3. Configuração do Supabase
 * 4. Variáveis de ambiente
 * 5. Estrutura de arquivos críticos
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

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

// Verificar configuração do Git
async function checkGitConfig() {
  console.log(`${colors.magenta}=== Configuração do Git ===${colors.reset}\n`);
  
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
    
    // Obter último commit
    const lastCommit = execSync('git log -1 --pretty=format:"%h - %s (%cr)"').toString().trim();
    console.log(`${colors.green}✓ Último commit: ${lastCommit}${colors.reset}`);
    
    return {
      isGitRepo: true,
      remoteUrl,
      currentBranch,
      hasUncommittedChanges: !!status,
      lastCommit
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
  console.log(`\n${colors.magenta}=== Configuração do Vercel ===${colors.reset}\n`);
  
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
      console.log(`${colors.green}✓ Variáveis de ambiente configuradas:${colors.reset}`);
      Object.keys(vercelConfig.env).forEach(key => {
        console.log(`  - ${key}: ${vercelConfig.env[key].startsWith('@env:') ? '[Referência a variável de ambiente]' : '[Valor direto]'}`);
      });
    }
    
    if (vercelConfig.headers) {
      console.log(`${colors.green}✓ Cabeçalhos de segurança configurados${colors.reset}`);
    }
    
    if (vercelConfig.routes) {
      console.log(`${colors.green}✓ Rotas configuradas:${colors.reset}`);
      vercelConfig.routes.forEach(route => {
        if (route.src && route.dest) {
          console.log(`  - ${route.src} -> ${route.dest}`);
        }
      });
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

// Verificar configuração do Supabase
async function checkSupabaseConfig() {
  console.log(`\n${colors.magenta}=== Configuração do Supabase ===${colors.reset}\n`);
  
  // Verificar arquivos de ambiente
  const envFiles = [
    '.env.local',
    '.env.development',
    '.env.production'
  ];
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  let supabaseUrl = null;
  let supabaseKey = null;
  
  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`${colors.yellow}Arquivo ${file} não encontrado${colors.reset}`);
      continue;
    }
    
    console.log(`${colors.green}✓ Arquivo ${file} encontrado${colors.reset}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (const requiredVar of requiredVars) {
      const varLine = lines.find(line => line.startsWith(`${requiredVar}=`));
      
      if (varLine) {
        const value = varLine.split('=')[1].trim();
        console.log(`${colors.green}  ✓ ${requiredVar} configurado${colors.reset}`);
        
        if (requiredVar === 'NEXT_PUBLIC_SUPABASE_URL' && !supabaseUrl) {
          supabaseUrl = value;
        } else if (requiredVar === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && !supabaseKey) {
          supabaseKey = value;
        }
      } else {
        console.log(`${colors.red}  ✗ ${requiredVar} não configurado${colors.reset}`);
      }
    }
  }
  
  if (supabaseUrl && supabaseKey) {
    console.log(`${colors.green}✓ Credenciais do Supabase encontradas${colors.reset}`);
    
    // Testar conexão com o Supabase
    console.log(`\n${colors.blue}Testando conexão com o Supabase...${colors.reset}`);
    
    try {
      // Construir a URL para a API REST do Supabase
      const apiUrl = `${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`;
      
      // Executar curl para testar a conexão
      const result = execSync(`curl -s -I "${apiUrl}" -H "apikey: ${supabaseKey}" -H "Authorization: Bearer ${supabaseKey}"`).toString();
      
      // Verificar o status HTTP
      const statusLine = result.split('\n').find(line => line.startsWith('HTTP/'));
      const statusCode = statusLine ? statusLine.split(' ')[1] : null;
      
      if (statusCode && statusCode.startsWith('2')) {
        console.log(`${colors.green}✓ Conexão com o Supabase bem-sucedida (Status ${statusCode})${colors.reset}`);
        return {
          hasCredentials: true,
          connectionSuccess: true,
          url: supabaseUrl,
          statusCode
        };
      } else {
        console.log(`${colors.red}✗ Falha na conexão com o Supabase (Status ${statusCode || 'desconhecido'})${colors.reset}`);
        return {
          hasCredentials: true,
          connectionSuccess: false,
          url: supabaseUrl,
          statusCode
        };
      }
    } catch (error) {
      console.log(`${colors.red}✗ Erro ao testar conexão com o Supabase: ${error.message}${colors.reset}`);
      return {
        hasCredentials: true,
        connectionSuccess: false,
        url: supabaseUrl,
        error: error.message
      };
    }
  } else {
    console.log(`${colors.red}✗ Credenciais do Supabase não encontradas${colors.reset}`);
    return {
      hasCredentials: false
    };
  }
}

// Verificar estrutura de arquivos
async function checkFileStructure() {
  console.log(`\n${colors.magenta}=== Estrutura de Arquivos ===${colors.reset}\n`);
  
  const criticalFiles = [
    'src/pages/login.tsx',
    'src/pages/simple-login.tsx',
    'src/pages/status.tsx',
    'src/pages/index.tsx',
    'src/utils/supabase-client.ts',
    'src/components/ErrorBoundary.tsx'
  ];
  
  const results = {};
  
  for (const file of criticalFiles) {
    const filePath = path.join(process.cwd(), file);
    
    if (fs.existsSync(filePath)) {
      console.log(`${colors.green}✓ ${file} encontrado${colors.reset}`);
      results[file] = { exists: true };
    } else {
      console.log(`${colors.red}✗ ${file} não encontrado${colors.reset}`);
      results[file] = { exists: false };
    }
  }
  
  // Verificar se há diretórios duplicados (pages/ e src/pages/)
  const pagesDir = path.join(process.cwd(), 'pages');
  const srcPagesDir = path.join(process.cwd(), 'src/pages');
  
  if (fs.existsSync(pagesDir) && fs.existsSync(srcPagesDir)) {
    console.log(`${colors.yellow}⚠ Ambos os diretórios pages/ e src/pages/ existem, isso pode causar confusão${colors.reset}`);
    
    // Verificar arquivos duplicados
    const pagesFiles = fs.readdirSync(pagesDir);
    const srcPagesFiles = fs.readdirSync(srcPagesDir);
    
    const duplicates = pagesFiles.filter(file => srcPagesFiles.includes(file));
    
    if (duplicates.length > 0) {
      console.log(`${colors.red}✗ Arquivos duplicados encontrados em ambos os diretórios:${colors.reset}`);
      duplicates.forEach(file => console.log(`  - ${file}`));
    }
    
    results.duplicatedDirs = {
      hasDuplicates: true,
      duplicateFiles: duplicates
    };
  } else {
    results.duplicatedDirs = {
      hasDuplicates: false
    };
  }
  
  return results;
}

// Função principal
async function main() {
  console.log(`${colors.magenta}=== Relatório de Integração do AgentVox ===${colors.reset}\n`);
  console.log(`Data: ${new Date().toISOString()}\n`);
  
  // Verificar configuração do Git
  const gitConfig = await checkGitConfig();
  
  // Verificar configuração do Vercel
  const vercelConfig = await checkVercelConfig();
  
  // Verificar configuração do Supabase
  const supabaseConfig = await checkSupabaseConfig();
  
  // Verificar estrutura de arquivos
  const fileStructure = await checkFileStructure();
  
  // Resumo e recomendações
  console.log(`\n${colors.magenta}=== Resumo ===${colors.reset}\n`);
  
  // Problemas críticos
  const criticalIssues = [];
  
  // Verificar problemas com Git
  if (!gitConfig.isGitRepo) {
    criticalIssues.push('O diretório não é um repositório Git');
  } else if (gitConfig.hasUncommittedChanges) {
    criticalIssues.push('Há alterações não commitadas');
  }
  
  // Verificar problemas com Vercel
  if (!vercelConfig.exists) {
    criticalIssues.push('Arquivo vercel.json não encontrado');
  } else if (vercelConfig.exists && !vercelConfig.isValid) {
    criticalIssues.push('Arquivo vercel.json inválido');
  }
  
  // Verificar problemas com Supabase
  if (!supabaseConfig.hasCredentials) {
    criticalIssues.push('Credenciais do Supabase não encontradas');
  } else if (!supabaseConfig.connectionSuccess) {
    criticalIssues.push('Falha na conexão com o Supabase');
  }
  
  // Verificar problemas com estrutura de arquivos
  const missingFiles = Object.entries(fileStructure)
    .filter(([key, value]) => key !== 'duplicatedDirs' && !value.exists)
    .map(([key]) => key);
  
  if (missingFiles.length > 0) {
    criticalIssues.push(`Arquivos críticos não encontrados: ${missingFiles.join(', ')}`);
  }
  
  if (fileStructure.duplicatedDirs && fileStructure.duplicatedDirs.hasDuplicates) {
    criticalIssues.push('Estrutura de diretórios duplicada (pages/ e src/pages/)');
  }
  
  // Exibir problemas críticos
  if (criticalIssues.length > 0) {
    console.log(`${colors.red}Problemas críticos encontrados:${colors.reset}`);
    criticalIssues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log(`${colors.green}Nenhum problema crítico encontrado!${colors.reset}`);
  }
  
  // Recomendações
  console.log(`\n${colors.blue}Recomendações:${colors.reset}`);
  
  if (gitConfig.hasUncommittedChanges) {
    console.log(`  - Commit e push das alterações pendentes`);
  }
  
  if (fileStructure.duplicatedDirs && fileStructure.duplicatedDirs.hasDuplicates) {
    console.log(`  - Consolidar a estrutura de páginas em um único diretório (preferencialmente src/pages/)`);
    console.log(`  - Use o script consolidate-pages.sh para mover os arquivos`);
  }
  
  if (!supabaseConfig.connectionSuccess && supabaseConfig.hasCredentials) {
    console.log(`  - Verificar as credenciais do Supabase`);
    console.log(`  - Verificar se o projeto do Supabase está acessível`);
  }
  
  // Próximos passos
  console.log(`\n${colors.magenta}Próximos Passos:${colors.reset}`);
  console.log(`  1. Resolver os problemas críticos identificados`);
  console.log(`  2. Executar 'git push' para enviar as alterações para o GitHub`);
  console.log(`  3. Verificar o status do deploy no Vercel`);
  console.log(`  4. Testar a aplicação em produção`);
  
  console.log(`\n${colors.magenta}Relatório concluído!${colors.reset}`);
}

// Executar o script
main().catch(error => {
  console.error(`${colors.red}Erro ao executar o relatório: ${error.message}${colors.reset}`);
  process.exit(1);
});
