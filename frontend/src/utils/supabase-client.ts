import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Configurações de timeout para requisições
const TIMEOUT_MS = 10000; // 10 segundos

// Classe para gerenciar erros do Supabase
export class SupabaseError extends Error {
  code: string;
  details: any;
  
  constructor(message: string, code: string = 'unknown_error', details: any = {}) {
    super(message);
    this.name = 'SupabaseError';
    this.code = code;
    this.details = details;
  }
}

// Função para validar as variáveis de ambiente
const validateEnvVars = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) {
    throw new SupabaseError(
      'URL do Supabase não configurada',
      'missing_env_var',
      { variable: 'NEXT_PUBLIC_SUPABASE_URL' }
    );
  }
  
  if (!supabaseAnonKey) {
    throw new SupabaseError(
      'Chave anônima do Supabase não configurada',
      'missing_env_var',
      { variable: 'NEXT_PUBLIC_SUPABASE_ANON_KEY' }
    );
  }
  
  // Validar formato da URL
  try {
    new URL(supabaseUrl);
  } catch (e) {
    throw new SupabaseError(
      'URL do Supabase em formato inválido',
      'invalid_url_format',
      { url: supabaseUrl }
    );
  }
  
  // Validar tamanho mínimo da chave
  if (supabaseAnonKey.length < 20) {
    throw new SupabaseError(
      'Chave anônima do Supabase parece inválida (muito curta)',
      'invalid_key_format',
      { keyLength: supabaseAnonKey.length }
    );
  }
  
  return { supabaseUrl, supabaseAnonKey };
};

// Função para criar cliente Supabase com timeout
export const createSupabaseClient = () => {
  try {
    const { supabaseUrl, supabaseAnonKey } = validateEnvVars();
    
    // Criar cliente com tipagem
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    
    return supabase;
  } catch (error) {
    console.error('Erro ao criar cliente Supabase:', error);
    // Re-throw para que o componente possa tratar
    throw error;
  }
};

// Cliente Supabase singleton para uso em toda a aplicação
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

// Função para obter o cliente Supabase (singleton)
export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }
  return supabaseInstance;
};

// Função para testar a conexão com o Supabase
export const testSupabaseConnection = async () => {
  try {
    const supabase = getSupabase();
    
    // Usar Promise.race para implementar timeout
    const result = await Promise.race([
      supabase.from('_test_connection').select('count').limit(1),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new SupabaseError(
          'Timeout ao conectar com Supabase',
          'connection_timeout',
          { timeoutMs: TIMEOUT_MS }
        )), TIMEOUT_MS)
      )
    ]);
    
    if (result.error) {
      throw new SupabaseError(
        `Erro ao conectar com Supabase: ${result.error.message}`,
        'connection_error',
        result.error
      );
    }
    
    return { success: true, data: result.data };
  } catch (error: any) {
    if (error instanceof SupabaseError) {
      throw error;
    }
    
    throw new SupabaseError(
      `Erro inesperado ao testar conexão: ${error.message || 'Erro desconhecido'}`,
      'unexpected_error',
      error
    );
  }
};

// Função para traduzir erros técnicos em mensagens amigáveis
export const getReadableErrorMessage = (error: any): string => {
  if (!error) return 'Ocorreu um erro desconhecido';
  
  // Se já for um SupabaseError, usar a mensagem diretamente
  if (error instanceof SupabaseError) {
    return error.message;
  }
  
  // Erros comuns do Supabase
  if (error.code === 'auth/invalid-email') {
    return 'O email fornecido não é válido';
  }
  
  if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
    return 'Email ou senha incorretos';
  }
  
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente';
  }
  
  if (error.message?.includes('timeout')) {
    return 'A conexão expirou. Tente novamente mais tarde';
  }
  
  if (error.message?.includes('JWT')) {
    return 'Sua sessão expirou. Faça login novamente';
  }
  
  // Fallback para mensagem genérica
  return error.message || 'Ocorreu um erro desconhecido';
};

// Exportar cliente padrão para uso rápido
export const supabase = getSupabase();

export default supabase;
