import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Definições de políticas RLS para cada tabela
const rlsPolicies = {
  user_roles: [
    {
      name: "Users can view own roles",
      definition: "FOR SELECT USING (auth.uid() = user_id)"
    },
    {
      name: "Admins can manage all roles",
      definition: "FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))"
    }
  ],
  user_profiles: [
    {
      name: "Users can view own profiles",
      definition: "FOR SELECT USING (auth.uid() = user_id)"
    },
    {
      name: "Users can update own profiles",
      definition: "FOR UPDATE USING (auth.uid() = user_id)"
    },
    {
      name: "Admins can view all profiles",
      definition: "FOR SELECT USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))"
    }
  ],
  agents: [
    {
      name: "Users can view own agents",
      definition: "FOR SELECT USING (auth.uid() = owner_id)"
    },
    {
      name: "Users can manage own agents",
      definition: "FOR ALL USING (auth.uid() = owner_id)"
    },
    {
      name: "Users can view public agents",
      definition: "FOR SELECT USING (is_public = true)"
    }
  ],
  conversations: [
    {
      name: "Users can view own conversations",
      definition: "FOR SELECT USING (auth.uid() = user_id)"
    },
    {
      name: "Users can manage own conversations",
      definition: "FOR ALL USING (auth.uid() = user_id)"
    }
  ],
  messages: [
    {
      name: "Users can view messages from own conversations",
      definition: "FOR SELECT USING (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()))"
    },
    {
      name: "Users can add messages to own conversations",
      definition: "FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()))"
    }
  ],
  memories: [
    {
      name: "Users can view own memories",
      definition: "FOR SELECT USING (auth.uid() = user_id)"
    },
    {
      name: "Users can manage own memories",
      definition: "FOR ALL USING (auth.uid() = user_id)"
    }
  ],
  voice_settings: [
    {
      name: "Users can view own voice settings",
      definition: "FOR SELECT USING (auth.uid() = user_id)"
    },
    {
      name: "Users can manage own voice settings",
      definition: "FOR ALL USING (auth.uid() = user_id)"
    }
  ]
};

serve(async (req) => {
  // Habilitar CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // Verificar se é uma requisição POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: 'Método não permitido. Use POST para esta endpoint.'
      }),
      { 
        status: 405, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
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
    
    // Obter parâmetros da requisição
    const { tables } = await req.json();
    
    // Se não foram especificadas tabelas, usar todas
    const tablesToProcess = tables && Array.isArray(tables) && tables.length > 0 
      ? tables 
      : Object.keys(rlsPolicies);
    
    const results: Record<string, any> = {};
    
    // Processar cada tabela
    for (const tableName of tablesToProcess) {
      if (!rlsPolicies[tableName]) {
        results[tableName] = {
          status: 'error',
          message: `Tabela ${tableName} não tem políticas RLS definidas`
        };
        continue;
      }
      
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
            status: 'error',
            message: `Tabela ${tableName} não existe`
          };
          continue;
        }
        
        // Habilitar RLS na tabela
        const { error: enableRlsError } = await supabase.rpc('execute_sql', {
          sql: `ALTER TABLE "public"."${tableName}" ENABLE ROW LEVEL SECURITY;`
        });
        
        if (enableRlsError) {
          results[tableName] = {
            status: 'error',
            message: `Erro ao habilitar RLS para ${tableName}: ${enableRlsError.message}`
          };
          continue;
        }
        
        // Aplicar políticas RLS
        const policyResults = [];
        
        for (const policy of rlsPolicies[tableName]) {
          // Remover política existente, se houver
          await supabase.rpc('execute_sql', {
            sql: `DROP POLICY IF EXISTS "${policy.name}" ON "public"."${tableName}";`
          });
          
          // Criar nova política
          const { error: createPolicyError } = await supabase.rpc('execute_sql', {
            sql: `CREATE POLICY "${policy.name}" ON "public"."${tableName}" ${policy.definition};`
          });
          
          policyResults.push({
            name: policy.name,
            status: createPolicyError ? 'error' : 'success',
            message: createPolicyError ? createPolicyError.message : 'Política aplicada com sucesso'
          });
        }
        
        results[tableName] = {
          status: 'success',
          message: `RLS habilitado e políticas aplicadas para ${tableName}`,
          policies: policyResults
        };
      } catch (err) {
        results[tableName] = {
          status: 'error',
          message: `Erro ao processar tabela ${tableName}: ${err.message}`
        };
      }
    }
    
    return new Response(
      JSON.stringify({ 
        status: 'success', 
        message: 'Aplicação de políticas RLS concluída',
        results
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
    console.error('Erro na Edge Function apply-rls:', err);
    
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: `Exceção ao aplicar políticas RLS: ${err.message}`,
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
