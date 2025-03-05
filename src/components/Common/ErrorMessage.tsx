import React from 'react';
import { 
  Alert, 
  AlertIcon, 
  AlertTitle, 
  AlertDescription, 
  CloseButton,
  Box,
  Collapse
} from '@chakra-ui/react';

interface ErrorMessageProps {
  title?: string;
  message: string | null | undefined;
  isVisible: boolean;
  onClose?: () => void;
  status?: 'error' | 'warning' | 'info' | 'success';
}

/**
 * Error message component for displaying API errors and validation messages
 * Can be used for any type of alert message (error, warning, info, success)
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  isVisible,
  onClose,
  status = 'error'
}) => {
  if (!message || !isVisible) return null;

  return (
    <Collapse in={isVisible} animateOpacity>
      <Box my={4}>
        <Alert 
          status={status}
          variant="subtle"
          flexDirection="column"
          alignItems="start"
          borderRadius="md"
          py={3}
          px={4}
        >
          <Box width="100%" display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center">
              <AlertIcon />
              {title && <AlertTitle mr={2}>{title}</AlertTitle>}
            </Box>
            {onClose && (
              <CloseButton 
                size="sm" 
                onClick={onClose} 
                position="relative"
                right={-1}
                top={-1}
              />
            )}
          </Box>
          <AlertDescription mt={2}>
            {message}
          </AlertDescription>
        </Alert>
      </Box>
    </Collapse>
  );
};

export default ErrorMessage;
