// Script para atualizar a chave do Supabase no arquivo .env.local usando a chave da imagem
const fs = require('fs');
const path = require('path');

console.log('=== ATUALIZAÇÃO DA CHAVE DO SUPABASE DA IMAGEM ===\n');

// Caminho para o arquivo .env.local
const envFile = path.join(__dirname, '.env.local');

// Chave do Supabase da imagem
const supabaseUrl = 'https://nwvxzlkhoobtotuixvpn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0';

// Chave do React da imagem
const reactKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.eyJwYzNKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW01M2RuaDZiR3RvYjI5aWRHOTBkV2w0ZG5CdUlpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTkRBMk5qVXdOVEFzSW1WNGNDSTZNakExTmpJME1UQTFNSDA9Lk9CeWJSdmpOeS0tQkhZUnZqTlgtLUJIWVJ2ak55LS1CSFlSdmpOeS0tQkhZUnZqTnk=';

// Verificar se o arquivo existe
if (fs.existsSync(envFile)) {
  console.log(`Arquivo .env.local encontrado em: ${envFile}`);
  
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
  
  // Criar arquivo com a chave do React
  const reactEnvFile = path.join(__dirname, '.env.local.react');
  fs.writeFileSync(reactEnvFile, `REACT_APP_SUPABASE_URL=${supabaseUrl}\nREACT_APP_SUPABASE_ANON_KEY=${reactKey}`);
  
  console.log('✅ Arquivo .env.local.react criado com a chave do React.');
  
  // Criar arquivo com a chave que aparece na imagem
  const imageKeyFile = path.join(__dirname, 'supabase-key-from-image.txt');
  fs.writeFileSync(imageKeyFile, `URL: ${supabaseUrl}\n\nChave da imagem: ${reactKey}`);
  
  console.log('✅ Arquivo supabase-key-from-image.txt criado com a chave da imagem.');
  
  console.log('\n⚠️ IMPORTANTE: Reinicie o servidor Next.js para aplicar as alterações!');
  console.log('1. Pressione Ctrl+C para parar o servidor atual (se estiver em execução)');
  console.log('2. Execute o comando: npm run dev');
} else {
  console.log(`❌ Arquivo .env.local não encontrado em: ${envFile}`);
}
