import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  ErrorMessage, 
  NetworkError, 
  ValidationError, 
  TimeoutError 
} from '@/components/Common';
import { Box } from '@chakra-ui/react';

type ErrorType = 'network' | 'validation' | 'timeout' | 'general' | null;

interface ErrorContextType {
  error: {
    type: ErrorType;
    message: string;
  } | null;
  setError: (type: ErrorType, message: string) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError deve ser usado dentro de um ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setErrorState] = useState<{
    type: ErrorType;
    message: string;
  } | null>(null);

  const setError = (type: ErrorType, message: string) => {
    setErrorState({ type, message });
  };

  const clearError = () => {
    setErrorState(null);
  };

  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {error ? (
        <Box position="fixed" top={4} right={4} zIndex={9999} maxW="sm">
          {error.type === 'network' && <NetworkError message={error.message} />}
          {error.type === 'validation' && <ValidationError message={error.message} />}
          {error.type === 'timeout' && <TimeoutError message={error.message} />}
          {error.type === 'general' && <ErrorMessage message={error.message} />}
        </Box>
      ) : null}
      {children}
    </ErrorContext.Provider>
  );
};
