// Script para verificar se a URL do Supabase está acessível
const https = require('https');
require('dotenv').config({ path: '.env.local' });

console.log('=== VERIFICAÇÃO DA URL DO SUPABASE ===\n');

// Obter a URL do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  console.log('❌ URL do Supabase não encontrada no arquivo .env.local');
  process.exit(1);
}

console.log(`Verificando URL do Supabase: ${supabaseUrl}`);

// Função para verificar se a URL está acessível
function checkUrl() {
  try {
    console.log('Fazendo requisição para a URL...');
    
    // Tentar acessar a URL do Supabase usando https nativo
    const url = new URL(supabaseUrl);
    
    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'GET'
    }, (res) => {
      console.log(`Status da resposta: ${res.statusCode} ${res.statusMessage}`);
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('✅ URL do Supabase está acessível!');
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log('Resposta:', data.substring(0, 200) + '...');
        });
      } else {
        console.log('❌ URL do Supabase não está acessível.');
        console.log('Isso pode indicar que o projeto foi excluído ou está inativo.');
      }
    });
    
    req.on('error', (err) => {
      console.log(`❌ Erro ao acessar a URL: ${err.message}`);
      console.log('Isso pode indicar que o projeto foi excluído ou está inativo.');
      console.log(err);
    });
    
    req.end();
  } catch (err) {
    console.log(`❌ Erro ao acessar a URL: ${err.message}`);
    console.log('Isso pode indicar que o projeto foi excluído ou está inativo.');
    console.log(err);
  }
}

// Executar a verificação
checkUrl();
