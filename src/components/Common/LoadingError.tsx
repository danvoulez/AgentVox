import React from 'react';
import { 
  Box, 
  Spinner, 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription,
  Button,
  Center,
  VStack,
  Text
} from '@chakra-ui/react';

interface LoadingErrorProps {
  isLoading: boolean;
  isError: boolean;
  error?: string | null;
  children: React.ReactNode;
  onRetry?: () => void;
  loadingText?: string;
  spinnerSize?: string;
}

/**
 * Component for handling loading states and errors
 * Shows a spinner during loading, an error message on error, and the children when ready
 */
const LoadingError: React.FC<LoadingErrorProps> = ({
  isLoading,
  isError,
  error,
  children,
  onRetry,
  loadingText = 'Carregando...',
  spinnerSize = 'lg'
}) => {
  if (isLoading) {
    return (
      <Center py={10}>
        <VStack spacing={4}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size={spinnerSize}
          />
          <Text color="gray.500">{loadingText}</Text>
        </VStack>
      </Center>
    );
  }

  if (isError) {
    return (
      <Box my={4}>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="md"
          p={6}
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Ocorreu um erro
          </AlertTitle>
          <AlertDescription maxWidth="sm" mb={4}>
            {error || 'Não foi possível carregar os dados. Por favor, tente novamente.'}
          </AlertDescription>
          {onRetry && (
            <Button colorScheme="red" onClick={onRetry} size="sm">
              Tentar novamente
            </Button>
          )}
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
};

export default LoadingError;
