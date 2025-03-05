// Script para extrair a chave do Supabase da imagem
const fs = require('fs');
const path = require('path');

console.log('=== EXTRAÇÃO DA CHAVE DO SUPABASE DA IMAGEM ===\n');

// Chave do Supabase da imagem (exatamente como aparece)
const reactAppUrl = 'REACT_APP_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co';
const reactAppKey = 'REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.eyJwYzNKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW01M2RuaDZiR3RvYjI5aWRHOTBkV2w0ZG5CdUlpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTkRBMk5qVXdOVEFzSW1WNGNDSTZNakExTmpJME1UQTFNSDA9Lk9CeWJSdmpOeS0tQkhZUnZqTlgtLUJIWVJ2ak55LS1CSFlSdmpOeS0tQkhZUnZqTnk=';

// Extrair valores
const supabaseUrl = reactAppUrl.split('=')[1];
const supabaseKey = reactAppKey.split('=')[1];

console.log(`URL do Supabase: ${supabaseUrl}`);
console.log(`Chave do Supabase: ${supabaseKey}`);

// Criar arquivo com os valores extraídos
const extractedFile = path.join(__dirname, 'extracted-key.txt');
fs.writeFileSync(extractedFile, `URL: ${supabaseUrl}\nChave: ${supabaseKey}`);

console.log(`\n✅ Valores extraídos salvos em: ${extractedFile}`);

// Atualizar arquivo .env.local
const envFile = path.join(__dirname, '.env.local');
if (fs.existsSync(envFile)) {
  console.log(`\nAtualizando arquivo .env.local em: ${envFile}`);
  
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
} else {
  console.log(`\n❌ Arquivo .env.local não encontrado em: ${envFile}`);
}
