// Script para verificar se as variáveis de ambiente estão sendo carregadas corretamente pelo Next.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE DO NEXT.JS ===\n');

// Verificar o arquivo .env.local
const envFile = path.join(__dirname, '.env.local');
console.log(`Verificando arquivo .env.local em: ${envFile}`);

if (fs.existsSync(envFile)) {
  console.log('✅ Arquivo .env.local encontrado.');
  
  // Ler o conteúdo do arquivo
  const envContent = fs.readFileSync(envFile, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));
  
  console.log(`\nConteúdo do arquivo .env.local (${lines.length} variáveis):`);
  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && key.trim()) {
      if (key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD')) {
        console.log(`${key.trim()} = [VALOR OCULTO]`);
      } else {
        console.log(`${key.trim()} = ${value || '[VAZIO]'}`);
      }
    }
  });
  
  // Verificar se as variáveis do Supabase estão definidas
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('\n✅ Variáveis do Supabase encontradas no arquivo .env.local.');
  } else {
    console.log('\n❌ Variáveis do Supabase não encontradas ou incompletas no arquivo .env.local.');
    if (!hasSupabaseUrl) console.log('   - NEXT_PUBLIC_SUPABASE_URL não encontrada');
    if (!hasSupabaseKey) console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrada');
  }
} else {
  console.log('❌ Arquivo .env.local não encontrado!');
}

// Verificar se o Next.js está carregando as variáveis de ambiente
console.log('\nVerificando se o Next.js está carregando as variáveis de ambiente...');

try {
  // Criar um arquivo temporário para testar
  const testFile = path.join(__dirname, 'pages', '__env-test.js');
  
  fs.writeFileSync(testFile, `
export default function EnvTest() {
  return (
    <div>
      <h1>Teste de Variáveis de Ambiente</h1>
      <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não definida'}</p>
      <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Definida (oculta)' : 'Não definida'}</p>
    </div>
  );
}
  `);
  
  console.log('✅ Arquivo de teste criado em pages/__env-test.js');
  console.log('   Acesse http://localhost:3000/__env-test para verificar se as variáveis estão sendo carregadas.');
  
  // Verificar se o Next.js está em execução
  try {
    execSync('ps aux | grep "next dev" | grep -v grep');
    console.log('✅ Servidor Next.js está em execução.');
  } catch (error) {
    console.log('❌ Servidor Next.js não está em execução.');
    console.log('   Execute "npm run dev" para iniciar o servidor.');
  }
  
  console.log('\nRecomendações:');
  console.log('1. Verifique se as variáveis de ambiente estão definidas corretamente no arquivo .env.local');
  console.log('2. Reinicie o servidor Next.js após fazer alterações no arquivo .env.local');
  console.log('3. Acesse http://localhost:3000/__env-test para verificar se as variáveis estão sendo carregadas');
  console.log('4. Se as variáveis não estiverem sendo carregadas, tente limpar o cache do Next.js:');
  console.log('   - rm -rf .next');
  console.log('   - npm run dev');
} catch (error) {
  console.error('Erro ao criar arquivo de teste:', error);
}
