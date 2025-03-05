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
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ Variável de ambiente NEXT_PUBLIC_SUPABASE_URL não definida!');
  process.exit(1);
}

if (!supabaseAnonKey) {
  console.error('❌ Variável de ambiente NEXT_PUBLIC_SUPABASE_ANON_KEY não definida!');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente carregadas com sucesso');

// Inicializar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Conectando ao Supabase...');

// Verificar se o Realtime está habilitado
async function checkRealtimeConnection() {
  return new Promise((resolve) => {
    console.log('Testando conexão Realtime...');
    
    const channel = supabase.channel('test-connection');
    
    // Definir um timeout para o caso de não conseguir conectar
    const timeout = setTimeout(() => {
      console.error('❌ Timeout ao tentar conectar ao Realtime');
      resolve(false);
    }, 10000);
    
    channel
      .on('system', { event: 'connected' }, () => {
        clearTimeout(timeout);
        console.log('✅ Conexão Realtime estabelecida com sucesso');
        
        // Limpar o canal após o teste
        supabase.removeChannel(channel);
        resolve(true);
      })
      .subscribe((status) => {
        console.log(`Status da inscrição: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Canal inscrito com sucesso');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          clearTimeout(timeout);
          console.error(`❌ Erro na inscrição do canal: ${status}`);
          resolve(false);
        }
      });
  });
}

// Testar funcionalidade de Broadcast
async function testBroadcast() {
  return new Promise((resolve) => {
    console.log('Testando funcionalidade de Broadcast...');
    
    const channelName = 'test-broadcast-' + Date.now();
    const testMessage = { text: 'Hello, Realtime!', timestamp: new Date().toISOString() };
    let messageReceived = false;
    
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
      },
    });
    
    // Definir um timeout para o caso de não receber a mensagem
    const timeout = setTimeout(() => {
      supabase.removeChannel(channel);
      if (!messageReceived) {
        console.error('❌ Timeout ao testar Broadcast - mensagem não recebida');
        resolve(false);
      }
    }, 10000);
    
    channel
      .on('broadcast', { event: 'test-event' }, (payload) => {
        console.log('Mensagem recebida:', payload);
        
        if (payload.payload.text === testMessage.text) {
          messageReceived = true;
          clearTimeout(timeout);
          console.log('✅ Funcionalidade de Broadcast testada com sucesso');
          
          // Limpar o canal após o teste
          supabase.removeChannel(channel);
          resolve(true);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Enviar mensagem de teste
          console.log('Enviando mensagem de teste...');
          channel.send({
            type: 'broadcast',
            event: 'test-event',
            payload: testMessage,
          });
        }
      });
  });
}

// Testar funcionalidade de Presence
async function testPresence() {
  return new Promise((resolve) => {
    console.log('Testando funcionalidade de Presence...');
    
    const channelName = 'test-presence-' + Date.now();
    const userState = { user_id: 'test-user', status: 'online', timestamp: Date.now() };
    let syncReceived = false;
    
    const channel = supabase.channel(channelName);
    
    // Definir um timeout para o caso de não receber o evento de sincronização
    const timeout = setTimeout(() => {
      supabase.removeChannel(channel);
      if (!syncReceived) {
        console.error('❌ Timeout ao testar Presence - evento sync não recebido');
        resolve(false);
      }
    }, 10000);
    
    channel
      .on('presence', { event: 'sync' }, () => {
        console.log('Evento sync recebido');
        const state = channel.presenceState();
        console.log('Estado de presence:', state);
        
        syncReceived = true;
        clearTimeout(timeout);
        console.log('✅ Funcionalidade de Presence testada com sucesso');
        
        // Limpar o canal após o teste
        channel.untrack().then(() => {
          supabase.removeChannel(channel);
          resolve(true);
        });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Rastrear estado do usuário
          console.log('Rastreando estado do usuário...');
          channel.track(userState);
        }
      });
  });
}

// Verificar se há tabelas configuradas para Postgres Changes
async function checkPostgresChangesConfig() {
  try {
    console.log('Verificando configuração de Postgres Changes...');
    
    // Verificar se há publicações para o Realtime
    const { data, error } = await supabase
      .from('pg_publication')
      .select('pubname')
      .eq('pubname', 'supabase_realtime');
    
    if (error) {
      console.error('❌ Erro ao verificar publicações:', error.message);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.error('❌ Publicação supabase_realtime não encontrada');
      console.log('Dica: Verifique se o Realtime está habilitado no painel do Supabase em Database > Replication');
      return false;
    }
    
    console.log('✅ Publicação supabase_realtime encontrada');
    
    // Verificar tabelas incluídas na publicação
    const { data: tablesData, error: tablesError } = await supabase
      .from('pg_publication_tables')
      .select('tablename')
      .eq('pubname', 'supabase_realtime');
    
    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas na publicação:', tablesError.message);
      return false;
    }
    
    if (!tablesData || tablesData.length === 0) {
      console.warn('⚠️ Nenhuma tabela encontrada na publicação supabase_realtime');
      console.log('Dica: Adicione tabelas à publicação no painel do Supabase em Database > Replication');
      return true; // Não é um erro crítico
    }
    
    console.log('✅ Tabelas encontradas na publicação supabase_realtime:');
    tablesData.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.tablename}`);
    });
    
    return true;
  } catch (err) {
    console.error('❌ Erro ao verificar configuração de Postgres Changes:', err.message);
    return false;
  }
}

// Executar verificações
async function runChecks() {
  console.log('🔍 Verificando configuração do Supabase Realtime...');
  
  const connectionOk = await checkRealtimeConnection();
  if (!connectionOk) {
    console.error('❌ Falha na conexão com o Realtime. Verifique a URL e a chave anônima do Supabase.');
    return;
  }
  
  const broadcastOk = await testBroadcast();
  if (!broadcastOk) {
    console.error('❌ Falha no teste de Broadcast.');
    return;
  }
  
  const presenceOk = await testPresence();
  if (!presenceOk) {
    console.error('❌ Falha no teste de Presence.');
    return;
  }
  
  const postgresChangesOk = await checkPostgresChangesConfig();
  if (!postgresChangesOk) {
    console.error('❌ Falha na verificação da configuração de Postgres Changes.');
    return;
  }
  
  console.log('\n✅✅✅ Supabase Realtime está configurado corretamente e pronto para uso! ✅✅✅');
  console.log('\nVocê pode começar a usar o Realtime para implementar funcionalidades em tempo real.');
  console.log('Consulte o arquivo SUPABASE_FEATURES.md para exemplos de uso.');
}

runChecks().catch(err => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});
