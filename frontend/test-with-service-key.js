// Script para testar a conexão com o Supabase usando a service role key
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('=== TESTE DE CONEXÃO COM SERVICE ROLE KEY ===\n');

// Obter as variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.log('❌ Variáveis de ambiente não encontradas');
  console.log(`URL: ${supabaseUrl || 'não definida'}`);
  console.log(`Service Role Key: ${serviceRoleKey ? serviceRoleKey.substring(0, 10) + '...' : 'não definida'}`);
  process.exit(1);
}

console.log(`URL do Supabase: ${supabaseUrl}`);
console.log(`Service Role Key: ${serviceRoleKey.substring(0, 10)}...\n`);

// Criar cliente Supabase com a service role key
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Função para testar a conexão
async function testConnection() {
  try {
    console.log('Testando conexão com Supabase usando service role key...');
    
    // Tentar fazer uma consulta simples
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    
    if (error) {
      console.log(`❌ Erro ao consultar Supabase: ${error.message}`);
      console.log(error);
      
      // Tentar outra tabela se a primeira falhar
      console.log('\nTentando consultar outra tabela...');
      const { data: data2, error: error2 } = await supabase.from('users').select('*').limit(1);
      
      if (error2) {
        console.log(`❌ Erro ao consultar tabela 'users': ${error2.message}`);
        console.log(error2);
      } else {
        console.log('✅ Conexão com Supabase estabelecida com sucesso!');
        console.log(`Dados recebidos: ${JSON.stringify(data2)}`);
      }
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
