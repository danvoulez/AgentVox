#!/usr/bin/env node

/**
 * Script para verificar o status do deploy no Vercel
 * Este script tenta acessar a URL do projeto no Vercel e verifica se está online
 */

const https = require('https');

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

console.log(`${colors.magenta}=== Verificação de Status do Vercel ===${colors.reset}\n`);

// URL do projeto no Vercel
const projectUrl = 'https://agentvox.vercel.app';

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

// Verificar se o site está online
async function checkSiteStatus(url) {
  console.log(`${colors.blue}Verificando status do site...${colors.reset}`);
  console.log(`URL: ${url}`);
  
  try {
    const response = await httpRequest(url, { method: 'HEAD' });
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`${colors.green}✓ Site está online (Status ${response.statusCode})${colors.reset}`);
      return { online: true, statusCode: response.statusCode };
    } else if (response.statusCode === 404) {
      console.log(`${colors.red}✗ Site não encontrado (Status 404)${colors.reset}`);
      return { online: false, statusCode: response.statusCode };
    } else {
      console.log(`${colors.yellow}⚠ Site retornou status ${response.statusCode}${colors.reset}`);
      return { online: false, statusCode: response.statusCode };
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erro ao verificar status do site: ${error.message}${colors.reset}`);
    return { online: false, error: error.message };
  }
}

// Verificar páginas críticas
async function checkCriticalPages(baseUrl) {
  console.log(`\n${colors.blue}Verificando páginas críticas...${colors.reset}`);
  
  const criticalPages = [
    '/',
    '/login',
    '/simple-login',
    '/status'
  ];
  
  const results = {};
  
  for (const page of criticalPages) {
    const pageUrl = new URL(page, baseUrl).toString();
    
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

// Função principal
async function main() {
  try {
    // Verificar status do site
    const siteStatus = await checkSiteStatus(projectUrl);
    
    if (siteStatus.online) {
      // Verificar páginas críticas
      const pagesStatus = await checkCriticalPages(projectUrl);
      
      // Resumo
      console.log(`\n${colors.magenta}=== Resumo ===${colors.reset}`);
      
      // Verificar problemas críticos
      const criticalIssues = [];
      
      if (pagesStatus['/'] && pagesStatus['/'].status !== 'ok') {
        criticalIssues.push('A página inicial não está acessível');
      }
      
      if (pagesStatus['/login'] && pagesStatus['/login'].status !== 'ok') {
        criticalIssues.push('A página de login não está acessível');
      }
      
      if (pagesStatus['/simple-login'] && pagesStatus['/simple-login'].status !== 'ok') {
        criticalIssues.push('A página de login simples não está acessível');
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
      
      if (pagesStatus['/status'] && pagesStatus['/status'].status !== 'ok') {
        console.log(`  - Verificar se a página de status foi deployada corretamente`);
      }
    } else {
      console.log(`\n${colors.magenta}=== Resumo ===${colors.reset}`);
      console.log(`${colors.red}O site não está acessível no Vercel${colors.reset}`);
      console.log(`\n${colors.blue}Recomendações:${colors.reset}`);
      console.log(`  - Verificar se o projeto foi deployado no Vercel`);
      console.log(`  - Verificar se o domínio está configurado corretamente`);
      console.log(`  - Verificar logs de build no painel do Vercel`);
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
