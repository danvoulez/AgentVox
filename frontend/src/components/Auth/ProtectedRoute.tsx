import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Flex, Spinner, Text } from '@chakra-ui/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { session, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se estiver carregando, não fazer nada ainda
    if (session.isLoading) return;

    // Se não estiver autenticado, redirecionar para login
    if (!session.user) {
      router.push({
        pathname: '/auth/login',
        query: { redirectTo: router.asPath },
      });
      return;
    }

    // Se a rota for apenas para admin e o usuário não for admin, redirecionar para home
    if (adminOnly && !isAdmin) {
      router.push('/');
    }
  }, [session, isAdmin, router, adminOnly]);

  // Mostrar tela de carregamento enquanto verifica autenticação
  if (session.isLoading) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center" direction="column">
        <Spinner size="xl" mb={4} color="blue.500" />
        <Text>Carregando...</Text>
      </Flex>
    );
  }

  // Se precisar ser admin e não for, ou se não estiver autenticado, não renderizar conteúdo
  if ((adminOnly && !isAdmin) || !session.user) {
    return null;
  }

  // Se passou por todas as verificações, renderizar os filhos
  return <>{children}</>;
};

export default ProtectedRoute;
