// Verificador de conexão com o Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

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

console.log(`${colors.blue}=== VERIFICADOR DE CONEXÃO COM O SUPABASE ===${colors.reset}\n`);

// Verificar se o arquivo .env.local existe
try {
  const envPath = path.resolve(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log(`${colors.red}ERRO: Arquivo .env.local não encontrado!${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.green}✓ Arquivo .env.local encontrado${colors.reset}`);
  
  // Ler o conteúdo do arquivo .env.local
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Verificar se as variáveis de ambiente estão definidas no arquivo
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
  
  if (!hasSupabaseUrl) {
    console.log(`${colors.red}ERRO: NEXT_PUBLIC_SUPABASE_URL não encontrada no arquivo .env.local${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ NEXT_PUBLIC_SUPABASE_URL encontrada no arquivo .env.local${colors.reset}`);
  }
  
  if (!hasSupabaseKey) {
    console.log(`${colors.red}ERRO: NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrada no arquivo .env.local${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ NEXT_PUBLIC_SUPABASE_ANON_KEY encontrada no arquivo .env.local${colors.reset}`);
  }
  
} catch (error) {
  console.log(`${colors.red}ERRO ao verificar arquivo .env.local: ${error.message}${colors.reset}`);
}

// Verificar se as variáveis de ambiente estão carregadas no Node.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(`\n${colors.blue}=== VARIÁVEIS DE AMBIENTE CARREGADAS ===${colors.reset}`);

if (!supabaseUrl) {
  console.log(`${colors.red}ERRO: NEXT_PUBLIC_SUPABASE_URL não está carregada no Node.js${colors.reset}`);
} else {
  console.log(`${colors.green}✓ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}${colors.reset}`);
}

if (!supabaseAnonKey) {
  console.log(`${colors.red}ERRO: NEXT_PUBLIC_SUPABASE_ANON_KEY não está carregada no Node.js${colors.reset}`);
} else {
  console.log(`${colors.green}✓ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 10)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 5)} (comprimento: ${supabaseAnonKey.length})${colors.reset}`);
}

// Verificar conexão com o Supabase
if (supabaseUrl && supabaseAnonKey) {
  console.log(`\n${colors.blue}=== TESTE DE CONEXÃO COM O SUPABASE ===${colors.reset}`);
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log(`${colors.yellow}Tentando conectar ao Supabase...${colors.reset}`);
    
    // Tentar obter a sessão atual
    const testAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log(`${colors.red}ERRO na autenticação: ${error.message}${colors.reset}`);
          return false;
        }
        
        console.log(`${colors.green}✓ Conexão com autenticação estabelecida com sucesso${colors.reset}`);
        console.log(`${colors.cyan}Sessão: ${data.session ? 'Ativa' : 'Inativa'}${colors.reset}`);
        return true;
      } catch (error) {
        console.log(`${colors.red}ERRO ao verificar autenticação: ${error.message}${colors.reset}`);
        return false;
      }
    };
    
    // Tentar acessar dados
    const testData = async () => {
      try {
        // Tentar uma consulta simples
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.code === 'PGRST116') {
            console.log(`${colors.yellow}⚠ Tabela 'profiles' não encontrada, mas a conexão com o banco de dados está funcionando${colors.reset}`);
            return true;
          }
          
          console.log(`${colors.red}ERRO ao acessar dados: ${error.message} (Código: ${error.code})${colors.reset}`);
          return false;
        }
        
        console.log(`${colors.green}✓ Acesso aos dados estabelecido com sucesso${colors.reset}`);
        console.log(`${colors.cyan}Dados recuperados: ${data.length} registro(s)${colors.reset}`);
        return true;
      } catch (error) {
        console.log(`${colors.red}ERRO ao acessar dados: ${error.message}${colors.reset}`);
        return false;
      }
    };
    
    // Executar os testes
    const runTests = async () => {
      const authResult = await testAuth();
      const dataResult = await testData();
      
      console.log(`\n${colors.blue}=== RESULTADO FINAL ===${colors.reset}`);
      
      if (authResult && dataResult) {
        console.log(`${colors.green}✓ CONEXÃO COM SUPABASE ESTABELECIDA COM SUCESSO!${colors.reset}`);
        console.log(`${colors.green}✓ Autenticação: OK${colors.reset}`);
        console.log(`${colors.green}✓ Acesso a dados: OK${colors.reset}`);
      } else if (authResult) {
        console.log(`${colors.yellow}⚠ CONEXÃO PARCIAL COM SUPABASE${colors.reset}`);
        console.log(`${colors.green}✓ Autenticação: OK${colors.reset}`);
        console.log(`${colors.red}✗ Acesso a dados: Falha${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ FALHA NA CONEXÃO COM SUPABASE${colors.reset}`);
        console.log(`${colors.red}✗ Autenticação: Falha${colors.reset}`);
        console.log(`${colors.red}✗ Acesso a dados: Falha${colors.reset}`);
      }
      
      console.log(`\n${colors.blue}=== PRÓXIMOS PASSOS ===${colors.reset}`);
      
      if (!authResult || !dataResult) {
        console.log(`${colors.yellow}1. Execute o script de correção: ./fix-supabase-api-key.sh${colors.reset}`);
        console.log(`${colors.yellow}2. Reinicie o servidor Next.js: npm run dev${colors.reset}`);
        console.log(`${colors.yellow}3. Acesse a página de diagnóstico: http://localhost:3000/diagnose${colors.reset}`);
      } else {
        console.log(`${colors.green}Tudo está funcionando corretamente! Você pode:${colors.reset}`);
        console.log(`${colors.yellow}1. Acessar a página de login: http://localhost:3000/auth/login${colors.reset}`);
        console.log(`${colors.yellow}2. Acessar a página de diagnóstico: http://localhost:3000/diagnose${colors.reset}`);
      }
    };
    
    runTests();
    
  } catch (error) {
    console.log(`${colors.red}ERRO ao criar cliente Supabase: ${error.message}${colors.reset}`);
  }
} else {
  console.log(`\n${colors.red}ERRO: Não é possível testar a conexão com o Supabase devido a variáveis de ambiente ausentes${colors.reset}`);
  console.log(`${colors.yellow}Execute o script de correção: ./fix-supabase-api-key.sh${colors.reset}`);
}
