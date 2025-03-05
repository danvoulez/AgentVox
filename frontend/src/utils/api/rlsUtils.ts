// Utilitários para gerenciar políticas RLS (Row Level Security) do Supabase

import { getFunctionsUrl } from './supabaseFunctions';

// Interface para informações de uma política RLS
export interface RlsPolicy {
  table: string;
  name: string;
  definition: string;
  enabled: boolean;
}

// Interface para informações de uma tabela
export interface TableInfo {
  name: string;
  rls_enabled: boolean;
  policies: RlsPolicy[];
}

// Verificar o status das políticas RLS
export const checkRlsStatus = async (): Promise<{
  status: string;
  message: string;
  tables?: Record<string, TableInfo>;
  error?: string;
}> => {
  try {
    const url = `${getFunctionsUrl()}/check-rls`;
    
    console.log('Verificando status das políticas RLS...');
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`Resposta recebida em ${responseTime}ms`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao verificar políticas RLS:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return {
        status: 'error',
        message: `Erro ao verificar políticas RLS: ${response.statusText}`,
        error: errorText
      };
    }
    
    const result = await response.json();
    return {
      status: result.status,
      message: result.message,
      tables: result.tables
    };
  } catch (err: any) {
    console.error('Exceção ao verificar políticas RLS:', err);
    
    return {
      status: 'error',
      message: `Erro ao verificar políticas RLS: ${err.message}`,
      error: err.message
    };
  }
};

// Aplicar políticas RLS para tabelas específicas
export const applyRlsPolicies = async (tables?: string[]): Promise<{
  status: string;
  message: string;
  results?: Record<string, any>;
  error?: string;
}> => {
  try {
    const url = `${getFunctionsUrl()}/apply-rls`;
    
    console.log('Aplicando políticas RLS...');
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tables }),
      credentials: 'include'
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`Resposta recebida em ${responseTime}ms`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao aplicar políticas RLS:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return {
        status: 'error',
        message: `Erro ao aplicar políticas RLS: ${response.statusText}`,
        error: errorText
      };
    }
    
    const result = await response.json();
    return {
      status: result.status,
      message: result.message,
      results: result.results
    };
  } catch (err: any) {
    console.error('Exceção ao aplicar políticas RLS:', err);
    
    return {
      status: 'error',
      message: `Erro ao aplicar políticas RLS: ${err.message}`,
      error: err.message
    };
  }
};

// Formatar o status das políticas RLS para exibição
export const formatRlsStatus = (tables: Record<string, TableInfo> | undefined): string => {
  if (!tables) {
    return 'Nenhuma informação disponível sobre políticas RLS.';
  }
  
  let output = '';
  
  for (const [tableName, tableInfo] of Object.entries(tables)) {
    output += `\n## Tabela: ${tableName}\n`;
    output += `- RLS Habilitado: ${tableInfo.rls_enabled ? '✅ Sim' : '❌ Não'}\n`;
    
    if (tableInfo.policies.length === 0) {
      output += '- Políticas: Nenhuma política definida\n';
    } else {
      output += '- Políticas:\n';
      
      for (const policy of tableInfo.policies) {
        output += `  - ${policy.name}: ${policy.enabled ? '✅ Ativa' : '❌ Inativa'}\n`;
      }
    }
  }
  
  return output;
};
