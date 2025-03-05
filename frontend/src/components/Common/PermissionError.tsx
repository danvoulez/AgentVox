import React from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { LockIcon } from '@chakra-ui/icons';

interface PermissionErrorProps {
  title?: string;
  message?: string;
  showLoginButton?: boolean;
  showBackButton?: boolean;
  customAction?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Component for displaying permission/authorization errors
 * Provides options to navigate to login or go back
 */
const PermissionError: React.FC<PermissionErrorProps> = ({
  title = 'Acesso restrito',
  message = 'Você não tem permissão para acessar esta página ou recurso.',
  showLoginButton = true,
  showBackButton = true,
  customAction,
}) => {
  const router = useRouter();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogin = () => {
    router.push('/login');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <Box
      minH="60vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={bgColor}
      p={4}
    >
      <Box
        p={8}
        borderWidth={1}
        borderRadius="lg"
        borderColor={borderColor}
        bg={cardBgColor}
        boxShadow="md"
        maxW="md"
        width="100%"
        textAlign="center"
      >
        <Icon as={LockIcon} boxSize={12} color="red.500" mb={4} />
        
        <Heading size="lg" mb={2}>
          {title}
        </Heading>
        
        <Text color={useColorModeValue('gray.600', 'gray.400')} mb={6}>
          {message}
        </Text>
        
        <VStack spacing={3}>
          {showLoginButton && (
            <Button
              colorScheme="blue"
              width="full"
              onClick={handleLogin}
            >
              Fazer login
            </Button>
          )}
          
          {customAction && (
            <Button
              colorScheme="purple"
              width="full"
              onClick={customAction.onClick}
            >
              {customAction.label}
            </Button>
          )}
          
          {showBackButton && (
            <Button
              variant="outline"
              width="full"
              onClick={handleBack}
            >
              Voltar
            </Button>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default PermissionError;
