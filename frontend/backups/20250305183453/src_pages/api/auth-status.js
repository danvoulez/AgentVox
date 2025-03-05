// Endpoint para verificar o status da autenticação
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Obter as variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Verificar se as variáveis de ambiente estão configuradas
  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({
      error: 'Configuração do Supabase incompleta',
      supabaseUrlConfigured: !!supabaseUrl,
      supabaseKeyConfigured: !!supabaseAnonKey,
      supabaseUrlLength: supabaseUrl ? supabaseUrl.length : 0,
      supabaseKeyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
    });
  }
  
  try {
    // Criar cliente do Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Verificar conexão com Supabase
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return res.status(500).json({
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        status: 'error'
      });
    }
    
    // Retornar informações sobre a sessão
    return res.status(200).json({
      status: 'success',
      session: data.session ? 'Ativa' : 'Inativa',
      sessionData: data.session ? {
        userId: data.session.user.id,
        email: data.session.user.email,
        role: data.session.user.role,
        expiresAt: data.session.expires_at
      } : null,
      message: 'Conexão com Supabase estabelecida com sucesso'
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      status: 'error',
      message: 'Erro ao verificar conexão com Supabase'
    });
  }
}
