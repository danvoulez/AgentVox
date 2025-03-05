// Script para verificar a chave do Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Obter variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== VERIFICAÇÃO DA CHAVE DO SUPABASE ===\n');
console.log(`URL do Supabase: ${supabaseUrl || 'Não definida'}`);
console.log(`Chave atual do Supabase: ${supabaseKey ? supabaseKey : 'Não definida'}\n`);

if (!supabaseUrl) {
  console.error('❌ URL do Supabase não definida. Verifique o arquivo .env.local.');
  process.exit(1);
}

// Criar interface de leitura
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Perguntar ao usuário se deseja testar com uma nova chave
rl.question('\nDeseja testar com uma nova chave do Supabase? (s/n): ', (answer) => {
  if (answer.toLowerCase() === 's') {
    rl.question('\nDigite a nova chave anônima do Supabase: ', async (newKey) => {
      await testWithKey(newKey);
      rl.close();
    });
  } else {
    console.log('\nUtilizando a chave atual do arquivo .env.local...');
    testWithKey(supabaseKey).then(() => rl.close());
  }
});

// Testar conexão com uma chave específica
async function testWithKey(key) {
  try {
    console.log('\nTestando conexão com Supabase...');
    
    // Criar cliente Supabase com a chave fornecida
    const supabase = createClient(supabaseUrl, key);
    
    // Testar uma consulta simples
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Este erro é esperado se a tabela não existir
        console.log('✅ Conexão com Supabase estabelecida com sucesso!');
        console.log('   Erro esperado: Tabela "_test_connection" não existe, mas isso é normal.');
        
        // Se a chave funcionar e for diferente da atual, perguntar se deseja atualizar o arquivo .env.local
        if (key !== supabaseKey) {
          updateEnvFile(key);
        }
      } else {
        throw error;
      }
    } else {
      console.log('✅ Conexão com Supabase estabelecida com sucesso!');
      
      // Se a chave funcionar e for diferente da atual, perguntar se deseja atualizar o arquivo .env.local
      if (key !== supabaseKey) {
        updateEnvFile(key);
      }
    }
  } catch (error) {
    console.error(`❌ Erro ao conectar com Supabase: ${error.message}`);
    
    if (error.message.includes('invalid API key')) {
      console.log('\nA chave fornecida é inválida. Verifique se:');
      console.log('1. A chave anônima do Supabase está correta');
      console.log('2. A chave não expirou ou foi revogada');
      console.log('3. Você está usando a chave anônima (anon) e não a chave de serviço (service_role)');
    }
  }
}

// Função para atualizar o arquivo .env.local
function updateEnvFile(newKey) {
  rl.question('\nA nova chave funciona! Deseja atualizar o arquivo .env.local com esta chave? (s/n): ', (answer) => {
    if (answer.toLowerCase() === 's') {
      const fs = require('fs');
      const path = require('path');
      const envFile = path.join(__dirname, '.env.local');
      
      try {
        let envContent = fs.readFileSync(envFile, 'utf8');
        envContent = envContent.replace(/NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/, `NEXT_PUBLIC_SUPABASE_ANON_KEY=${newKey}`);
        fs.writeFileSync(envFile, envContent);
        
        console.log('✅ Arquivo .env.local atualizado com sucesso!');
        console.log('   Reinicie o servidor Next.js para aplicar as alterações.');
      } catch (error) {
        console.error(`❌ Erro ao atualizar o arquivo .env.local: ${error.message}`);
      }
    } else {
      console.log('Arquivo .env.local não foi modificado.');
    }
  });
}
