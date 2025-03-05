import React from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Box,
  Collapse,
  AlertStatus,
} from '@chakra-ui/react';

interface AlertMessageProps {
  status: AlertStatus;
  title?: string;
  message: string | null | undefined;
  isVisible: boolean;
  onClose?: () => void;
  showIcon?: boolean;
}

/**
 * Alert message component for displaying various types of alerts
 * Can be used for success, error, warning, or info messages
 */
const AlertMessage: React.FC<AlertMessageProps> = ({
  status,
  title,
  message,
  isVisible,
  onClose,
  showIcon = true,
}) => {
  if (!message || !isVisible) return null;

  return (
    <Collapse in={isVisible} animateOpacity>
      <Box my={4}>
        <Alert 
          status={status}
          variant="subtle"
          borderRadius="md"
          py={3}
          px={4}
        >
          <Box width="100%" display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box display="flex" alignItems={title ? "flex-start" : "center"}>
              {showIcon && <AlertIcon mt={title ? 1 : 0} />}
              <Box>
                {title && <AlertTitle fontWeight="bold">{title}</AlertTitle>}
                <AlertDescription>{message}</AlertDescription>
              </Box>
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
        </Alert>
      </Box>
    </Collapse>
  );
};

export default AlertMessage;
