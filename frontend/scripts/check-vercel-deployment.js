#!/usr/bin/env node

/**
 * Script para verificar o status do deploy no Vercel
 * 
 * Uso: node scripts/check-vercel-deployment.js [url]
 * 
 * Exemplo: node scripts/check-vercel-deployment.js https://agentvox.vercel.app
 */

const https = require('https');
const { execSync } = require('child_process');

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

// Obter URL do argumento ou usar padrão
const url = process.argv[2] || 'https://agentvox.vercel.app';

console.log(`${colors.magenta}=== Verificando status do deploy no Vercel ===${colors.reset}\n`);
console.log(`URL: ${url}\n`);

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

// Verificar páginas críticas
async function checkPages() {
  const pagesToCheck = [
    '/',
    '/login',
    '/simple-login',
    '/status'
  ];
  
  console.log(`${colors.blue}Verificando páginas críticas...${colors.reset}\n`);
  
  const results = {};
  
  for (const page of pagesToCheck) {
    const pageUrl = new URL(page, url).toString();
    
    try {
      console.log(`Verificando ${pageUrl}...`);
      const response = await httpRequest(pageUrl, { method: 'HEAD' });
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        console.log(`${colors.green}✓ ${page} - OK (${response.statusCode})${colors.reset}`);
        results[page] = { status: 'ok', statusCode: response.statusCode };
      } else if (response.statusCode === 404) {
        console.log(`${colors.red}✗ ${page} - Não encontrado (404)${colors.reset}`);
        results[page] = { status: 'not_found', statusCode: response.statusCode };
      } else {
        console.log(`${colors.yellow}⚠ ${page} - Erro (${response.statusCode})${colors.reset}`);
        results[page] = { status: 'error', statusCode: response.statusCode };
      }
    } catch (error) {
      console.log(`${colors.red}✗ ${page} - Erro: ${error.message}${colors.reset}`);
      results[page] = { status: 'error', error: error.message };
    }
  }
  
  return results;
}

// Verificar cabeçalhos de segurança
async function checkSecurityHeaders() {
  console.log(`\n${colors.blue}Verificando cabeçalhos de segurança...${colors.reset}\n`);
  
  try {
    const response = await httpRequest(url, { method: 'HEAD' });
    
    const securityHeaders = {
      'Strict-Transport-Security': response.headers['strict-transport-security'],
      'X-Content-Type-Options': response.headers['x-content-type-options'],
      'X-Frame-Options': response.headers['x-frame-options'],
      'X-XSS-Protection': response.headers['x-xss-protection'],
      'Referrer-Policy': response.headers['referrer-policy']
    };
    
    for (const [header, value] of Object.entries(securityHeaders)) {
      if (value) {
        console.log(`${colors.green}✓ ${header}: ${value}${colors.reset}`);
      } else {
        console.log(`${colors.yellow}⚠ ${header} não encontrado${colors.reset}`);
      }
    }
    
    return securityHeaders;
  } catch (error) {
    console.log(`${colors.red}✗ Erro ao verificar cabeçalhos: ${error.message}${colors.reset}`);
    return { error: error.message };
  }
}

// Verificar se o site está usando HTTPS
async function checkHttps() {
  console.log(`\n${colors.blue}Verificando HTTPS...${colors.reset}\n`);
  
  if (!url.startsWith('https://')) {
    console.log(`${colors.red}✗ O site não está usando HTTPS${colors.reset}`);
    return { https: false };
  }
  
  try {
    const response = await httpRequest(url, { method: 'HEAD' });
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`${colors.green}✓ HTTPS configurado corretamente${colors.reset}`);
      return { https: true };
    } else {
      console.log(`${colors.yellow}⚠ HTTPS configurado, mas retornou status ${response.statusCode}${colors.reset}`);
      return { https: true, statusCode: response.statusCode };
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erro ao verificar HTTPS: ${error.message}${colors.reset}`);
    return { https: false, error: error.message };
  }
}

// Função principal
async function main() {
  try {
    const httpsResult = await checkHttps();
    const pagesResult = await checkPages();
    const securityHeadersResult = await checkSecurityHeaders();
    
    console.log(`\n${colors.magenta}=== Resumo ===${colors.reset}\n`);
    
    // Verificar problemas críticos
    const criticalIssues = [];
    
    if (!httpsResult.https) {
      criticalIssues.push('O site não está usando HTTPS');
    }
    
    if (pagesResult['/'] && pagesResult['/'].status !== 'ok') {
      criticalIssues.push('A página inicial não está acessível');
    }
    
    if (pagesResult['/login'] && pagesResult['/login'].status !== 'ok') {
      criticalIssues.push('A página de login não está acessível');
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
    
    if (pagesResult['/status'] && pagesResult['/status'].status !== 'ok') {
      console.log(`  - Verificar se a página de status foi deployada corretamente`);
    }
    
    if (!securityHeadersResult['Strict-Transport-Security']) {
      console.log(`  - Adicionar cabeçalho Strict-Transport-Security`);
    }
    
    console.log(`\n${colors.magenta}Verificação concluída!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Erro ao executar verificação: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Executar o script
main().catch(error => {
  console.error(`${colors.red}Erro ao executar o script: ${error.message}${colors.reset}`);
  process.exit(1);
});
