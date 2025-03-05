import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

// Mock dos hooks
jest.mock('@/contexts/AuthContext');
jest.mock('next/router');
jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    ...originalModule,
    useToast: () => jest.fn(),
  };
});

describe('LoginForm Component', () => {
  const mockSignIn = jest.fn();
  const mockPush = jest.fn();
  
  beforeEach(() => {
    // Configuração padrão dos mocks
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
    });
    
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      query: {},
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('deve renderizar corretamente', () => {
    render(<LoginForm />);
    
    // Verificar elementos essenciais
    expect(screen.getByText('AgentVox')).toBeInTheDocument();
    expect(screen.getByText('Entre na sua conta para continuar')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByText('Esqueceu sua senha?')).toBeInTheDocument();
    expect(screen.getByText('Cadastre-se')).toBeInTheDocument();
  });
  
  it('deve atualizar os campos de entrada quando o usuário digita', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });
  
  it('deve chamar signIn e redirecionar quando login é bem-sucedido', async () => {
    // Configurar mock para login bem-sucedido
    mockSignIn.mockResolvedValueOnce({
      session: { user: { id: 'test-user-id' } },
    });
    
    render(<LoginForm />);
    
    // Preencher o formulário
    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Senha'), { 
      target: { value: 'password123' } 
    });
    
    // Enviar o formulário
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    
    // Verificar se signIn foi chamado com os parâmetros corretos
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    
    // Verificar se o redirecionamento acontece após login bem-sucedido
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
  
  it('deve redirecionar para a URL original após login quando redirectTo está definido', async () => {
    // Configurar mock para ter um redirectTo na query
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      query: { redirectTo: '/dashboard' },
    });
    
    // Configurar mock para login bem-sucedido
    mockSignIn.mockResolvedValueOnce({
      session: { user: { id: 'test-user-id' } },
    });
    
    render(<LoginForm />);
    
    // Preencher e enviar o formulário
    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Senha'), { 
      target: { value: 'password123' } 
    });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    
    // Verificar redirecionamento para URL original
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
  
  it('não deve chamar signIn quando os campos estão vazios', async () => {
    render(<LoginForm />);
    
    // Tentar enviar o formulário sem preencher os campos
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    
    // Verificar que signIn não foi chamado
    expect(mockSignIn).not.toHaveBeenCalled();
  });
  
  it('deve definir isLoading como true durante o processo de login', async () => {
    // Configurar um delay no mock de signIn para simular processo assíncrono
    mockSignIn.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ session: { user: { id: 'test-user-id' } } });
        }, 100);
      });
    });
    
    render(<LoginForm />);
    
    // Preencher o formulário
    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Senha'), { 
      target: { value: 'password123' } 
    });
    
    // Enviar o formulário
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    
    // Verificar que o botão está em estado de carregamento
    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeInTheDocument();
    
    // Aguardar a conclusão do login
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });
});
