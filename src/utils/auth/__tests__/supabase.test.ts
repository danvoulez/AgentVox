import { 
  createSupabaseClient, 
  isAuthenticated, 
  getCurrentUser, 
  getUserRole, 
  signIn, 
  signUp, 
  signOut 
} from '../supabase';
import { createClient } from '@supabase/supabase-js';

// Mock das variáveis de ambiente
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

// Mock do cliente Supabase
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
  })),
};

// Mock da função createClient
(createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

describe('Supabase Auth Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSupabaseClient', () => {
    it('deve criar um cliente Supabase com as configurações corretas', () => {
      const client = createSupabaseClient();
      
      expect(createClient).toHaveBeenCalledWith(
        'https://example.supabase.co',
        'anon-key',
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        }
      );
      
      expect(client).toBe(mockSupabaseClient);
    });
  });

  describe('isAuthenticated', () => {
    it('deve retornar true quando uma sessão existe', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'test-user-id' } } },
      });

      const result = await isAuthenticated();
      
      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('deve retornar false quando nenhuma sessão existe', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      });

      const result = await isAuthenticated();
      
      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('deve retornar o usuário atual quando autenticado', async () => {
      const mockUser = { id: 'test-user-id', email: 'test@example.com' };
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
      });

      const result = await getCurrentUser();
      
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('deve retornar null quando não autenticado', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const result = await getCurrentUser();
      
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('getUserRole', () => {
    it('deve retornar o papel do usuário quando encontrado', async () => {
      const mockUser = { id: 'test-user-id' };
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
      });
      
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: { role: 'admin' },
        error: null,
      });
      
      mockSupabaseClient.from.mockReturnValueOnce({
        select: mockSelect,
      });
      
      mockSelect.mockReturnValueOnce({
        eq: mockEq,
      });
      
      mockEq.mockReturnValueOnce({
        single: mockSingle,
      });

      const result = await getUserRole();
      
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_roles');
      expect(mockSelect).toHaveBeenCalledWith('role');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(result).toBe('admin');
    });

    it('deve retornar papel padrão "user" quando não encontrado', async () => {
      const mockUser = { id: 'test-user-id' };
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
      });
      
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });
      
      mockSupabaseClient.from.mockReturnValueOnce({
        select: mockSelect,
      });
      
      mockSelect.mockReturnValueOnce({
        eq: mockEq,
      });
      
      mockEq.mockReturnValueOnce({
        single: mockSingle,
      });

      const result = await getUserRole();
      
      expect(result).toBe('user');
    });

    it('deve retornar null quando usuário não está autenticado', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const result = await getUserRole();
      
      expect(result).toBeNull();
    });
  });

  describe('signIn', () => {
    it('deve chamar signInWithPassword com email e senha corretos', async () => {
      const mockResponse = { 
        data: { user: { id: 'test-user-id' }, session: {} },
        error: null 
      };
      
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce(mockResponse);

      await signIn('test@example.com', 'password');
      
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });
  });

  describe('signUp', () => {
    it('deve chamar signUp com email e senha corretos', async () => {
      const mockResponse = { 
        data: { user: { id: 'test-user-id' }, session: {} },
        error: null 
      };
      
      mockSupabaseClient.auth.signUp.mockResolvedValueOnce(mockResponse);

      await signUp('test@example.com', 'password');
      
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });
  });

  describe('signOut', () => {
    it('deve chamar signOut corretamente', async () => {
      const mockResponse = { error: null };
      mockSupabaseClient.auth.signOut.mockResolvedValueOnce(mockResponse);

      await signOut();
      
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });
  });
});
