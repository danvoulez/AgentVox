import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface RlsPolicy {
  table: string;
  name: string;
  definition: string;
  enabled: boolean;
}

interface TableInfo {
  name: string;
  rls_enabled: boolean;
  policies: RlsPolicy[];
}

serve(async (req) => {
  // Habilitar CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  try {
    // Obter as credenciais do ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Verificar se as variáveis de ambiente estão configuradas
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Variáveis de ambiente do Supabase não configuradas corretamente',
          details: {
            urlConfigured: !!supabaseUrl,
            serviceKeyConfigured: !!supabaseServiceKey,
            errorType: 'config'
          }
        }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }
    
    // Criar cliente Supabase com a chave de serviço para ter acesso administrativo
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Lista de tabelas para verificar
    const tablesToCheck = [
      'user_roles',
      'user_profiles',
      'agents',
      'conversations',
      'messages',
      'memories',
      'voice_settings'
    ];
    
    const results: Record<string, TableInfo> = {};
    
    // Verificar cada tabela
    for (const tableName of tablesToCheck) {
      try {
        // Verificar se a tabela existe
        const { data: tableExists, error: tableError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', tableName)
          .maybeSingle();
        
        if (tableError || !tableExists) {
          results[tableName] = {
            name: tableName,
            rls_enabled: false,
            policies: []
          };
          continue;
        }
        
        // Verificar se RLS está habilitado
        const { data: rlsStatus, error: rlsError } = await supabase
          .rpc('check_rls_enabled', { table_name: tableName })
          .single();
        
        if (rlsError) {
          // Se a função RPC não existir, tentar uma consulta direta
          const { data: pgTables, error: pgError } = await supabase
            .from('pg_tables')
            .select('rowsecurity')
            .eq('schemaname', 'public')
            .eq('tablename', tableName)
            .maybeSingle();
          
          results[tableName] = {
            name: tableName,
            rls_enabled: pgTables?.rowsecurity || false,
            policies: []
          };
        } else {
          results[tableName] = {
            name: tableName,
            rls_enabled: rlsStatus?.rls_enabled || false,
            policies: []
          };
        }
        
        // Obter políticas RLS
        const { data: policies, error: policiesError } = await supabase
          .from('pg_policies')
          .select('*')
          .eq('schemaname', 'public')
          .eq('tablename', tableName);
        
        if (!policiesError && policies) {
          results[tableName].policies = policies.map(policy => ({
            table: tableName,
            name: policy.policyname,
            definition: policy.cmd + ' ' + policy.qual,
            enabled: true
          }));
        }
      } catch (err) {
        console.error(`Erro ao verificar tabela ${tableName}:`, err);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        status: 'success', 
        message: 'Verificação de RLS concluída',
        tables: results
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  } catch (err) {
    console.error('Erro na Edge Function check-rls:', err);
    
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: `Exceção ao verificar políticas RLS: ${err.message}`,
        details: {
          errorType: 'unknown',
          errorMessage: err.message
        }
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  }
});
