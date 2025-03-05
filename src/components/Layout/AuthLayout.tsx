import { ReactNode } from 'react';
import { Box, Container } from '@chakra-ui/react';
import AuthHeader from './AuthHeader';
import ProtectedRoute from '../Auth/ProtectedRoute';

interface AuthLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

const AuthLayout = ({ 
  children, 
  requireAuth = true,
  adminOnly = false 
}: AuthLayoutProps) => {
  // Se não exigir autenticação, renderizar normalmente
  if (!requireAuth) {
    return (
      <Box minH="100vh">
        <AuthHeader />
        <Container maxW="container.xl" py={8}>
          {children}
        </Container>
      </Box>
    );
  }

  // Se exigir autenticação, envolver com o componente ProtectedRoute
  return (
    <ProtectedRoute adminOnly={adminOnly}>
      <Box minH="100vh">
        <AuthHeader />
        <Container maxW="container.xl" py={8}>
          {children}
        </Container>
      </Box>
    </ProtectedRoute>
  );
};

export default AuthLayout;
