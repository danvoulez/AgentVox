// Script para verificar o status do Supabase e gerar um relatório completo
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function generateSupabaseReport() {
  console.log('=== RELATÓRIO DE STATUS DO SUPABASE ===\n');
  
  // Verificar variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('1. VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE:');
  console.log(`   URL do Supabase: ${supabaseUrl || 'Não definido'}`);
  console.log(`   Chave do Supabase: ${supabaseKey ? 'Definida (oculta)' : 'Não definida'}`);
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('\n❌ ERRO: Variáveis de ambiente não definidas ou incompletas.');
    console.log('   Verifique se o arquivo .env.local existe e contém as variáveis necessárias.');
    return;
  }
  
  console.log('\n✅ Variáveis de ambiente definidas.');
  
  // Verificar estrutura do token JWT
  try {
    console.log('\n2. VERIFICAÇÃO DO TOKEN JWT:');
    const parts = supabaseKey.split('.');
    
    if (parts.length !== 3) {
      console.log('❌ ERRO: Token JWT inválido (não tem 3 partes).');
      return;
    }
    
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    console.log(`   Algoritmo: ${header.alg}`);
    console.log(`   Tipo: ${header.typ}`);
    console.log(`   Emissor: ${payload.iss}`);
    console.log(`   Referência: ${payload.ref}`);
    console.log(`   Função: ${payload.role}`);
    
    const expirationDate = new Date(payload.exp * 1000);
    const now = new Date();
    
    console.log(`   Data de expiração: ${expirationDate.toISOString()}`);
    console.log(`   Data atual: ${now.toISOString()}`);
    
    if (now > expirationDate) {
      console.log('❌ ERRO: Token JWT expirado.');
      return;
    }
    
    console.log('\n✅ Token JWT válido e não expirado.');
  } catch (error) {
    console.log(`\n❌ ERRO ao analisar o token JWT: ${error.message}`);
    return;
  }
  
  // Testar conexão com o Supabase
  console.log('\n3. TESTE DE CONEXÃO COM O SUPABASE:');
  
  try {
    console.log('   Criando cliente Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('   Tentando fazer uma consulta simples...');
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('\n✅ Conexão com Supabase estabelecida com sucesso!');
        console.log('   Nota: Tabela _test_connection não existe, mas isso é esperado.');
      } else {
        throw error;
      }
    } else {
      console.log('\n✅ Conexão com Supabase estabelecida com sucesso!');
      console.log(`   Dados retornados: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.log(`\n❌ ERRO ao conectar com o Supabase: ${error.message}`);
    
    if (error.message.includes('fetch failed')) {
      console.log('   Possível problema de rede. Verifique sua conexão com a internet.');
    } else if (error.message.includes('invalid API key')) {
      console.log('   Chave de API inválida. Verifique se NEXT_PUBLIC_SUPABASE_ANON_KEY está correta.');
    } else if (error.message.includes('invalid URL')) {
      console.log('   URL inválida. Verifique se NEXT_PUBLIC_SUPABASE_URL está correta.');
    }
    
    return;
  }
  
  // Verificar estrutura do projeto Next.js
  console.log('\n4. VERIFICAÇÃO DA ESTRUTURA DO PROJETO NEXT.JS:');
  
  const frontendDir = path.resolve(__dirname);
  const srcDir = path.join(frontendDir, 'src');
  const pagesDir = path.join(frontendDir, 'pages');
  const srcPagesDir = path.join(srcDir, 'pages');
  
  console.log(`   Diretório do frontend: ${frontendDir}`);
  console.log(`   Diretório src existe: ${fs.existsSync(srcDir)}`);
  console.log(`   Diretório pages existe: ${fs.existsSync(pagesDir)}`);
  console.log(`   Diretório src/pages existe: ${fs.existsSync(srcPagesDir)}`);
  
  // Verificar arquivos de configuração
  console.log('\n5. VERIFICAÇÃO DE ARQUIVOS DE CONFIGURAÇÃO:');
  
  const envLocalFile = path.join(frontendDir, '.env.local');
  const nextConfigFile = path.join(frontendDir, 'next.config.js');
  const packageJsonFile = path.join(frontendDir, 'package.json');
  
  console.log(`   .env.local existe: ${fs.existsSync(envLocalFile)}`);
  console.log(`   next.config.js existe: ${fs.existsSync(nextConfigFile)}`);
  console.log(`   package.json existe: ${fs.existsSync(packageJsonFile)}`);
  
  if (fs.existsSync(packageJsonFile)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));
      console.log(`   Versão do Next.js: ${packageJson.dependencies.next || 'Não encontrada'}`);
      console.log(`   Versão do Supabase: ${packageJson.dependencies['@supabase/supabase-js'] || 'Não encontrada'}`);
    } catch (error) {
      console.log(`   Erro ao ler package.json: ${error.message}`);
    }
  }
  
  // Resumo e recomendações
  console.log('\n=== RESUMO E RECOMENDAÇÕES ===');
  console.log('1. As variáveis de ambiente estão configuradas corretamente.');
  console.log('2. O token JWT é válido e não está expirado.');
  console.log('3. A conexão com o Supabase foi estabelecida com sucesso.');
  console.log('4. A estrutura do projeto Next.js foi verificada.');
  console.log('5. Os arquivos de configuração foram verificados.');
  
  console.log('\nRecomendações:');
  console.log('1. Use a página de teste em http://localhost:3000/login-test para testar o login.');
  console.log('2. Verifique se o usuário e senha que você está usando estão cadastrados no Supabase.');
  console.log('3. Se ainda houver problemas, verifique os logs do servidor Next.js para mais detalhes.');
}

generateSupabaseReport().catch(console.error);
