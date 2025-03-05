import { createClient } from '@supabase/supabase-js';
import { checkEnvVariables, getConfigErrorMessage } from './testConfig';

// Cria um cliente do Supabase para o frontend
export const createSupabaseClient = () => {
  // Obter as variáveis de ambiente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Verificar se as variáveis de ambiente estão configuradas
  const envStatus = checkEnvVariables();
  
  // Registrar informações sobre a configuração
  if (envStatus.hasConfigIssues) {
    const errorMessage = getConfigErrorMessage();
    console.error(`ERRO DE CONFIGURAÇÃO: ${errorMessage}`);
    console.error('Detalhes da configuração:', {
      urlConfigured: envStatus.urlConfigured,
      keyConfigured: envStatus.keyConfigured,
      urlLength: supabaseUrl.length,
      keyLength: supabaseAnonKey.length
    });
  } else {
    console.log('Configuração do Supabase OK');
  }
  
  // Criar o cliente mesmo com configuração inválida para evitar erros de inicialização
  // Os erros serão tratados nas funções que usam o cliente
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
  });
};

// Cliente global do Supabase
export const supabase = createSupabaseClient();

// Verificar conexão com Supabase
export const checkSupabaseConnection = async () => {
  // Verificar se as variáveis de ambiente estão configuradas
  const envStatus = checkEnvVariables();
  if (envStatus.hasConfigIssues) {
    const errorMessage = getConfigErrorMessage();
    console.error('Falha na verificação de conexão - Problema de configuração:', errorMessage);
    return { 
      connected: false, 
      error: `Problema de configuração: ${errorMessage}`,
      isConfigError: true
    };
  }
  
  // Modo de simulação para desenvolvimento
  // Ative apenas durante testes e desenvolvimento
  const SIMULATION_MODE = false; // Mude para true para simular conexão
  const FORCE_ERROR = false;     // Mude para true para simular falha de conexão
  
  if (SIMULATION_MODE) {
    console.log('Modo de simulação ativado para verificação de conexão');
    if (FORCE_ERROR) {
      return { connected: false, error: 'Falha de conexão simulada para teste' };
    }
    return { connected: true, error: null };
  }
  
  try {
    console.log('Verificando conexão com Supabase...');
    const startTime = Date.now();
    
    // Verificar se a URL do Supabase é válida
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
      throw new Error('URL do Supabase inválida');
    }
    
    // Usar uma consulta simples para verificar a conexão
    // Adicionando timeout para evitar espera infinita
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout ao conectar com Supabase')), 10000);
    });
    
    const queryPromise = supabase.from('user_roles').select('count', { count: 'exact', head: true });
    
    // Usar Promise.race para implementar timeout
    const { error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`Verificação de conexão concluída em ${responseTime}ms`);
    
    if (error) {
      console.error('Erro na verificação de conexão:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
    }
    
    return { 
      connected: !error, 
      error: error?.message,
      responseTime
    };
  } catch (err: any) {
    console.error('Exceção ao verificar conexão com Supabase:', err.message);
    console.error('Detalhes da exceção:', {
      name: err.name || 'N/A',
      stack: err.stack ? 'Presente' : 'Ausente',
      code: err.code || 'N/A'
    });
    
    // Mensagem de erro mais amigável para erros comuns
    let errorMessage = err.message || 'Erro desconhecido na conexão';
    
    if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
      errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
    } else if (errorMessage.includes('NetworkError')) {
      errorMessage = 'Erro de rede ao conectar com o servidor. Verifique sua conexão com a internet.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      errorMessage = 'Tempo limite excedido ao tentar conectar com o servidor.';
    }
    
    return { 
      connected: false, 
      error: errorMessage
    };
  }
};

// Tipos para autenticação
export type UserSession = {
  user: {
    id: string;
    email?: string;
    role?: string;
  } | null;
  session: any | null;
  isLoading: boolean;
};

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
  } catch (err: any) {
    console.error('Exceção ao obter usuário atual:', err.message);
    return null;
  }
};

// Função para obter o papel/função do usuário (role)
export const getUserRole = async (): Promise<string | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  // Buscar o papel do usuário do banco de dados
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
  
  if (error || !data) return 'user'; // Papel padrão se não encontrado
  return data.role;
};

// Funções de autenticação
export const signIn = async (email: string, password: string) => {
  try {
    // Verificar conexão antes de tentar login
    const connectionCheck = await checkSupabaseConnection();
    if (!connectionCheck.connected) {
      // Se for um erro de configuração, retornar mensagem específica
      if (connectionCheck.isConfigError) {
        return { data: null, error: new Error(connectionCheck.error || 'Problema de configuração do Supabase') };
      }
      
      return { data: null, error: new Error(`Falha na conexão com o servidor: ${connectionCheck.error || 'Verifique sua conexão com a internet'}`) };
    }
    
    console.log('Tentando login com:', { email });
    
    // Adicionar timeout para evitar espera infinita
    const timeoutPromise = new Promise<{data: null, error: Error}>((_, reject) => {
      setTimeout(() => reject(new Error('Tempo limite excedido ao tentar fazer login')), 15000);
    });
    
    const authPromise = supabase.auth.signInWithPassword({ email, password });
    
    // Usar Promise.race para implementar timeout
    return await Promise.race([authPromise, timeoutPromise]);
    
  } catch (err: any) {
    console.error('Exceção durante login:', err);
    
    // Mensagem de erro mais amigável
    let errorMessage = err.message || 'Erro desconhecido durante login';
    
    if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
      errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
    } else if (errorMessage.includes('NetworkError')) {
      errorMessage = 'Erro de rede ao conectar com o servidor. Verifique sua conexão com a internet.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      errorMessage = 'Tempo limite excedido ao tentar conectar com o servidor.';
    }
    
    return { data: null, error: new Error(errorMessage) };
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    // Verificar conexão antes de tentar cadastro
    const connectionCheck = await checkSupabaseConnection();
    if (!connectionCheck.connected) {
      // Se for um erro de configuração, retornar mensagem específica
      if (connectionCheck.isConfigError) {
        return { data: null, error: new Error(connectionCheck.error || 'Problema de configuração do Supabase') };
      }
      
      return { data: null, error: new Error(`Falha na conexão com o servidor: ${connectionCheck.error || 'Verifique sua conexão com a internet'}`) };
    }
    
    console.log('Tentando cadastro com:', { email });
    
    // Adicionar timeout para evitar espera infinita
    const timeoutPromise = new Promise<{data: null, error: Error}>((_, reject) => {
      setTimeout(() => reject(new Error('Tempo limite excedido ao tentar fazer cadastro')), 15000);
    });
    
    const authPromise = supabase.auth.signUp({ email, password });
    
    // Usar Promise.race para implementar timeout
    return await Promise.race([authPromise, timeoutPromise]);
    
  } catch (err: any) {
    console.error('Exceção durante cadastro:', err);
    
    // Mensagem de erro mais amigável
    let errorMessage = err.message || 'Erro desconhecido durante cadastro';
    
    if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
      errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
    } else if (errorMessage.includes('NetworkError')) {
      errorMessage = 'Erro de rede ao conectar com o servidor. Verifique sua conexão com a internet.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      errorMessage = 'Tempo limite excedido ao tentar conectar com o servidor.';
    }
    
    return { data: null, error: new Error(errorMessage) };
  }
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const resetPassword = async (email: string) => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
};

export const updatePassword = async (newPassword: string) => {
  return await supabase.auth.updateUser({ password: newPassword });
};
