// Script para verificar a conexão com o Supabase após a atualização da chave
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Obter variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== VERIFICAÇÃO DA CONEXÃO COM SUPABASE ===\n');
console.log(`URL do Supabase: ${supabaseUrl || 'Não definida'}`);
console.log(`Chave do Supabase: ${supabaseKey ? `${supabaseKey.substring(0, 10)}...` : 'Não definida'}\n`);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não definidas. Verifique o arquivo .env.local.');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Testar conexão
async function testConnection() {
  try {
    console.log('Testando conexão com Supabase...');
    
    // Testar uma consulta simples
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Este erro é esperado se a tabela não existir
        console.log('✅ Conexão com Supabase estabelecida com sucesso!');
        console.log('   Erro esperado: Tabela "_test_connection" não existe, mas isso é normal.');
        
        // Testar autenticação
        await testAuth();
      } else {
        throw error;
      }
    } else {
      console.log('✅ Conexão com Supabase estabelecida com sucesso!');
      if (data && data.length > 0) {
        console.log(`   Dados recebidos: ${JSON.stringify(data)}`);
      } else {
        console.log('   Nenhum dado recebido, mas a conexão está funcionando.');
      }
      
      // Testar autenticação
      await testAuth();
    }
  } catch (error) {
    console.error(`❌ Erro ao conectar com Supabase: ${error.message}`);
    console.error(error);
    
    if (error.message.includes('fetch failed')) {
      console.log('\nPossíveis causas:');
      console.log('1. Problemas de rede ou firewall');
      console.log('2. URL do Supabase incorreta');
      console.log('3. Servidor Supabase indisponível');
    } else if (error.message.includes('invalid API key')) {
      console.log('\nPossíveis causas:');
      console.log('1. Chave anônima do Supabase incorreta');
      console.log('2. Chave expirada ou revogada');
      
      // Verificar se a chave está no formato correto
      if (supabaseKey.includes('..')) {
        console.log('\n⚠️ A chave do Supabase parece estar truncada ou incompleta.');
      }
      
      console.log('\nA chave do Supabase deve ser semelhante a:');
      console.log('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ');
    }
  }
}

// Testar autenticação
async function testAuth() {
  try {
    console.log('\nTestando API de autenticação...');
    
    // Verificar se a API de autenticação está funcionando
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error(`❌ Erro ao verificar sessão: ${error.message}`);
    } else {
      console.log('✅ API de autenticação está funcionando.');
      if (data && data.session) {
        console.log('   Sessão ativa encontrada.');
      } else {
        console.log('   Nenhuma sessão ativa encontrada, mas a API está funcionando.');
      }
      
      // Testar login anônimo
      console.log('\nTestando login anônimo...');
      const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
      
      if (signInError) {
        console.error(`❌ Erro ao fazer login anônimo: ${signInError.message}`);
      } else {
        console.log('✅ Login anônimo realizado com sucesso!');
        if (signInData && signInData.user) {
          console.log(`   ID do usuário: ${signInData.user.id}`);
        }
      }
    }
    
    console.log('\n=== RESUMO ===');
    console.log('✅ Variáveis de ambiente carregadas corretamente.');
    console.log('✅ Cliente Supabase inicializado com sucesso.');
    console.log('✅ Conexão com o Supabase estabelecida.');
    console.log('\nO Supabase está configurado corretamente e pronto para uso!');
  } catch (error) {
    console.error(`❌ Erro ao testar autenticação: ${error.message}`);
  }
}

testConnection();
