// Script para verificar as variáveis de ambiente no Node.js
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para saída no console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.blue}=== VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE ===${colors.reset}\n`);

// Carregar variáveis de ambiente do arquivo .env.local
const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`${colors.green}✓ Arquivo .env.local encontrado${colors.reset}`);
  
  // Ler o conteúdo do arquivo .env.local
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(`${colors.cyan}Conteúdo do arquivo .env.local:${colors.reset}`);
  console.log(envContent);
  
  // Carregar as variáveis de ambiente do arquivo
  const envConfig = dotenv.parse(envContent);
  console.log(`\n${colors.cyan}Variáveis carregadas do arquivo:${colors.reset}`);
  for (const key in envConfig) {
    if (key.includes('SUPABASE')) {
      const value = envConfig[key];
      console.log(`${colors.yellow}${key}:${colors.reset} ${value.substring(0, 10)}...${value.substring(value.length - 5)} (comprimento: ${value.length})`);
    } else {
      console.log(`${colors.yellow}${key}:${colors.reset} [valor omitido]`);
    }
  }
  
  // Carregar as variáveis de ambiente no Node.js
  dotenv.config({ path: envPath });
} else {
  console.log(`${colors.red}✗ Arquivo .env.local não encontrado${colors.reset}`);
}

// Verificar as variáveis de ambiente carregadas no Node.js
console.log(`\n${colors.cyan}Variáveis carregadas no Node.js:${colors.reset}`);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl) {
  console.log(`${colors.green}✓ NEXT_PUBLIC_SUPABASE_URL:${colors.reset} ${supabaseUrl}`);
} else {
  console.log(`${colors.red}✗ NEXT_PUBLIC_SUPABASE_URL não está definida${colors.reset}`);
}

if (supabaseKey) {
  console.log(`${colors.green}✓ NEXT_PUBLIC_SUPABASE_ANON_KEY:${colors.reset} ${supabaseKey.substring(0, 10)}...${supabaseKey.substring(supabaseKey.length - 5)} (comprimento: ${supabaseKey.length})`);
} else {
  console.log(`${colors.red}✗ NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida${colors.reset}`);
}

// Verificar se as variáveis de ambiente estão corretamente formatadas
console.log(`\n${colors.blue}=== VERIFICAÇÃO DE FORMATO ===${colors.reset}`);

if (supabaseUrl) {
  if (supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')) {
    console.log(`${colors.green}✓ NEXT_PUBLIC_SUPABASE_URL está no formato correto${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ NEXT_PUBLIC_SUPABASE_URL não está no formato correto${colors.reset}`);
  }
}

if (supabaseKey) {
  if (supabaseKey.includes('.') && supabaseKey.length > 100) {
    console.log(`${colors.green}✓ NEXT_PUBLIC_SUPABASE_ANON_KEY parece estar no formato correto${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ NEXT_PUBLIC_SUPABASE_ANON_KEY não parece estar no formato correto${colors.reset}`);
  }
}

console.log(`\n${colors.blue}=== CONCLUSÃO ===${colors.reset}`);
if (supabaseUrl && supabaseKey) {
  console.log(`${colors.green}✓ As variáveis de ambiente estão configuradas corretamente${colors.reset}`);
  console.log(`${colors.yellow}Agora você pode:${colors.reset}`);
  console.log(`1. Reiniciar o servidor Next.js: ${colors.cyan}npm run dev${colors.reset}`);
  console.log(`2. Acessar a página de diagnóstico: ${colors.cyan}http://localhost:3000/diagnose${colors.reset}`);
} else {
  console.log(`${colors.red}✗ Há problemas com as variáveis de ambiente${colors.reset}`);
  console.log(`${colors.yellow}Execute o script de correção: ${colors.cyan}./fix-supabase-api-key.sh${colors.reset}`);
}
