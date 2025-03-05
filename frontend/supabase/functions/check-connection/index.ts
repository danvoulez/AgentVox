import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    // Verificar se as variáveis de ambiente estão configuradas
    const urlConfigured = !!supabaseUrl && supabaseUrl.length > 10;
    const keyConfigured = !!supabaseAnonKey && supabaseAnonKey.length > 20;
    
    // Se as variáveis não estiverem configuradas, retornar erro
    if (!urlConfigured || !keyConfigured) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Variáveis de ambiente do Supabase não configuradas corretamente',
          details: {
            urlConfigured,
            keyConfigured,
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
    
    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Tentar fazer uma operação simples para verificar a conexão
    const { data, error } = await supabase.from('user_roles').select('count', { count: 'exact', head: true });
    
    if (error) {
      // Verificar se é um erro de tabela não existente (o que significa que a conexão está ok)
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ 
            status: 'success', 
            message: 'Conexão com Supabase estabelecida com sucesso, mas a tabela user_roles não existe',
            details: {
              urlConfigured,
              keyConfigured,
              connectionSuccessful: true,
              missingTable: true
            }
          }),
          { 
            status: 200, 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: `Erro ao conectar com Supabase: ${error.message}`,
          details: {
            urlConfigured,
            keyConfigured,
            connectionSuccessful: false,
            errorType: 'connection',
            errorCode: error.code,
            errorMessage: error.message
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
    
    return new Response(
      JSON.stringify({ 
        status: 'success', 
        message: 'Conexão com Supabase estabelecida com sucesso',
        details: {
          urlConfigured,
          keyConfigured,
          connectionSuccessful: true
        }
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
    console.error('Erro na Edge Function check-connection:', err);
    
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: `Exceção ao tentar conectar com Supabase: ${err.message}`,
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
