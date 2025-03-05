// Endpoint para verificar o status da conexão com o Supabase
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Obter as variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Informações sobre as variáveis de ambiente
  const envInfo = {
    supabaseUrlConfigured: !!supabaseUrl,
    supabaseKeyConfigured: !!supabaseAnonKey,
    supabaseUrlLength: supabaseUrl ? supabaseUrl.length : 0,
    supabaseKeyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
    supabaseUrlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : 'não definida',
    supabaseKeyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 5)}` : 'não definida',
  };
  
  // Verificar se as variáveis de ambiente estão configuradas
  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({
      error: 'Configuração do Supabase incompleta',
      envInfo,
      status: 'error'
    });
  }
  
  try {
    // Criar cliente do Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Verificar conexão com Supabase
    const { data, error } = await supabase.from('_diagnose_connection').select('*').limit(1).catch(e => ({ error: e }));
    
    // Verificar se há erro
    if (error) {
      // Tentar uma operação mais simples para verificar se a conexão está funcionando
      const authResponse = await supabase.auth.getSession();
      
      if (authResponse.error) {
        return res.status(500).json({
          error: 'Falha na conexão com Supabase',
          details: {
            message: authResponse.error.message,
            code: authResponse.error.code,
            hint: authResponse.error.hint
          },
          envInfo,
          status: 'error'
        });
      }
      
      // A conexão está funcionando, mas a tabela não existe
      return res.status(200).json({
        status: 'partial_success',
        message: 'Conexão com Supabase estabelecida, mas não foi possível acessar dados',
        details: {
          message: error.message,
          code: error.code,
          hint: error.hint
        },
        envInfo,
        authStatus: 'OK'
      });
    }
    
    // Conexão bem-sucedida
    return res.status(200).json({
      status: 'success',
      message: 'Conexão com Supabase estabelecida com sucesso',
      envInfo,
      dataAccess: 'OK'
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Erro ao verificar conexão com Supabase',
      details: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      envInfo,
      status: 'error'
    });
  }
}
