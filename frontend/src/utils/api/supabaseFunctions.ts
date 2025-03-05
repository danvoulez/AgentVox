// Utilitários para interagir com as Edge Functions do Supabase

// URL base para as Edge Functions
export const getFunctionsUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
  if (!url) {
    console.error('ERRO: NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL não está configurado');
    // Fallback para URL padrão baseada na URL do Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (supabaseUrl) {
      return `${supabaseUrl}/functions/v1`;
    }
    throw new Error('URL das Edge Functions não configurada');
  }
  return url;
};

// Função genérica para chamar uma Edge Function
const callEdgeFunction = async (
  functionName: string, 
  data: any = {}, 
  method: 'GET' | 'POST' = 'POST',
  headers: Record<string, string> = {}
) => {
  try {
    const url = `${getFunctionsUrl()}/${functionName}`;
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      credentials: 'include'
    };
    
    // Adicionar corpo da requisição para métodos POST
    if (method === 'POST' && data) {
      requestOptions.body = JSON.stringify(data);
    }
    
    console.log(`Chamando Edge Function: ${functionName}`);
    const startTime = Date.now();
    
    const response = await fetch(url, requestOptions);
    const responseTime = Date.now() - startTime;
    
    console.log(`Resposta da Edge Function ${functionName} recebida em ${responseTime}ms`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro na Edge Function ${functionName}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      try {
        // Tentar analisar o erro como JSON
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.error || `Erro ${response.status}: ${response.statusText}`);
      } catch (e) {
        // Se não for JSON, usar o texto bruto
        throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
      }
    }
    
    const result = await response.json();
    return result;
  } catch (err: any) {
    console.error(`Exceção ao chamar Edge Function ${functionName}:`, err);
    
    // Mensagem de erro mais amigável para erros comuns
    let errorMessage = err.message || 'Erro desconhecido';
    
    if (errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
      errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
    } else if (errorMessage.includes('NetworkError')) {
      errorMessage = 'Erro de rede ao conectar com o servidor. Verifique sua conexão com a internet.';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      errorMessage = 'Tempo limite excedido ao tentar conectar com o servidor.';
    }
    
    throw new Error(errorMessage);
  }
};

// Função para verificar a conexão com o Supabase
export const checkConnection = async () => {
  try {
    const result = await callEdgeFunction('check-connection', {}, 'GET');
    return {
      connected: result.status === 'success',
      message: result.message,
      details: result.details
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err.message,
      details: { errorType: 'exception', errorMessage: err.message }
    };
  }
};

// Funções de autenticação
export const signIn = async (email: string, password: string) => {
  try {
    const result = await callEdgeFunction('auth-handler', {
      action: 'signin',
      email,
      password
    });
    
    return {
      user: result.user,
      session: result.session,
      error: null
    };
  } catch (err: any) {
    return {
      user: null,
      session: null,
      error: err.message
    };
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    const result = await callEdgeFunction('auth-handler', {
      action: 'signup',
      email,
      password
    });
    
    return {
      user: result.user,
      session: result.session,
      needsEmailConfirmation: result.needsEmailConfirmation,
      error: null
    };
  } catch (err: any) {
    return {
      user: null,
      session: null,
      needsEmailConfirmation: false,
      error: err.message
    };
  }
};

export const signOut = async () => {
  try {
    await callEdgeFunction('auth-handler', {
      action: 'signout'
    });
    
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await callEdgeFunction('auth-handler', {
      action: 'reset-password',
      email
    });
    
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
};

// Funções para gerenciar políticas RLS
export const checkRlsStatus = async () => {
  try {
    const result = await callEdgeFunction('check-rls', {}, 'GET');
    
    return {
      status: result.status,
      message: result.message,
      tables: result.tables,
      error: null
    };
  } catch (err: any) {
    return {
      status: 'error',
      message: err.message,
      tables: [],
      error: err.message
    };
  }
};

export const applyRlsPolicies = async (tables?: string[]) => {
  try {
    const result = await callEdgeFunction('apply-rls', {
      tables: tables || []
    });
    
    return {
      status: result.status,
      message: result.message,
      appliedPolicies: result.appliedPolicies,
      error: null
    };
  } catch (err: any) {
    return {
      status: 'error',
      message: err.message,
      appliedPolicies: [],
      error: err.message
    };
  }
};
