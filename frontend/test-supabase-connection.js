// Script para testar a conexão com o Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Obter variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== TESTE DE CONEXÃO COM SUPABASE ===\n');
console.log(`URL do Supabase: ${supabaseUrl || 'Não definida'}`);
console.log(`Chave do Supabase: ${supabaseKey ? '[DEFINIDA]' : 'Não definida'}\n`);

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
    }
    
    // Testar autenticação
    console.log('\nTestando autenticação...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error(`❌ Erro ao verificar sessão: ${authError.message}`);
    } else {
      console.log('✅ API de autenticação está funcionando.');
      if (authData && authData.session) {
        console.log('   Sessão ativa encontrada.');
      } else {
        console.log('   Nenhuma sessão ativa encontrada, mas a API está funcionando.');
      }
    }
    
    console.log('\n=== RESUMO ===');
    console.log('✅ Variáveis de ambiente carregadas corretamente.');
    console.log('✅ Cliente Supabase inicializado com sucesso.');
    console.log('✅ Conexão com o Supabase estabelecida.');
    console.log('\nO Supabase está configurado corretamente e pronto para uso!');
    
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
    }
    
    console.log('\nRecomendações:');
    console.log('1. Verifique se as variáveis de ambiente estão definidas corretamente no arquivo .env.local');
    console.log('2. Verifique se o URL do Supabase está correto e acessível');
    console.log('3. Verifique se a chave anônima do Supabase está correta');
    console.log('4. Reinicie o servidor Next.js após fazer alterações no arquivo .env.local');
  }
}

testConnection();
