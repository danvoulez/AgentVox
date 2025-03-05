// Script para atualizar a chave do Supabase no arquivo .env.local
const fs = require('fs');
const path = require('path');

console.log('=== ATUALIZAÇÃO DA CHAVE DO SUPABASE ===\n');

// Caminho para o arquivo .env.local
const envFile = path.join(__dirname, '.env.local');

// Nova chave do Supabase (obtida do painel do Supabase)
const newSupabaseUrl = 'https://nwvxzlkhoobtotuixvpn.supabase.co';
const newSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnh6bGtob29idG90dWl4dnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjUwNTAsImV4cCI6MjA1NjI0MTA1MH0.sFDXcJDJnJiSRsqQl0ygkRuKBj6vECCVbKs5S0JVxKQ';

// Verificar se o arquivo existe
if (fs.existsSync(envFile)) {
  console.log(`Arquivo .env.local encontrado em: ${envFile}`);
  
  // Ler o conteúdo atual
  const currentContent = fs.readFileSync(envFile, 'utf8');
  console.log('Conteúdo atual do arquivo:');
  console.log('------------------------');
  console.log(currentContent);
  console.log('------------------------\n');
  
  // Atualizar o conteúdo com a nova chave
  let newContent = currentContent;
  
  // Atualizar URL do Supabase se necessário
  if (newContent.includes('NEXT_PUBLIC_SUPABASE_URL=')) {
    newContent = newContent.replace(/NEXT_PUBLIC_SUPABASE_URL=.*/, `NEXT_PUBLIC_SUPABASE_URL=${newSupabaseUrl}`);
  } else {
    newContent += `\nNEXT_PUBLIC_SUPABASE_URL=${newSupabaseUrl}`;
  }
  
  // Atualizar chave do Supabase
  if (newContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    newContent = newContent.replace(/NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/, `NEXT_PUBLIC_SUPABASE_ANON_KEY=${newSupabaseKey}`);
  } else {
    newContent += `\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${newSupabaseKey}`;
  }
  
  // Escrever o novo conteúdo no arquivo
  fs.writeFileSync(envFile, newContent);
  
  console.log('✅ Arquivo .env.local atualizado com sucesso!');
  console.log('Novo conteúdo do arquivo:');
  console.log('------------------------');
  console.log(newContent);
  console.log('------------------------\n');
  
  console.log('⚠️ IMPORTANTE: Reinicie o servidor Next.js para aplicar as alterações!');
  console.log('1. Pressione Ctrl+C para parar o servidor atual (se estiver em execução)');
  console.log('2. Execute o comando: npm run dev');
} else {
  console.log(`❌ Arquivo .env.local não encontrado em: ${envFile}`);
  
  // Criar o arquivo com as variáveis necessárias
  const newContent = `# Configuração do Supabase para o projeto AgentVox
NEXT_PUBLIC_SUPABASE_URL=${newSupabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${newSupabaseKey}

# OpenAI - API para embeddings e processamento de linguagem natural
OPENAI_API_KEY=sua-chave-da-api-openai
`;
  
  fs.writeFileSync(envFile, newContent);
  
  console.log('✅ Arquivo .env.local criado com sucesso!');
  console.log('Conteúdo do arquivo:');
  console.log('------------------------');
  console.log(newContent);
  console.log('------------------------\n');
  
  console.log('⚠️ IMPORTANTE: Inicie o servidor Next.js para aplicar as alterações!');
  console.log('Execute o comando: npm run dev');
}
