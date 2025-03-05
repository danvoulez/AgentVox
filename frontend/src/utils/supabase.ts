import { createClient } from '@supabase/supabase-js';

// Obter as variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO CRÍTICO: Supabase URL ou Anon Key não configurados.');
  // Em produção, você pode querer redirecionar para uma página de erro
  if (typeof window !== 'undefined') {
    console.error('Verificando variáveis de ambiente:', {
      url: supabaseUrl ? 'Configurado' : 'Não configurado',
      key: supabaseAnonKey ? 'Configurado (comprimento: ' + supabaseAnonKey.length + ')' : 'Não configurado'
    });
  }
}

// Criar cliente com validação e tratamento de erros
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Verificar conexão com Supabase (pode ser chamado onde necessário)
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('vox_memory').select('count', { count: 'exact', head: true });
    return { connected: !error, error: error?.message };
  } catch (err: any) {
    console.error('Erro ao verificar conexão com Supabase:', err.message);
    return { connected: false, error: err.message };
  }
};

export const getServiceSupabase = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseServiceKey) {
    console.error('ERRO: Supabase Service Role Key não configurada.');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

export const formatSupabaseResponse = (data: any) => {
  if (!data) return null;
  
  if (Array.isArray(data)) {
    return data.map((item: any) => convertSnakeToCamel(item));
  }
  
  return convertSnakeToCamel(data);
};

const convertSnakeToCamel = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item: any) => convertSnakeToCamel(item));
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    const value = obj[key];
    
    acc[camelKey] = convertSnakeToCamel(value);
    return acc;
  }, {} as Record<string, any>);
};
