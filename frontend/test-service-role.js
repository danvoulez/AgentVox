// Script para testar a conexão com o Supabase usando diretamente a service role key
const { createClient } = require('@supabase/supabase-js');

console.log('=== TESTE DE CONEXÃO COM SERVICE ROLE KEY ===\n');

// Service Role Key do Supabase
const supabaseUrl = 'https://nwvxzlkhoobtotuixvpn.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDY2NTA1MCwiZXhwIjoyMDU2MjQxMDUwfQ.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ';

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
    
    // Listar tabelas disponíveis
    console.log('\nListando tabelas disponíveis...');
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables');
    
    if (tablesError) {
      console.log(`❌ Erro ao listar tabelas: ${tablesError.message}`);
      console.log(tablesError);
      
      // Tentar listar schemas
      console.log('\nTentando listar schemas...');
      const { data: schemas, error: schemasError } = await supabase.rpc('get_schemas');
      
      if (schemasError) {
        console.log(`❌ Erro ao listar schemas: ${schemasError.message}`);
        console.log(schemasError);
      } else {
        console.log('✅ Schemas disponíveis:');
        console.log(schemas);
      }
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
