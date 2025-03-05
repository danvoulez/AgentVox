// Utilitários para gerenciar o banco de dados do Supabase

import { getFunctionsUrl } from './supabaseFunctions';

// Interface para documentação do banco de dados
export interface DatabaseDocumentation {
  status: string;
  message: string;
  markdown?: string;
  schema?: Record<string, TableSchema>;
  error?: string;
}

// Interface para schema de tabela
export interface TableSchema {
  name: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
  }[];
  rls_enabled: boolean;
  policies: {
    name: string;
    definition: string;
    command: string;
  }[];
}

// Gerar documentação do banco de dados
export const generateDatabaseDocumentation = async (): Promise<DatabaseDocumentation> => {
  try {
    const url = `${getFunctionsUrl()}/rls-documentation`;
    
    console.log('Gerando documentação do banco de dados...');
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
      console.error('Erro ao gerar documentação do banco de dados:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return {
        status: 'error',
        message: `Erro ao gerar documentação: ${response.statusText}`,
        error: errorText
      };
    }
    
    const result = await response.json();
    return {
      status: result.status,
      message: result.message,
      markdown: result.markdown,
      schema: result.schema
    };
  } catch (err: any) {
    console.error('Exceção ao gerar documentação do banco de dados:', err);
    
    return {
      status: 'error',
      message: `Erro ao gerar documentação: ${err.message}`,
      error: err.message
    };
  }
};

// Salvar documentação em arquivo
export const saveDatabaseDocumentation = async (markdown: string): Promise<boolean> => {
  try {
    // Esta função seria implementada no lado do servidor
    // Para o cliente, podemos oferecer um download do arquivo
    
    // Criar um blob com o conteúdo markdown
    const blob = new Blob([markdown], { type: 'text/markdown' });
    
    // Criar URL para o blob
    const url = URL.createObjectURL(blob);
    
    // Criar elemento de link para download
    const a = document.createElement('a');
    a.href = url;
    a.download = `database-documentation-${new Date().toISOString().split('T')[0]}.md`;
    
    // Adicionar ao documento, clicar e remover
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Liberar a URL do objeto
    URL.revokeObjectURL(url);
    
    return true;
  } catch (err: any) {
    console.error('Erro ao salvar documentação:', err);
    return false;
  }
};

// Verificar integridade do banco de dados
export const checkDatabaseIntegrity = async (): Promise<{
  status: string;
  message: string;
  issues?: {
    tablesWithoutRls: string[];
    tablesWithRlsNoPolicies: string[];
    missingTables: string[];
  };
  error?: string;
}> => {
  try {
    const doc = await generateDatabaseDocumentation();
    
    if (doc.status === 'error' || !doc.schema) {
      return {
        status: 'error',
        message: doc.message || 'Erro ao verificar integridade do banco de dados',
        error: doc.error
      };
    }
    
    // Tabelas esperadas no sistema
    const expectedTables = [
      'user_roles',
      'user_profiles',
      'agents',
      'conversations',
      'messages',
      'memories',
      'voice_settings'
    ];
    
    // Verificar tabelas sem RLS
    const tablesWithoutRls = Object.entries(doc.schema)
      .filter(([_, schema]) => !schema.rls_enabled)
      .map(([tableName, _]) => tableName);
    
    // Verificar tabelas com RLS mas sem políticas
    const tablesWithRlsNoPolicies = Object.entries(doc.schema)
      .filter(([_, schema]) => schema.rls_enabled && schema.policies.length === 0)
      .map(([tableName, _]) => tableName);
    
    // Verificar tabelas esperadas que estão faltando
    const existingTables = Object.keys(doc.schema);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    const hasIssues = tablesWithoutRls.length > 0 || 
                     tablesWithRlsNoPolicies.length > 0 || 
                     missingTables.length > 0;
    
    return {
      status: hasIssues ? 'warning' : 'success',
      message: hasIssues 
        ? 'Foram encontrados problemas na integridade do banco de dados' 
        : 'Banco de dados íntegro',
      issues: {
        tablesWithoutRls,
        tablesWithRlsNoPolicies,
        missingTables
      }
    };
  } catch (err: any) {
    console.error('Exceção ao verificar integridade do banco de dados:', err);
    
    return {
      status: 'error',
      message: `Erro ao verificar integridade: ${err.message}`,
      error: err.message
    };
  }
};
