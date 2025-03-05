// Teste direto da conexão com o Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('URL do Supabase:', supabaseUrl);
  console.log('Chave do Supabase (primeiros 10 caracteres):', supabaseKey.substring(0, 10) + '...');
  
  try {
    console.log('Criando cliente Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Tentando fazer uma consulta simples...');
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Conexão com Supabase estabelecida com sucesso!');
        console.log('Nota: Tabela _test_connection não existe, mas isso é esperado.');
      } else {
        throw error;
      }
    } else {
      console.log('Conexão com Supabase estabelecida com sucesso!');
      console.log('Dados retornados:', data);
    }
  } catch (error) {
    console.error('Erro ao conectar com o Supabase:', error.message);
    
    if (error.message.includes('fetch failed')) {
      console.log('Possível problema de rede. Verifique sua conexão com a internet.');
    } else if (error.message.includes('invalid API key')) {
      console.log('Chave de API inválida. Verifique se NEXT_PUBLIC_SUPABASE_ANON_KEY está correta.');
    } else if (error.message.includes('invalid URL')) {
      console.log('URL inválida. Verifique se NEXT_PUBLIC_SUPABASE_URL está correta.');
    }
  }
}

testSupabase();
