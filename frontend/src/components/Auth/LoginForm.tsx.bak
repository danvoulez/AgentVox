import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import SocialLoginButtons from './SocialLoginButtons';
import { validateLoginForm } from '@/utils/auth/validation';

/**
 * Login form component
 */
const LoginForm = () => {
  // Form state
  const [formState, setFormState] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Get auth methods and other hooks
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  
  // Get redirect path if any
  const redirectTo = (router.query.redirectTo as string) || '/dashboard';
  
  /**
   * Updates form state when input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear specific field error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles form submission for email/password login
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = formState;
    
    // Validate form
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      // Field-specific validation
      if (validation.error?.includes('Email')) {
        setFormErrors({ email: validation.error });
      } else if (validation.error?.includes('Senha')) {
        setFormErrors({ password: validation.error });
      } else {
        setFormErrors({ form: validation.error });
      }
      return;
    }
    
    // Clear any previous errors
    setFormErrors({});
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) throw error;
      
      // Success notification
      toast({
        title: 'Login realizado com sucesso',
        variant: 'success',
        duration: 3000,
      });
      
      // Redirect to dashboard or specified redirect path
      router.push(redirectTo);
      
    } catch (error: any) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Credenciais inválidas ou conta inexistente';
      
      toast({
        title: 'Erro no login',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });
      
      setFormErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles Google login
   */
  const handleGoogleLogin = async () => {
    // Evitar cliques múltiplos no botão
    if (isGoogleLoading) return;
    
    setIsGoogleLoading(true);
    setFormErrors({});
    
    try {
      // Verificar conexão com Supabase antes de tentar login
      // Isso evita problemas de redirecionamento quando o Supabase não está acessível
      console.log('Iniciando login com Google...');
      
      // Desabilitar temporariamente o redirecionamento automático
      // para evitar problemas de piscar durante o processo de login
      const redirectTo = (router.query.redirectTo as string) || '/dashboard';
      localStorage.setItem('pendingRedirect', redirectTo);
      
      await signInWithGoogle();
      console.log('Login com Google iniciado, aguardando redirecionamento...');
      
      // O redirecionamento será tratado pelo listener de estado de autenticação no contexto
    } catch (error: any) {
      console.error('Erro durante login com Google:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Não foi possível autenticar com Google';
      
      toast({
        title: 'Erro na autenticação',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });
      
      // Limpar qualquer redirecionamento pendente em caso de erro
      localStorage.removeItem('pendingRedirect');
    } finally {
      // Definir um timeout antes de desativar o estado de carregamento
      // para evitar que o botão pisque rapidamente
      setTimeout(() => {
        setIsGoogleLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="w-full">
        
        {formErrors.form && (
          <p className="text-red-500 text-sm text-center mb-4">
            {formErrors.form}
          </p>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                autoComplete="email"
                className={formErrors.email ? 'border-red-500' : ''}
              />
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Senha</label>
              <Input
                id="password"
                type="password"
                name="password"
                value={formState.password}
                onChange={handleChange}
                placeholder="********"
                autoComplete="current-password"
                className={formErrors.password ? 'border-red-500' : ''}
              />
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
              )}
            </div>
            
            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-sm text-blue-500 hover:text-blue-700">
                Esqueceu sua senha?
              </Link>
            </div>
            
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
        
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-gray-300 absolute w-full"></div>
          <span className="bg-white px-2 text-sm text-gray-500 relative">
            ou
          </span>
        </div>
        
        <SocialLoginButtons
          onGoogleLogin={handleGoogleLogin}
          isLoading={isGoogleLoading}
        />
        
        <div className="text-center mt-4">
          <span className="text-sm">
            Não tem uma conta? {' '}
          </span>
          <Link href="/auth/signup" className="text-blue-500 hover:text-blue-700 font-medium">
            Registre-se agora
          </Link>
        </div>
      </div>
  );
};





export default LoginForm;
