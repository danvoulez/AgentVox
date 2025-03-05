import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface TableSchema {
  name: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
  }[];
  rls_enabled: boolean;
  policies: {
    name: string;
    definition: string;
    command: string;
  }[];
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
    
    // Obter lista de tabelas no schema public
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tablesError) {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: `Erro ao obter lista de tabelas: ${tablesError.message}`
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
    
    const tableSchemas: Record<string, TableSchema> = {};
    
    // Para cada tabela, obter schema e políticas RLS
    for (const table of tables) {
      const tableName = table.table_name;
      
      // Obter colunas da tabela
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .order('ordinal_position');
      
      if (columnsError) {
        console.error(`Erro ao obter colunas para tabela ${tableName}:`, columnsError);
        continue;
      }
      
      // Verificar se RLS está habilitado
      const { data: rlsStatus, error: rlsError } = await supabase
        .rpc('check_rls_enabled', { table_name: tableName })
        .single();
      
      let rlsEnabled = false;
      
      if (rlsError) {
        // Se a função RPC não existir, tentar uma consulta direta
        const { data: pgTables, error: pgError } = await supabase
          .from('pg_tables')
          .select('rowsecurity')
          .eq('schemaname', 'public')
          .eq('tablename', tableName)
          .maybeSingle();
        
        if (!pgError && pgTables) {
          rlsEnabled = pgTables.rowsecurity;
        }
      } else if (rlsStatus) {
        rlsEnabled = rlsStatus.rls_enabled;
      }
      
      // Obter políticas RLS
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('policyname, cmd, qual')
        .eq('schemaname', 'public')
        .eq('tablename', tableName);
      
      if (policiesError) {
        console.error(`Erro ao obter políticas para tabela ${tableName}:`, policiesError);
      }
      
      tableSchemas[tableName] = {
        name: tableName,
        columns: columns.map(col => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES'
        })),
        rls_enabled: rlsEnabled,
        policies: policies ? policies.map(policy => ({
          name: policy.policyname,
          definition: policy.qual,
          command: policy.cmd
        })) : []
      };
    }
    
    // Gerar documentação em Markdown
    let markdownDoc = `# Documentação de Segurança do Banco de Dados\n\n`;
    markdownDoc += `*Gerado automaticamente em ${new Date().toISOString()}*\n\n`;
    markdownDoc += `## Visão Geral\n\n`;
    markdownDoc += `Este documento descreve a estrutura e as políticas de segurança (Row Level Security) do banco de dados do AgentVox.\n\n`;
    
    // Resumo das tabelas
    markdownDoc += `### Resumo das Tabelas\n\n`;
    markdownDoc += `| Tabela | RLS Habilitado | Número de Políticas |\n`;
    markdownDoc += `|--------|---------------|---------------------|\n`;
    
    for (const [tableName, schema] of Object.entries(tableSchemas)) {
      markdownDoc += `| ${tableName} | ${schema.rls_enabled ? '✅' : '❌'} | ${schema.policies.length} |\n`;
    }
    
    // Detalhes de cada tabela
    markdownDoc += `\n## Detalhes das Tabelas\n\n`;
    
    for (const [tableName, schema] of Object.entries(tableSchemas)) {
      markdownDoc += `### Tabela: ${tableName}\n\n`;
      
      // Colunas
      markdownDoc += `#### Colunas\n\n`;
      markdownDoc += `| Nome | Tipo | Nullable |\n`;
      markdownDoc += `|------|------|----------|\n`;
      
      for (const column of schema.columns) {
        markdownDoc += `| ${column.name} | ${column.type} | ${column.nullable ? 'Sim' : 'Não'} |\n`;
      }
      
      // Status RLS
      markdownDoc += `\n#### Row Level Security\n\n`;
      markdownDoc += `Status: ${schema.rls_enabled ? 'Habilitado ✅' : 'Desabilitado ❌'}\n\n`;
      
      // Políticas
      if (schema.policies.length > 0) {
        markdownDoc += `#### Políticas\n\n`;
        
        for (const policy of schema.policies) {
          markdownDoc += `##### ${policy.name}\n\n`;
          markdownDoc += `- Comando: \`${policy.command}\`\n`;
          markdownDoc += `- Definição: \`${policy.definition}\`\n\n`;
        }
      } else if (schema.rls_enabled) {
        markdownDoc += `⚠️ **Atenção**: RLS está habilitado, mas não há políticas definidas. Isso significa que nenhum acesso é permitido para usuários regulares.\n\n`;
      }
      
      markdownDoc += `---\n\n`;
    }
    
    // Recomendações de segurança
    markdownDoc += `## Recomendações de Segurança\n\n`;
    
    const tablesWithoutRls = Object.entries(tableSchemas)
      .filter(([_, schema]) => !schema.rls_enabled)
      .map(([tableName, _]) => tableName);
    
    if (tablesWithoutRls.length > 0) {
      markdownDoc += `### Tabelas sem RLS\n\n`;
      markdownDoc += `As seguintes tabelas não têm RLS habilitado, o que significa que qualquer usuário autenticado pode acessá-las:\n\n`;
      
      for (const tableName of tablesWithoutRls) {
        markdownDoc += `- ${tableName}\n`;
      }
      
      markdownDoc += `\n**Recomendação**: Habilite RLS para estas tabelas e defina políticas apropriadas.\n\n`;
    }
    
    const tablesWithRlsNoPolicies = Object.entries(tableSchemas)
      .filter(([_, schema]) => schema.rls_enabled && schema.policies.length === 0)
      .map(([tableName, _]) => tableName);
    
    if (tablesWithRlsNoPolicies.length > 0) {
      markdownDoc += `### Tabelas com RLS mas sem Políticas\n\n`;
      markdownDoc += `As seguintes tabelas têm RLS habilitado, mas não têm políticas definidas, o que significa que nenhum acesso é permitido para usuários regulares:\n\n`;
      
      for (const tableName of tablesWithRlsNoPolicies) {
        markdownDoc += `- ${tableName}\n`;
      }
      
      markdownDoc += `\n**Recomendação**: Defina políticas apropriadas para estas tabelas.\n\n`;
    }
    
    return new Response(
      JSON.stringify({ 
        status: 'success', 
        message: 'Documentação gerada com sucesso',
        markdown: markdownDoc,
        schema: tableSchemas
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
    console.error('Erro na Edge Function rls-documentation:', err);
    
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: `Exceção ao gerar documentação: ${err.message}`,
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
