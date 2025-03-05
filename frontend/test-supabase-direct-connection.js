// Script para testar a conexão direta com o Supabase usando a biblioteca @supabase/supabase-js
const { createClient } = require('@supabase/supabase-js');

console.log('=== TESTE DE CONEXÃO DIRETA COM SUPABASE ===\n');

// Chave do Supabase do dashboard (visível na imagem)
const supabaseUrl = 'https://nwvxzlkhoobtotuixvpn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.OBybRvjNy--BHYRvjNX--BHYRvjNy--BHYRvjNy--BHYRvjNy';

console.log(`URL do Supabase: ${supabaseUrl}`);
console.log(`Chave do Supabase: ${supabaseKey.substring(0, 10)}...`);

// Criar cliente Supabase
try {
  console.log('\nCriando cliente Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('✅ Cliente Supabase criado com sucesso!');
  
  // Testar conexão
  console.log('\nTestando conexão com Supabase...');
  
  // Função para testar a conexão
  async function testConnection() {
    try {
      // Tentar fazer uma consulta simples
      const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
      
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
  
} catch (err) {
  console.log(`❌ Erro ao criar cliente Supabase: ${err.message}`);
  console.log(err);
}
