#!/usr/bin/env node

// Script para verificar se as variáveis de ambiente estão sendo carregadas corretamente
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env.local
console.log('Carregando variáveis de ambiente do arquivo .env.local...');
try {
  if (fs.existsSync('.env.local')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    for (const key in envConfig) {
      process.env[key] = envConfig[key];
    }
    console.log('Arquivo .env.local carregado com sucesso!');
  } else {
    console.error('Arquivo .env.local não encontrado!');
    process.exit(1);
  }
} catch (error) {
  console.error('Erro ao carregar o arquivo .env.local:', error);
  process.exit(1);
}

// Verificar variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n=== VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE ===');
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'Definida ✅' : 'Não definida ❌'}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? 'Definida ✅' : 'Não definida ❌'}`);

if (supabaseUrl) {
  console.log(`URL do Supabase: ${supabaseUrl}`);
}

if (supabaseKey) {
  console.log(`Chave do Supabase: ${supabaseKey.substring(0, 10)}...`);
}

// Testar conexão com o Supabase
if (supabaseUrl && supabaseKey) {
  console.log('\n=== TESTANDO CONEXÃO COM O SUPABASE ===');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Cliente Supabase criado com sucesso!');
    console.log('Tentando fazer uma consulta simples...');
    
    // Fazer uma consulta simples para testar a conexão
    supabase.from('profiles').select('count', { count: 'exact', head: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao testar conexão:', error.message);
          if (error.message.includes('Invalid API key')) {
            console.error('\nO erro "Invalid API key" indica que a chave de API está incorreta ou expirou.');
            console.error('Verifique se a chave anônima do Supabase está correta no arquivo .env.local.');
          }
        } else {
          console.log('Conexão com o Supabase estabelecida com sucesso! ✅');
        }
        process.exit(error ? 1 : 0);
      })
      .catch(err => {
        console.error('Erro inesperado ao testar conexão:', err);
        process.exit(1);
      });
  } catch (error) {
    console.error('Erro ao criar cliente Supabase:', error);
    process.exit(1);
  }
} else {
  console.error('\nVariáveis de ambiente não definidas. Não é possível testar a conexão com o Supabase.');
  process.exit(1);
}
