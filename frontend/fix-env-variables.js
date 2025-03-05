// Script para corrigir as variáveis de ambiente no arquivo .env.local
const fs = require('fs');
const path = require('path');

console.log('=== CORREÇÃO DAS VARIÁVEIS DE AMBIENTE ===\n');

// Caminho para o arquivo .env.local
const envFile = path.join(__dirname, '.env.local');

// Verificar se o arquivo existe
if (fs.existsSync(envFile)) {
  console.log(`Corrigindo arquivo .env.local em: ${envFile}`);
  
  // Ler o conteúdo atual
  const currentContent = fs.readFileSync(envFile, 'utf8');
  
  // Corrigir a variável SUPABASE_SERVICE_ROLE_KEY (remover espaço no início e % no final)
  let newContent = currentContent.replace(/ UPABASE_SERVICE_ROLE_KEY=(.+?)%/g, 'SUPABASE_SERVICE_ROLE_KEY=$1');
  
  // Escrever o novo conteúdo no arquivo
  fs.writeFileSync(envFile, newContent);
  
  console.log('✅ Arquivo .env.local corrigido com sucesso!');
  console.log('\nConteúdo atualizado:');
  console.log('------------------------');
  console.log(newContent);
  console.log('------------------------');
  
  console.log('\n⚠️ IMPORTANTE: Reinicie o servidor Next.js para aplicar as alterações!');
  
} else {
  console.log(`❌ Arquivo .env.local não encontrado em: ${envFile}`);
}
