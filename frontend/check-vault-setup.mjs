#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
let envLoaded = false;

// Tentar carregar de .env.local primeiro
if (fs.existsSync(path.resolve(process.cwd(), '.env.local'))) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
  envLoaded = true;
  console.log('Carregando variáveis de ambiente de .env.local');
} 
// Tentar .env se .env.local não existir
else if (fs.existsSync(path.resolve(process.cwd(), '.env'))) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  envLoaded = true;
  console.log('Carregando variáveis de ambiente de .env');
}

if (!envLoaded) {
  console.error('❌ Arquivo .env.local ou .env não encontrado!');
  process.exit(1);
}

// Verificar variáveis de ambiente necessárias
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Variável de ambiente NEXT_PUBLIC_SUPABASE_URL não definida!');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Variável de ambiente SUPABASE_SERVICE_ROLE_KEY não definida!');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente carregadas com sucesso');

// Inicializar cliente Supabase com a chave de serviço
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('Conectando ao Supabase...');

// Verificar se a extensão vault está habilitada
async function checkVaultExtension() {
  try {
    const { data, error } = await supabase
      .from('pg_extension')
      .select('extname, extversion')
      .eq('extname', 'vault');

    if (error) {
      console.error('❌ Erro ao verificar extensão vault:', error.message);
      return false;
    }

    if (!data || data.length === 0) {
      console.error('❌ Extensão vault não está instalada no banco de dados');
      console.log('Dica: Habilite a extensão vault no painel do Supabase em Database > Extensions');
      return false;
    }

    console.log(`✅ Extensão vault encontrada (versão: ${data[0].extversion})`);
    return true;
  } catch (err) {
    console.error('❌ Erro ao verificar extensão vault:', err.message);
    return false;
  }
}

// Verificar se temos acesso às tabelas do vault
async function checkVaultAccess() {
  try {
    // Tentar acessar a tabela de chaves de criptografia
    const { data: keysData, error: keysError } = await supabase
      .from('vault.encryption_keys')
      .select('count(*)')
      .limit(1);

    if (keysError) {
      console.error('❌ Erro ao acessar vault.encryption_keys:', keysError.message);
      console.log('Dica: Verifique se você concedeu as permissões necessárias à função service_role');
      return false;
    }

    // Tentar acessar a tabela de segredos
    const { data: secretsData, error: secretsError } = await supabase
      .from('vault.secrets')
      .select('count(*)')
      .limit(1);

    if (secretsError) {
      console.error('❌ Erro ao acessar vault.secrets:', secretsError.message);
      console.log('Dica: Verifique se você concedeu as permissões necessárias à função service_role');
      return false;
    }

    console.log('✅ Acesso às tabelas do vault confirmado');
    return true;
  } catch (err) {
    console.error('❌ Erro ao verificar acesso ao vault:', err.message);
    return false;
  }
}

// Verificar se podemos criar e recuperar um segredo
async function testVaultOperations() {
  try {
    const testKeyName = 'test-key-' + Date.now();
    const testSecretName = 'test-secret-' + Date.now();
    const testSecretValue = 'test-value-' + Date.now();

    console.log('Criando chave de teste...');
    
    // Criar uma chave de teste
    const { data: keyData, error: keyError } = await supabase.rpc('vault.create_key', {
      key_name: testKeyName,
      key_description: 'Chave de teste criada pelo script de verificação',
    });

    if (keyError) {
      console.error('❌ Erro ao criar chave de teste:', keyError.message);
      return false;
    }

    console.log(`✅ Chave de teste criada com sucesso: ${testKeyName}`);

    // Criar um segredo de teste
    console.log('Criando segredo de teste...');
    
    const { data: secretData, error: secretError } = await supabase.rpc('vault.create_secret', {
      secret_name: testSecretName,
      secret_value: testSecretValue,
      secret_description: 'Segredo de teste criado pelo script de verificação',
    });

    if (secretError) {
      console.error('❌ Erro ao criar segredo de teste:', secretError.message);
      return false;
    }

    console.log(`✅ Segredo de teste criado com sucesso: ${testSecretName}`);

    // Recuperar o segredo
    console.log('Recuperando segredo de teste...');
    
    const { data: retrievedData, error: retrievedError } = await supabase
      .from('vault.decrypted_secrets')
      .select('decrypted_secret')
      .eq('name', testSecretName)
      .single();

    if (retrievedError) {
      console.error('❌ Erro ao recuperar segredo de teste:', retrievedError.message);
      return false;
    }

    if (retrievedData.decrypted_secret !== testSecretValue) {
      console.error('❌ O valor recuperado não corresponde ao valor armazenado!');
      return false;
    }

    console.log(`✅ Segredo de teste recuperado com sucesso: ${retrievedData.decrypted_secret}`);

    // Limpar dados de teste
    console.log('Limpando dados de teste...');
    
    // Obter o ID do segredo
    const { data: secretIdData } = await supabase
      .from('vault.secrets')
      .select('id')
      .eq('name', testSecretName)
      .single();

    if (secretIdData) {
      await supabase
        .from('vault.secrets')
        .delete()
        .eq('id', secretIdData.id);
    }

    console.log('✅ Dados de teste limpos com sucesso');
    
    return true;
  } catch (err) {
    console.error('❌ Erro ao testar operações do vault:', err.message);
    return false;
  }
}

// Executar verificações
async function runChecks() {
  console.log('🔍 Verificando configuração do Supabase Vault...');
  
  const extensionOk = await checkVaultExtension();
  if (!extensionOk) return;
  
  const accessOk = await checkVaultAccess();
  if (!accessOk) return;
  
  const operationsOk = await testVaultOperations();
  if (!operationsOk) return;
  
  console.log('\n✅✅✅ Supabase Vault está configurado corretamente e pronto para uso! ✅✅✅');
  console.log('\nVocê pode começar a usar o Vault para armazenar segredos de forma segura.');
  console.log('Consulte o arquivo SUPABASE_FEATURES.md para exemplos de uso.');
}

runChecks().catch(err => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});
