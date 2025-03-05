// Script para atualizar o arquivo .env.local com a chave do Supabase
const fs = require('fs');
const path = require('path');

console.log('=== ATUALIZAÇÃO DO ARQUIVO .ENV.LOCAL ===\n');

// Ler o arquivo com a chave
const keyFile = path.join(__dirname, 'supabase-key.txt');
const keyContent = fs.readFileSync(keyFile, 'utf8');

// Extrair a chave
const urlMatch = keyContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = keyContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

if (!urlMatch || !keyMatch || !keyMatch[1]) {
  console.log('❌ Chave não encontrada no arquivo supabase-key.txt');
  console.log('Por favor, edite o arquivo e cole a chave correta.');
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

if (!supabaseKey) {
  console.log('❌ Chave não encontrada no arquivo supabase-key.txt');
  console.log('Por favor, edite o arquivo e cole a chave correta.');
  process.exit(1);
}

console.log(`URL do Supabase: ${supabaseUrl}`);
console.log(`Chave do Supabase: ${supabaseKey.substring(0, 10)}...`);

// Atualizar o arquivo .env.local
const envFile = path.join(__dirname, '.env.local');
if (fs.existsSync(envFile)) {
  console.log(`\nAtualizando arquivo .env.local em: ${envFile}`);
  
  // Ler o conteúdo atual
  const currentContent = fs.readFileSync(envFile, 'utf8');
  
  // Atualizar o conteúdo com a nova chave
  let newContent = currentContent;
  
  // Atualizar URL do Supabase se necessário
  if (newContent.includes('NEXT_PUBLIC_SUPABASE_URL=')) {
    newContent = newContent.replace(/NEXT_PUBLIC_SUPABASE_URL=.*/, `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`);
  } else {
    newContent += `\nNEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`;
  }
  
  // Atualizar chave do Supabase
  if (newContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    newContent = newContent.replace(/NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/, `NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}`);
  } else {
    newContent += `\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}`;
  }
  
  // Escrever o novo conteúdo no arquivo
  fs.writeFileSync(envFile, newContent);
  
  console.log('✅ Arquivo .env.local atualizado com sucesso!');
  
  // Criar script para verificar a conexão
  const verifyScript = path.join(__dirname, 'verify-updated-connection.js');
  fs.writeFileSync(verifyScript, `// Script para verificar a conexão com o Supabase após atualização
const { createClient } = require('@supabase/supabase-js');

console.log('=== VERIFICAÇÃO DA CONEXÃO COM SUPABASE ===\n');

// Ler variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Variáveis de ambiente não encontradas');
  console.log(`URL: ${supabaseUrl || 'não definida'}`);
  console.log(`Chave: ${supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'não definida'}`);
  process.exit(1);
}

console.log(`URL do Supabase: ${supabaseUrl}`);
console.log(`Chave do Supabase: ${supabaseKey.substring(0, 10)}...`);

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para testar a conexão
async function testConnection() {
  try {
    console.log('\nTestando conexão com Supabase...');
    
    // Tentar fazer uma consulta simples
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    
    if (error) {
      console.log(`❌ Erro ao consultar Supabase: ${error.message}`);
      console.log(error);
    } else {
      console.log('✅ Conexão com Supabase estabelecida com sucesso!');
      console.log(`Dados recebidos: ${JSON.stringify(data)}`);
    }
    
    // Testar autenticação
    console.log('\nTestando autenticação com Supabase...');
    const authResponse = await supabase.auth.getSession();
    
    if (authResponse.error) {
      console.log(`❌ Erro ao verificar sessão: ${authResponse.error.message}`);
      console.log(authResponse.error);
    } else {
      console.log('✅ Verificação de sessão bem-sucedida!');
      console.log(`Sessão: ${JSON.stringify(authResponse.data)}`);
    }
  } catch (err) {
    console.log(`❌ Erro ao conectar com Supabase: ${err.message}`);
    console.log(err);
  }
}

// Executar o teste
testConnection();
`);
  
  console.log('\n⚠️ IMPORTANTE: Para verificar a conexão, execute:');
  console.log('node verify-updated-connection.js');
  
} else {
  console.log(`❌ Arquivo .env.local não encontrado em: ${envFile}`);
}
