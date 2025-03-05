// Script de diagnóstico para problemas de conexão com Supabase
// Execute com: node diagnose-supabase.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== DIAGNÓSTICO DE CONEXÃO SUPABASE ===\n');

// Verificar arquivos .env
console.log('Verificando arquivos .env...');
const envFiles = [
  '.env.local',
  '.env.development',
  '.env',
  '.env.example'
];

let foundEnvFile = false;
let envFileContent = null;
let envFilePath = null;

for (const file of envFiles) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`Arquivo ${file} encontrado.`);
    foundEnvFile = true;
    envFilePath = filePath;
    envFileContent = fs.readFileSync(filePath, 'utf8');
    break;
  }
}

if (!foundEnvFile) {
  console.error('ERRO: Nenhum arquivo .env encontrado!');
  process.exit(1);
}

// Analisar variáveis de ambiente
console.log('\nAnalisando variáveis de ambiente...');
const supabaseUrlMatch = envFileContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const supabaseKeyMatch = envFileContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

const supabaseUrl = supabaseUrlMatch ? supabaseUrlMatch[1].trim() : null;
const supabaseKey = supabaseKeyMatch ? supabaseKeyMatch[1].trim() : null;

console.log(`URL do Supabase: ${supabaseUrl ? 'Encontrado' : 'Não encontrado'}`);
console.log(`Chave do Supabase: ${supabaseKey ? 'Encontrado' : 'Não encontrado'}`);

if (supabaseUrl) {
  console.log(`Comprimento da URL: ${supabaseUrl.length}`);
  console.log(`URL válida: ${supabaseUrl.includes('supabase.co') ? 'Sim' : 'Não'}`);
}

if (supabaseKey) {
  console.log(`Comprimento da chave: ${supabaseKey.length}`);
  console.log(`Chave válida: ${supabaseKey.startsWith('eyJ') ? 'Sim' : 'Não'}`);
}

// Verificar se as variáveis estão sendo carregadas corretamente
console.log('\nVerificando carregamento das variáveis...');

try {
  // Criar um arquivo temporário para testar o carregamento das variáveis
  const testFilePath = path.join(process.cwd(), 'test-env-loading.js');
  fs.writeFileSync(testFilePath, `
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Presente (comprimento: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'Ausente');
  `);

  console.log('Executando teste de carregamento...');
  const result = execSync(`node -r dotenv/config test-env-loading.js`, { encoding: 'utf8' });
  console.log(result);

  // Limpar arquivo temporário
  fs.unlinkSync(testFilePath);
} catch (error) {
  console.error('Erro ao testar carregamento de variáveis:', error.message);
}

// Verificar se o Next.js está carregando as variáveis corretamente
console.log('\nVerificando carregamento no Next.js...');
try {
  // Criar um arquivo temporário para verificar o Next.js
  const nextTestFilePath = path.join(process.cwd(), 'pages/api/test-env.js');
  const nextTestDir = path.join(process.cwd(), 'pages/api');
  
  if (!fs.existsSync(nextTestDir)) {
    fs.mkdirSync(nextTestDir, { recursive: true });
  }
  
  fs.writeFileSync(nextTestFilePath, `
    export default function handler(req, res) {
      res.status(200).json({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'não definido',
        supabaseKeyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length : 0
      });
    }
  `);
  
  console.log('Endpoint de teste criado em /api/test-env');
  console.log('Acesse http://localhost:3001/api/test-env para verificar se as variáveis estão sendo carregadas corretamente pelo Next.js');
} catch (error) {
  console.error('Erro ao criar endpoint de teste:', error.message);
}

// Recomendações
console.log('\n=== RECOMENDAÇÕES ===');

if (!supabaseUrl || !supabaseKey) {
  console.log('1. Adicione as variáveis de ambiente corretas ao arquivo .env.local:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ');
} else {
  console.log('1. Verifique se o servidor Next.js está carregando as variáveis corretamente');
  console.log('   Acesse http://localhost:3001/api/test-env para verificar');
}

console.log('2. Limpe o cache do Next.js: rm -rf .next');
console.log('3. Reinicie o servidor: npm run dev');
console.log('4. Se o problema persistir, tente criar um novo arquivo .env.local do zero');
console.log('5. Verifique se o projeto Supabase está ativo e acessível');

console.log('\n=== FIM DO DIAGNÓSTICO ===');
