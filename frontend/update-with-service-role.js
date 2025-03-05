// Script para atualizar o arquivo .env.local com a service role key
const fs = require('fs');
const path = require('path');

console.log('=== ATUALIZAÇÃO COM A SERVICE ROLE KEY ===\n');

// Caminho para o arquivo .env.local
const envFile = path.join(__dirname, '.env.local');

// Service Role Key do Supabase
const supabaseUrl = 'https://nwvxzlkhoobtotuixvpn.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDY2NTA1MCwiZXhwIjoyMDU2MjQxMDUwfQ.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ';

console.log(`URL do Supabase: ${supabaseUrl}`);
console.log(`Service Role Key: ${serviceRoleKey.substring(0, 10)}...\n`);

// Verificar se o arquivo existe
if (fs.existsSync(envFile)) {
  console.log(`Atualizando arquivo .env.local em: ${envFile}`);
  
  // Ler o conteúdo atual
  const currentContent = fs.readFileSync(envFile, 'utf8');
  
  // Atualizar o conteúdo com a nova chave
  let newContent = currentContent;
  
  // Atualizar URL do Supabase se necessário
  if (newContent.includes('NEXT_PUBLIC_SUPABASE_URL=')) {
    newContent = newContent.replace(/NEXT_PUBLIC_SUPABASE_URL=.*/, `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`);
  } else {
    newContent += `\nNEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`;
  }
  
  // Atualizar chave do Supabase
  if (newContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    newContent = newContent.replace(/NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/, `NEXT_PUBLIC_SUPABASE_ANON_KEY=${serviceRoleKey}`);
  } else {
    newContent += `\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${serviceRoleKey}`;
  }
  
  // Adicionar a service role key como uma variável separada
  if (newContent.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
    newContent = newContent.replace(/SUPABASE_SERVICE_ROLE_KEY=.*/, `SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`);
  } else {
    newContent += `\nSUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`;
  }
  
  // Escrever o novo conteúdo no arquivo
  fs.writeFileSync(envFile, newContent);
  
  console.log('✅ Arquivo .env.local atualizado com sucesso!');
  console.log('\nConteúdo atualizado:');
  console.log('------------------------');
  console.log(newContent);
  console.log('------------------------');
  
  console.log('\n⚠️ IMPORTANTE: Reinicie o servidor Next.js para aplicar as alterações!');
  
} else {
  console.log(`❌ Arquivo .env.local não encontrado em: ${envFile}`);
}
