// Arquivo de utilitários para diagnóstico de problemas de conexão com Supabase
// Este arquivo não contém credenciais, apenas funções para verificar a configuração

// Função para verificar se as variáveis de ambiente estão configuradas
export const checkEnvVariables = () => {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Verificar se as variáveis de ambiente estão configuradas corretamente
  const urlConfigured = !!envUrl && envUrl.length > 10;
  const keyConfigured = !!envKey && envKey.length > 20;
  
  // Verificar se há problemas com as variáveis de ambiente
  const hasConfigIssues = !urlConfigured || !keyConfigured;
  
  // Registrar informações detalhadas para depuração
  if (typeof window !== 'undefined') {
    console.log('Verificação de variáveis de ambiente:', {
      urlConfigured,
      keyConfigured,
      hasConfigIssues,
      envUrlPresent: !!envUrl,
      envKeyPresent: !!envKey,
      envUrlLength: envUrl ? envUrl.length : 0,
      envKeyLength: envKey ? envKey.length : 0
    });
  }
  
  return {
    urlConfigured,
    keyConfigured,
    hasConfigIssues,
    envUrl,
    envKey
  };
};

// Função para gerar uma mensagem de erro amigável sobre problemas de configuração
export const getConfigErrorMessage = () => {
  const { urlConfigured, keyConfigured } = checkEnvVariables();
  
  if (!urlConfigured && !keyConfigured) {
    return 'As variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não estão configuradas. Configure o arquivo .env.local na raiz do projeto.';
  } else if (!urlConfigured) {
    return 'A variável de ambiente NEXT_PUBLIC_SUPABASE_URL não está configurada corretamente. Verifique o arquivo .env.local.';
  } else if (!keyConfigured) {
    return 'A variável de ambiente NEXT_PUBLIC_SUPABASE_ANON_KEY não está configurada corretamente. Verifique o arquivo .env.local.';
  }
  
  return null;
};

// Função para simular uma conexão bem-sucedida para testes
export const simulateSuccessfulConnection = () => {
  return {
    connected: true,
    error: null
  };
};

// Função para simular uma falha de conexão para testes
export const simulateConnectionFailure = (errorMessage = 'Falha simulada de conexão') => {
  return {
    connected: false,
    error: errorMessage
  };
};
