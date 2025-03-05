// Script para verificar a conexão com o Supabase após atualização
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('=== VERIFICAÇÃO DA CONEXÃO COM SUPABASE ===\n');

// Ler variáveis de ambiente
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
    
    // Listar tabelas disponíveis
    console.log('\nListando tabelas disponíveis...');
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables');
    
    if (tablesError) {
      console.log(`❌ Erro ao listar tabelas: ${tablesError.message}`);
      console.log(tablesError);
    } else {
      console.log('✅ Tabelas disponíveis:');
      console.log(tables);
    }
    
  } catch (err) {
    console.log(`❌ Erro ao conectar com Supabase: ${err.message}`);
    console.log(err);
  }
}

// Executar o teste
testConnection();
