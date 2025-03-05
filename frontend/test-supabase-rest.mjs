// Script para testar a conexão com o Supabase usando fetch diretamente
// Usando import para node-fetch v3
import fetch from 'node-fetch';

console.log('=== TESTE DE CONEXÃO COM SUPABASE VIA REST ===\n');

// Chave do Supabase do dashboard (visível na imagem)
const supabaseUrl = 'https://nwvxzlkhoobtotuixvpn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.OBybRvjNy--BHYRvjNX--BHYRvjNy--BHYRvjNy--BHYRvjNy';

console.log(`URL do Supabase: ${supabaseUrl}`);
console.log(`Chave do Supabase: ${supabaseKey.substring(0, 10)}...`);

// Função para testar a conexão
async function testConnection() {
  try {
    console.log('\nTestando conexão com Supabase via REST...');
    
    // Fazer uma requisição para a API REST do Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexão com Supabase estabelecida com sucesso!');
      console.log(`Resposta: ${JSON.stringify(data)}`);
    } else {
      const errorData = await response.json();
      console.log(`❌ Erro ao conectar com Supabase: ${response.status} ${response.statusText}`);
      console.log(errorData);
    }
  } catch (err) {
    console.log(`❌ Erro ao conectar com Supabase: ${err.message}`);
    console.log(err);
  }
}

// Executar o teste
testConnection();
