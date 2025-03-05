import { createClient } from '@supabase/supabase-js';

// Cria cliente Supabase para uso no lado do servidor
export const createSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Função para formatar resposta do Supabase para camelCase
export const formatSupabaseResponse = (data: any) => {
  if (Array.isArray(data)) {
    return data.map(item => formatObjectKeys(item));
  }
  return formatObjectKeys(data);
};

// Função auxiliar para converter snake_case para camelCase
const formatObjectKeys = (obj: any) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const formattedObj: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    formattedObj[camelKey] = obj[key];
  });
  
  return formattedObj;
};
