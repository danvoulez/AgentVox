import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Box,
  Text,
  Progress,
  VStack,
} from '@chakra-ui/react';
import { TimeIcon } from '@chakra-ui/icons';

interface TimeoutErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onCancel?: () => void;
  isVisible?: boolean;
  timeout?: number; // in seconds
  showProgress?: boolean;
}

/**
 * Component for displaying timeout errors with retry functionality
 * Can show a progress bar for countdown
 */
const TimeoutError: React.FC<TimeoutErrorProps> = ({
  title = 'Tempo limite excedido',
  message = 'A operação demorou mais do que o esperado para ser concluída.',
  onRetry,
  onCancel,
  isVisible = true,
  timeout = 30,
  showProgress = false,
}) => {
  const [timeLeft, setTimeLeft] = React.useState(timeout);
  const [isCountingDown, setIsCountingDown] = React.useState(false);
  
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isCountingDown && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isCountingDown && timeLeft === 0) {
      setIsCountingDown(false);
      if (onRetry) onRetry();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCountingDown, timeLeft, onRetry]);
  
  const handleRetryWithCountdown = () => {
    setTimeLeft(timeout);
    setIsCountingDown(true);
  };
  
  const handleCancelCountdown = () => {
    setIsCountingDown(false);
    setTimeLeft(timeout);
    if (onCancel) onCancel();
  };

  if (!isVisible) return null;

  return (
    <Alert
      status="warning"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      borderRadius="md"
      p={4}
    >
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        {title}
      </AlertTitle>
      <AlertDescription maxWidth="sm">
        <Text>{message}</Text>
        
        {showProgress && isCountingDown && (
          <VStack mt={4} spacing={2} width="100%">
            <Box width="100%" display="flex" justifyContent="space-between">
              <Text fontSize="sm" display="flex" alignItems="center">
                <TimeIcon mr={1} /> Tentando novamente em:
              </Text>
              <Text fontWeight="bold">{timeLeft}s</Text>
            </Box>
            <Progress
              value={(timeLeft / timeout) * 100}
              size="sm"
              width="100%"
              colorScheme="orange"
              borderRadius="full"
            />
          </VStack>
        )}
        
        <Box mt={4} display="flex" justifyContent="center" gap={3}>
          {onRetry && !isCountingDown && (
            <Button
              colorScheme="orange"
              onClick={showProgress ? handleRetryWithCountdown : onRetry}
            >
              Tentar novamente
            </Button>
          )}
          
          {isCountingDown && (
            <Button
              variant="outline"
              onClick={handleCancelCountdown}
            >
              Cancelar
            </Button>
          )}
          
          {onCancel && !isCountingDown && (
            <Button
              variant="ghost"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
        </Box>
      </AlertDescription>
    </Alert>
  );
};

export default TimeoutError;
