import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Box,
  Collapse,
  Code,
  useDisclosure,
} from '@chakra-ui/react';

interface NetworkErrorProps {
  error: Error | null | undefined | string;
  title?: string;
  onRetry?: () => void;
  showDetails?: boolean;
  isVisible?: boolean;
}

/**
 * Component for displaying network/API errors with retry functionality
 * Can show technical details for debugging purposes
 */
const NetworkError: React.FC<NetworkErrorProps> = ({
  error,
  title = 'Erro de conexão',
  onRetry,
  showDetails = false,
  isVisible = true,
}) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });

  if (!error || !isVisible) return null;

  // Handle different error types
  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || 'Ocorreu um erro de conexão';
  
  // Extract status code if available
  const statusMatch = errorMessage.match(/(\d{3})/);
  const statusCode = statusMatch ? statusMatch[0] : null;
  
  // Determine if it's a network error
  const isNetworkError = errorMessage.toLowerCase().includes('network') || 
    errorMessage.toLowerCase().includes('conexão') ||
    errorMessage.toLowerCase().includes('timeout');

  const finalTitle = statusCode 
    ? `${title} (${statusCode})` 
    : isNetworkError 
      ? 'Erro de conexão com a internet'
      : title;

  return (
    <Alert 
      status="error" 
      variant="subtle" 
      flexDirection="column" 
      alignItems="start" 
      borderRadius="md"
      p={4}
    >
      <Box width="100%" mb={2}>
        <Box display="flex" alignItems="flex-start">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontSize="md">{finalTitle}</AlertTitle>
            <AlertDescription fontSize="sm">
              {errorMessage}
            </AlertDescription>
          </Box>
        </Box>
      </Box>

      {showDetails && (
        <Box width="100%">
          <Button 
            size="sm" 
            variant="link" 
            onClick={onToggle} 
            colorScheme="red"
            mb={isOpen ? 2 : 0}
          >
            {isOpen ? 'Ocultar detalhes' : 'Mostrar detalhes'}
          </Button>
          
          <Collapse in={isOpen} animateOpacity>
            <Code p={2} borderRadius="md" width="100%" fontSize="xs" whiteSpace="pre-wrap">
              {typeof error === 'string' 
                ? error 
                : JSON.stringify(error, null, 2) || errorMessage}
            </Code>
          </Collapse>
        </Box>
      )}

      {onRetry && (
        <Button 
          size="sm" 
          colorScheme="red" 
          variant="outline" 
          onClick={onRetry}
          mt={2}
        >
          Tentar novamente
        </Button>
      )}
    </Alert>
  );
};

export default NetworkError;
