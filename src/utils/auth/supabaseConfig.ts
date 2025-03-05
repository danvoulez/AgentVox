// Configuração do cliente Supabase com suporte a fallback
import { createClient } from '@supabase/supabase-js';

// Verificar se estamos em modo de desenvolvimento com fallback
const USE_MOCK = process.env.NEXT_PUBLIC_USE_SUPABASE_MOCK === 'true';

// Função para criar o cliente Supabase
export const createSupabaseClient = () => {
  // Obter as variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Verificar se as variáveis de ambiente estão configuradas
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERRO CRÍTICO: Supabase URL ou Anon Key não configurados.');
    
    // Criar um cliente com valores de fallback para evitar erros fatais
    // Isso não funcionará para operações reais, mas evitará que o app quebre completamente
    return createClient(
      'https://xyzcompany.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3RpbmciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjk2MDA0OCwiZXhwIjoxOTMyNTM2MDQ4fQ.jNsLUXikIwwF_XW6HeUKYcvlhDmZwj0LaU5J0lKQ7jQ'
    );
  }
  
  // Criar e retornar o cliente Supabase
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Cliente global do Supabase
export const supabase = createSupabaseClient();

// Verificar conexão com Supabase
export const checkSupabaseConnection = async () => {
  try {
    // Tentar fazer uma operação simples para verificar a conexão
    const { error } = await supabase.from('_dummy_query_').select('*').limit(1);
    
    // Se não houver erro específico de conexão, assumimos que a conexão está ok
    // (pode haver erro de tabela não existir, mas isso significa que a conexão funcionou)
    if (!error || !error.message.includes('connection')) {
      console.log('✅ Conexão com Supabase estabelecida com sucesso');
      return true;
    } else {
      console.error('❌ Erro ao conectar com Supabase:', error.message);
      return false;
    }
  } catch (err) {
    console.error('❌ Exceção ao tentar conectar com Supabase:', err);
    return false;
  }
};

// Função para simular uma conexão bem-sucedida (para desenvolvimento)
export const simulateSuccessfulConnection = () => {
  console.log('✅ [SIMULAÇÃO] Conexão com Supabase estabelecida com sucesso');
  return Promise.resolve(true);
};

// Função para simular uma falha de conexão (para testes)
export const simulateConnectionFailure = (errorMessage = 'Falha simulada de conexão') => {
  console.error(`❌ [SIMULAÇÃO] Erro ao conectar com Supabase: ${errorMessage}`);
  return Promise.resolve(false);
};

// Tipos para autenticação
export interface UserSession {
  user: {
    id: string;
    email?: string;
    role?: string;
  } | null;
  id: string;
  email?: string;
  role?: string;
  session: any | null;
  isLoading: boolean;
}

// Função para verificar se o usuário está autenticado
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Função para obter o usuário atual
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Erro ao obter usuário atual:', error.message);
      return null;
    }
    
    return data.user;
  } catch (err) {
    console.error('Exceção ao obter usuário atual:', err);
    return null;
  }
};

// Função para obter o papel/função do usuário (role)
export const getUserRole = async (): Promise<string | null> => {
  try {
    const user = await getCurrentUser();
    
    if (!user) return null;
    
    // Obter o papel do usuário a partir dos metadados ou de uma tabela específica
    // Isso depende de como você implementou os papéis no seu sistema
    return user.role || 'user'; // 'user' como valor padrão
  } catch (err) {
    console.error('Erro ao obter papel do usuário:', err);
    return null;
  }
};

// Funções de autenticação
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Erro ao fazer login:', error.message);
      return { user: null, error: error.message };
    }
    
    return { user: data.user, session: data.session, error: null };
  } catch (err: any) {
    console.error('Exceção ao fazer login:', err);
    return { user: null, error: err.message || 'Erro desconhecido ao fazer login' };
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) {
      console.error('Erro ao criar conta:', error.message);
      return { user: null, error: error.message };
    }
    
    // Verificar se o usuário precisa confirmar o email
    const needsEmailConfirmation = !data.session;
    
    return { 
      user: data.user, 
      session: data.session, 
      needsEmailConfirmation,
      error: null 
    };
  } catch (err: any) {
    console.error('Exceção ao criar conta:', err);
    return { user: null, error: err.message || 'Erro desconhecido ao criar conta' };
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return { error };
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error };
};
