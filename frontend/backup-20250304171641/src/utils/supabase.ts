import { createClient } from '@supabase/supabase-js';

// Valores padrão para desenvolvimento - substitua por suas credenciais reais em produção
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3RpbmciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.T7IQr1A1Vv9IjKI6gPvQNKLIb6FY-2HCQ-DFCLnR7g0';

// Verificar se as variáveis estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL ou Anon Key não configurados. Usando valores de desenvolvimento.');
}

// Criar cliente com validação
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getServiceSupabase = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3RpbmciLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE5MDAwMDAwMDB9.T7IQr1A1Vv9IjKI6gPvQNKLIb6FY-2HCQ-DFCLnR7g0';
  return createClient(supabaseUrl, supabaseServiceKey);
};

export const formatSupabaseResponse = (data: any) => {
  if (!data) return null;
  
  if (Array.isArray(data)) {
    return data.map(item => convertSnakeToCamel(item));
  }
  
  return convertSnakeToCamel(data);
};

const convertSnakeToCamel = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertSnakeToCamel(item));
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    const value = obj[key];
    
    acc[camelKey] = convertSnakeToCamel(value);
    return acc;
  }, {} as Record<string, any>);
};
