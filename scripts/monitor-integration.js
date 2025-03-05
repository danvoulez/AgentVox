#!/usr/bin/env node

/**
 * Script para monitoramento contínuo da integração entre GitHub, Vercel e Supabase
 * 
 * Este script verifica periodicamente:
 * 1. Status do deploy no Vercel
 * 2. Conexão com o Supabase
 * 3. Configuração das variáveis de ambiente
 * 
 * Uso: node scripts/monitor-integration.js [--interval=60] [--output=json|text]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Configurações padrão
const DEFAULT_INTERVAL = 60; // segundos
const DEFAULT_OUTPUT = 'text'; // text ou json

// Parse argumentos da linha de comando
const args = process.argv.slice(2);
const options = {
  interval: DEFAULT_INTERVAL,
  output: DEFAULT_OUTPUT
};

args.forEach(arg => {
  if (arg.startsWith('--interval=')) {
    options.interval = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--output=')) {
    options.output = arg.split('=')[1];
  }
});

// Função para verificar o status do Vercel
async function checkVercelStatus() {
  return new Promise((resolve) => {
    https.get('https://agentvox.vercel.app/status', (res) => {
      const { statusCode } = res;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: statusCode === 200 ? 'online' : 'offline',
          statusCode,
          data: statusCode === 200 ? data : null
        });
      });
    }).on('error', (err) => {
      resolve({
        status: 'error',
        error: err.message
      });
    });
  });
}

// Função para verificar a conexão com o Supabase
async function checkSupabaseConnection() {
  try {
    // Ler as variáveis de ambiente
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1];
    const supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1];
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        status: 'error',
        error: 'Variáveis de ambiente do Supabase não encontradas'
      };
    }
    
    return new Promise((resolve) => {
      const options = {
        hostname: supabaseUrl.replace('https://', ''),
        path: '/rest/v1/',
        headers: {
          'apikey': supabaseKey
        }
      };
      
      https.get(options, (res) => {
        const { statusCode } = res;
        resolve({
          status: statusCode === 200 ? 'online' : 'offline',
          statusCode
        });
      }).on('error', (err) => {
        resolve({
          status: 'error',
          error: err.message
        });
      });
    });
  } catch (err) {
    return {
      status: 'error',
      error: err.message
    };
  }
}

// Função para verificar a configuração do Git
function checkGitConfig() {
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    return {
      status: 'ok',
      remoteUrl,
      currentBranch,
      hasUncommittedChanges: status.length > 0
    };
  } catch (err) {
    return {
      status: 'error',
      error: err.message
    };
  }
}

// Função principal para executar todas as verificações
async function runChecks() {
  const timestamp = new Date().toISOString();
  const vercelStatus = await checkVercelStatus();
  const supabaseStatus = await checkSupabaseConnection();
  const gitConfig = checkGitConfig();
  
  const report = {
    timestamp,
    vercel: vercelStatus,
    supabase: supabaseStatus,
    git: gitConfig,
    summary: {
      allSystemsOperational: 
        vercelStatus.status === 'online' && 
        supabaseStatus.status === 'online' && 
        gitConfig.status === 'ok'
    }
  };
  
  if (options.output === 'json') {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`=== Relatório de Monitoramento [${timestamp}] ===\n`);
    
    console.log('Vercel:');
    console.log(`  Status: ${vercelStatus.status}`);
    if (vercelStatus.status === 'error') {
      console.log(`  Erro: ${vercelStatus.error}`);
    } else {
      console.log(`  Código: ${vercelStatus.statusCode}`);
    }
    
    console.log('\nSupabase:');
    console.log(`  Status: ${supabaseStatus.status}`);
    if (supabaseStatus.status === 'error') {
      console.log(`  Erro: ${supabaseStatus.error}`);
    } else {
      console.log(`  Código: ${supabaseStatus.statusCode}`);
    }
    
    console.log('\nGit:');
    console.log(`  Status: ${gitConfig.status}`);
    if (gitConfig.status === 'error') {
      console.log(`  Erro: ${gitConfig.error}`);
    } else {
      console.log(`  Remote URL: ${gitConfig.remoteUrl}`);
      console.log(`  Branch atual: ${gitConfig.currentBranch}`);
      console.log(`  Alterações não commitadas: ${gitConfig.hasUncommittedChanges ? 'Sim' : 'Não'}`);
    }
    
    console.log('\nResumo:');
    console.log(`  Todos os sistemas operacionais: ${report.summary.allSystemsOperational ? 'Sim' : 'Não'}`);
    
    if (!report.summary.allSystemsOperational) {
      console.log('\nProblemas detectados:');
      if (vercelStatus.status !== 'online') {
        console.log('  - Vercel não está online');
      }
      if (supabaseStatus.status !== 'online') {
        console.log('  - Supabase não está online');
      }
      if (gitConfig.status !== 'ok') {
        console.log('  - Configuração do Git tem problemas');
      }
    }
    
    console.log('\n=== Fim do Relatório ===');
  }
  
  return report;
}

// Executa uma vez imediatamente
runChecks();

// Se o intervalo for maior que 0, configura a execução periódica
if (options.interval > 0) {
  console.log(`\nMonitoramento contínuo ativado. Intervalo: ${options.interval} segundos.`);
  console.log('Pressione Ctrl+C para encerrar.\n');
  
  setInterval(runChecks, options.interval * 1000);
}
