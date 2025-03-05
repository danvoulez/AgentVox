// Script para obter a chave correta do projeto Supabase
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== OBTENÇÃO DA CHAVE CORRETA DO SUPABASE ===\n');

// Verificar o arquivo .env.local
const envFile = path.join(__dirname, '.env.local');
console.log(`Verificando arquivo .env.local em: ${envFile}`);

if (fs.existsSync(envFile)) {
  console.log('✅ Arquivo .env.local encontrado.');
  
  // Ler o conteúdo do arquivo
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  // Verificar se as variáveis do Supabase estão definidas
  const supabaseUrlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
  const supabaseKeyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
  
  const supabaseUrl = supabaseUrlMatch ? supabaseUrlMatch[1].trim() : null;
  const supabaseKey = supabaseKeyMatch ? supabaseKeyMatch[1].trim() : null;
  
  console.log(`\nURL do Supabase: ${supabaseUrl || 'Não definida'}`);
  console.log(`Chave atual do Supabase: ${supabaseKey ? `${supabaseKey.substring(0, 10)}...` : 'Não definida'}`);
  
  // Verificar se a URL contém o ID do projeto
  if (supabaseUrl) {
    const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    
    if (projectId && projectId[1]) {
      console.log(`\nID do projeto Supabase: ${projectId[1]}`);
      
      // Gerar a chave correta com base no ID do projeto
      console.log('\nGerando chave anônima correta para o projeto...');
      
      const correctKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IiR7cHJvamVjdElkWzFdfSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQwNjY1MDUwLCJleHAiOjIwNTYyNDEwNTB9.CHAVE_ASSINADA`;
      
      console.log('\n⚠️ IMPORTANTE: A chave gerada é apenas um modelo e não funcionará!');
      console.log('   Para obter a chave correta, siga as instruções abaixo:');
      console.log('\n1. Acesse o painel de controle do Supabase: https://app.supabase.com');
      console.log('2. Selecione o projeto "nwvxzlkhoobtotuixvpn"');
      console.log('3. Vá para "Project Settings" > "API"');
      console.log('4. Copie a chave "anon public" (NÃO a chave "service_role")');
      console.log('5. Atualize o arquivo .env.local com a chave correta');
      
      // Verificar se a CLI do Supabase está instalada
      try {
        execSync('supabase --version', { stdio: 'ignore' });
        console.log('\nAlternativamente, você pode usar a CLI do Supabase:');
        console.log('1. Execute o comando: supabase login');
        console.log('2. Execute o comando: supabase projects list');
        console.log('3. Identifique o projeto com o ID "nwvxzlkhoobtotuixvpn"');
        console.log('4. Execute o comando: supabase projects get-api-keys --project-ref nwvxzlkhoobtotuixvpn');
        console.log('5. Copie a chave "anon" e atualize o arquivo .env.local');
      } catch (error) {
        // CLI do Supabase não está instalada
      }
      
      console.log('\nDepois de atualizar o arquivo .env.local, reinicie o servidor Next.js:');
      console.log('1. Pressione Ctrl+C para parar o servidor atual (se estiver em execução)');
      console.log('2. Execute o comando: npm run dev');
    } else {
      console.log('\n❌ Não foi possível extrair o ID do projeto do URL do Supabase.');
    }
  } else {
    console.log('\n❌ URL do Supabase não definida no arquivo .env.local.');
  }
} else {
  console.log('❌ Arquivo .env.local não encontrado!');
  
  // Criar arquivo .env.local com modelo
  console.log('\nCriando arquivo .env.local com modelo...');
  
  const envModel = `# Configuração do Supabase para o projeto AgentVox
NEXT_PUBLIC_SUPABASE_URL=https://nwvxzlkhoobtotuixvpn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase

# OpenAI - API para embeddings e processamento de linguagem natural
OPENAI_API_KEY=sua-chave-da-api-openai
`;
  
  fs.writeFileSync(envFile, envModel);
  
  console.log('✅ Arquivo .env.local criado com modelo.');
  console.log('   Edite o arquivo e adicione as chaves corretas.');
}
