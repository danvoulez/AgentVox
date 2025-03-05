// Script simples para atualizar o arquivo .env.local com a chave do Supabase
const fs = require('fs');
const path = require('path');

console.log('=== ATUALIZAÇÃO SIMPLES DO ARQUIVO .ENV.LOCAL ===\n');

// Chave do Supabase da imagem
const supabaseUrl = 'https://nwvxzlkhoobtotuixvpn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.OBybRvjNy--BHYRvjNX--BHYRvjNy--BHYRvjNy--BHYRvjNy';

console.log(`URL do Supabase: ${supabaseUrl}`);
console.log(`Chave do Supabase: ${supabaseKey.substring(0, 10)}...\n`);

// Atualizar o arquivo .env.local
const envFile = path.join(__dirname, '.env.local');
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
    newContent = newContent.replace(/NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/, `NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}`);
  } else {
    newContent += `\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}`;
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
