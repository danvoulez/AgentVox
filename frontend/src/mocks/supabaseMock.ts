// Mock do cliente Supabase para desenvolvimento local
import { createClient } from '@supabase/supabase-js';

// Cliente mock que simula as operações do Supabase
export const createMockSupabaseClient = () => {
  // Criar um cliente real, mas com credenciais de fallback
  // Isso permitirá que o código seja executado sem erros, mas as operações não funcionarão
  const mockClient = createClient(
    'https://xyzcompany.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3RpbmciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjk2MDA0OCwiZXhwIjoxOTMyNTM2MDQ4fQ.jNsLUXikIwwF_XW6HeUKYcvlhDmZwj0LaU5J0lKQ7jQ'
  );

  // Sobrescrever métodos para retornar dados simulados
  const mockMethods = {
    // Auth methods
    auth: {
      ...mockClient.auth,
      getSession: async () => ({ 
        data: { 
          session: null 
        }, 
        error: null 
      }),
      getUser: async () => ({
        data: {
          user: { id: 'mock-user-id', email: 'user@example.com' }
        },
        error: null
      }),
      signInWithPassword: async () => ({ 
        data: { 
          user: { id: 'mock-user-id', email: 'user@example.com' },
          session: { access_token: 'mock-token' }
        }, 
        error: null 
      }),
      signUp: async () => ({ 
        data: { 
          user: { id: 'mock-user-id', email: 'user@example.com' },
          session: null
        }, 
        error: null 
      }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({ 
        data: { user: { id: 'mock-user-id', email: 'user@example.com' } },
        error: null 
      })
    },
    
    // Database methods
    from: (table) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: {}, error: null }),
          data: [{ id: 'mock-id', created_at: new Date().toISOString() }],
          error: null
        }),
        limit: () => ({
          data: [{ id: 'mock-id', created_at: new Date().toISOString() }],
          error: null
        }),
        data: [{ id: 'mock-id', created_at: new Date().toISOString() }],
        error: null
      }),
      insert: async () => ({ data: { id: 'mock-id' }, error: null }),
      update: async () => ({ data: {}, error: null }),
      delete: async () => ({ data: {}, error: null }),
      upsert: async () => ({ data: { id: 'mock-id' }, error: null })
    }),
    
    // Storage methods
    storage: {
      ...mockClient.storage,
      from: (bucket) => ({
        upload: async () => ({ data: { path: 'mock-path' }, error: null }),
        download: async () => ({ data: new Blob(), error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/mock-file.jpg' } }),
        list: async () => ({ data: [{ name: 'mock-file.jpg' }], error: null }),
        remove: async () => ({ data: {}, error: null })
      })
    }
  };

  // Retornar um objeto que combina o cliente real com os métodos simulados
  return {
    ...mockClient,
    auth: mockMethods.auth,
    from: mockMethods.from,
    storage: mockMethods.storage
  };
};

// Exportar o cliente mock
export const supabaseMock = createMockSupabaseClient();

// Função auxiliar para simular atraso de rede
export const simulateNetworkDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Função para simular erros específicos (útil para testes)
export const createErrorMockClient = (errorType: 'auth' | 'database' | 'connection' | 'timeout') => {
  const mockClient = createMockSupabaseClient();
  
  switch (errorType) {
    case 'auth':
      return {
        ...mockClient,
        auth: {
          ...mockClient.auth,
          signInWithPassword: async () => ({ 
            data: { user: null, session: null },
            error: { message: 'Invalid login credentials' }
          }),
          signUp: async () => ({ 
            data: { user: null, session: null },
            error: { message: 'Email already registered' }
          })
        }
      };
      
    case 'database':
      return {
        ...mockClient,
        from: () => ({
          select: () => ({
            error: { message: 'Database query error' },
            data: null
          }),
          insert: async () => ({ error: { message: 'Database insert error' }, data: null }),
          update: async () => ({ error: { message: 'Database update error' }, data: null }),
          delete: async () => ({ error: { message: 'Database delete error' }, data: null })
        })
      };
      
    case 'connection':
      return {
        ...mockClient,
        auth: {
          ...mockClient.auth,
          signInWithPassword: async () => {
            throw new Error('Failed to fetch');
          }
        },
        from: () => ({
          select: () => {
            throw new Error('Connection error');
          }
        })
      };
      
    case 'timeout':
      return {
        ...mockClient,
        auth: {
          ...mockClient.auth,
          signInWithPassword: async () => {
            await simulateNetworkDelay(10000); // 10 segundos de atraso
            return { data: { user: null, session: null }, error: { message: 'Request timeout' } };
          }
        }
      };
      
    default:
      return mockClient;
  }
};
