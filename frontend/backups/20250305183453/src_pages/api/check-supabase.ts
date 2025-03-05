import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

interface CheckResult {
  status: 'success' | 'error';
  message: string;
  details?: {
    url?: string;
    urlConfigured: boolean;
    keyConfigured: boolean;
    dnsResolved?: boolean;
    connectionSuccessful?: boolean;
    errorType?: string;
    errorMessage?: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckResult>
) {
  // Obter as variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Verificar se as variáveis de ambiente estão configuradas
  const urlConfigured = !!supabaseUrl && supabaseUrl.length > 10;
  const keyConfigured = !!supabaseAnonKey && supabaseAnonKey.length > 20;
  
  // Se as variáveis não estiverem configuradas, retornar erro
  if (!urlConfigured || !keyConfigured) {
    return res.status(500).json({
      status: 'error',
      message: 'Variáveis de ambiente do Supabase não configuradas corretamente',
      details: {
        urlConfigured,
        keyConfigured,
        errorType: 'config'
      }
    });
  }
  
  try {
    // Extrair o domínio da URL do Supabase
    const domain = supabaseUrl.replace(/^https?:\/\//, '').split('/')[0];
    
    // Verificar se o domínio pode ser resolvido
    let dnsResolved = false;
    try {
      await dnsLookup(domain);
      dnsResolved = true;
    } catch (dnsError) {
      return res.status(500).json({
        status: 'error',
        message: `Não foi possível resolver o domínio ${domain}`,
        details: {
          urlConfigured,
          keyConfigured,
          dnsResolved: false,
          errorType: 'dns',
          errorMessage: (dnsError as Error).message
        }
      });
    }
    
    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Tentar fazer uma operação simples para verificar a conexão
    const { error } = await supabase.from('_dummy_query_').select('*').limit(1);
    
    // Se não houver erro específico de conexão, assumimos que a conexão está ok
    // (pode haver erro de tabela não existir, mas isso significa que a conexão funcionou)
    if (!error || !error.message.includes('connection')) {
      return res.status(200).json({
        status: 'success',
        message: 'Conexão com Supabase estabelecida com sucesso',
        details: {
          urlConfigured,
          keyConfigured,
          dnsResolved,
          connectionSuccessful: true
        }
      });
    } else {
      return res.status(500).json({
        status: 'error',
        message: `Erro ao conectar com Supabase: ${error.message}`,
        details: {
          urlConfigured,
          keyConfigured,
          dnsResolved,
          connectionSuccessful: false,
          errorType: 'connection',
          errorMessage: error.message
        }
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: `Exceção ao tentar conectar com Supabase: ${(err as Error).message}`,
      details: {
        urlConfigured,
        keyConfigured,
        errorType: 'unknown',
        errorMessage: (err as Error).message
      }
    });
  }
}
