import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, UserSession, getCurrentUser, getUserRole } from '@/utils/auth/supabase';
import { useRouter } from 'next/router';

// Definindo o contexto de autenticação
interface AuthContextType {
  session: UserSession;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provider de autenticação
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [session, setSession] = useState<UserSession>({
    user: null,
    session: null,
    isLoading: true,
  });
  const [isAdmin, setIsAdmin] = useState(false);

  // Atualizar a sessão quando o provedor é montado
  useEffect(() => {
    // Variável para controlar se o componente ainda está montado
    let isMounted = true;
    
    // Definir a sessão inicial
    const setInitialSession = async () => {
      try {
        // Primeiro, definimos isLoading como true para evitar flashes de conteúdo
        if (isMounted) {
          setSession(prevSession => ({
            ...prevSession,
            isLoading: true
          }));
        }
        
        const { data: { session: authSession } } = await supabase.auth.getSession();
        
        // Verificar se o componente ainda está montado antes de atualizar o estado
        if (!isMounted) return;
        
        // Se não há sessão, definir o estado como não autenticado e não carregando
        if (!authSession) {
          setSession({
            user: null,
            session: null,
            isLoading: false,
          });
          setIsAdmin(false);
          return;
        }
        
        // Se há sessão, obter informações do usuário
        const user = await getCurrentUser();
        const role = user ? await getUserRole() : null;
        
        // Verificar novamente se o componente está montado
        if (!isMounted) return;
        
        setSession({
          user: user ? { ...user, role } : null,
          session: authSession,
          isLoading: false,
        });
        
        setIsAdmin(role === 'admin');
      } catch (error) {
        console.error('Erro ao obter sessão:', error);
        if (isMounted) {
          setSession({ user: null, session: null, isLoading: false });
        }
      }
    };
    
    setInitialSession();

    // Configurar listener para mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, authSession) => {
      console.log(`Auth event: ${event}`);
      
      // Evitar processamento se o componente não estiver mais montado
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Definir isLoading como true para evitar flashes durante a transição
        setSession(prevSession => ({
          ...prevSession,
          isLoading: true
        }));
        
        const user = await getCurrentUser();
        const role = user ? await getUserRole() : null;
        
        // Verificar novamente se o componente está montado
        if (!isMounted) return;
        
        setSession({
          user: user ? { ...user, role } : null,
          session: authSession,
          isLoading: false,
        });
        
        setIsAdmin(role === 'admin');
        
        // Verificar se há um redirecionamento pendente no localStorage
        if (typeof window !== 'undefined') {
          const pendingRedirect = localStorage.getItem('pendingRedirect');
          if (pendingRedirect) {
            console.log('Redirecionando para:', pendingRedirect);
            // Limpar o redirecionamento pendente antes de redirecionar
            localStorage.removeItem('pendingRedirect');
            // Usar setTimeout para garantir que o estado foi atualizado antes do redirecionamento
            setTimeout(() => {
              router.replace(pendingRedirect);
            }, 100);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setSession({ user: null, session: null, isLoading: false });
        setIsAdmin(false);
        
        // Limpar qualquer redirecionamento pendente
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pendingRedirect');
        }
        
        // Usar replace em vez de push para evitar problemas com o histórico
        router.replace('/auth/login');
      }
    });

    // Limpar o listener quando o componente é desmontado
    return () => {
      isMounted = false;
      authListener.subscription?.unsubscribe();
    };
  }, [router]);

  // Funções de autenticação
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro durante login:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro durante registro:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Verificar se estamos em ambiente de desenvolvimento ou produção
      const isLocalhost = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
      
      // Usar o URL atual como base para o redirecionamento, garantindo que funcione
      // tanto em desenvolvimento quanto em produção
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          // Não definir um domínio específico, usar sempre o domínio atual
        },
      });

      console.log('Login com Google iniciado, redirecionando para:', `${window.location.origin}/api/auth/callback`);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro durante login com Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro durante logout:', error);
    }
  };

  const value = {
    session,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
