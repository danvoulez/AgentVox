import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/auth/supabase';

type ResponseData = {
  status: 'success' | 'error';
  clientInfo?: {
    urlDefined: boolean;
    keyDefined: boolean;
    urlLength?: number;
    keyLength?: number;
    error?: string;
  };
  testConnection?: {
    success: boolean;
    error?: string;
  };
  envVariables?: {
    url: string;
    keyPreview: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    // Verificar as variáveis de ambiente no servidor 
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // Recolher informações sobre as configurações
    const clientInfo = {
      urlDefined: !!supabaseUrl,
      keyDefined: !!supabaseAnonKey,
      urlLength: supabaseUrl.length,
      keyLength: supabaseAnonKey.length,
    };

    // Testar conexão com Supabase
    let testConnection;
    try {
      const { error } = await supabase.auth.getSession();
      testConnection = {
        success: !error,
        error: error ? error.message : undefined
      };
    } catch (err: any) {
      testConnection = {
        success: false,
        error: err.message || 'Erro desconhecido durante teste de conexão'
      };
    }
    
    // Retornar informações (prevenindo exposição completa das chaves)
    const envVariables = {
      url: supabaseUrl,
      keyPreview: supabaseAnonKey 
        ? `${supabaseAnonKey.substring(0, 10)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 5)}`
        : 'não definida'
    };

    res.status(200).json({
      status: 'success',
      clientInfo,
      testConnection,
      envVariables
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      clientInfo: {
        urlDefined: false,
        keyDefined: false,
        error: error.message
      }
    });
  }
}
