import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '@/utils/auth/supabase';

// Mock do supabase
jest.mock('@/utils/auth/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })),
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
  },
  getCurrentUser: jest.fn(),
  getUserRole: jest.fn(),
}));

// Mock do useRouter
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Componente de teste para acessar o contexto
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{auth.session.isLoading.toString()}</div>
      <div data-testid="user">
        {auth.session.user ? JSON.stringify(auth.session.user) : 'null'}
      </div>
      <div data-testid="isAdmin">{auth.isAdmin.toString()}</div>
      <button onClick={() => auth.signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button onClick={() => auth.signUp('test@example.com', 'password')}>
        Sign Up
      </button>
      <button onClick={() => auth.signOut()}>Sign Out</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve inicializar com estado de carregamento', async () => {
    // Mock da resposta do getSession
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Inicialmente está carregando
    expect(screen.getByTestId('loading').textContent).toBe('true');
    
    // Esperar pelo carregamento
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Usuário deve ser null por padrão
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('isAdmin').textContent).toBe('false');
  });

  it('deve definir usuário quando autenticado', async () => {
    const mockUser = { id: 'test-id', email: 'test@example.com' };
    const mockSession = { user: mockUser };
    
    // Mock das respostas
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession },
    });
    
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
    });
    
    // Mock da resposta getUserRole
    jest.requireMock('@/utils/auth/supabase').getUserRole.mockResolvedValueOnce('user');
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Usuário deve estar definido
    const userContent = screen.getByTestId('user').textContent;
    expect(userContent).toContain('test-id');
    expect(userContent).toContain('test@example.com');
  });

  it('deve definir isAdmin como true quando usuário é admin', async () => {
    const mockUser = { id: 'admin-id', email: 'admin@example.com' };
    const mockSession = { user: mockUser };
    
    // Mock das respostas
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: mockSession },
    });
    
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
    });
    
    // Mock da resposta getUserRole como 'admin'
    jest.requireMock('@/utils/auth/supabase').getUserRole.mockResolvedValueOnce('admin');
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
      expect(screen.getByTestId('isAdmin').textContent).toBe('true');
    });
  });

  it('deve chamar supabase.auth.signInWithPassword quando signIn é chamado', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
    });
    
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'test-id' } } },
      error: null,
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Clicar no botão de login
    await act(async () => {
      screen.getByText('Sign In').click();
    });
    
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('deve chamar supabase.auth.signUp quando signUp é chamado', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
    });
    
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: 'new-id' } },
      error: null,
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Clicar no botão de cadastro
    await act(async () => {
      screen.getByText('Sign Up').click();
    });
    
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('deve chamar supabase.auth.signOut quando signOut é chamado', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    // Clicar no botão de logout
    await act(async () => {
      screen.getByText('Sign Out').click();
    });
    
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
