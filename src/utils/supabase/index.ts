import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Re-exportar para compatibilidade
export const createClient = (url: string, key: string) => {
  return createSupabaseClient(url, key);
};

// Exportar outras funções úteis
export * from './api';
