import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Heading, Text, Button, VStack, Code, useColorModeValue } from '@chakra-ui/react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch JavaScript errors in child components
 * Displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

/**
 * Default fallback UI for the ErrorBoundary
 */
const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('red.200', 'red.500');
  
  return (
    <Box
      p={6}
      m={4}
      borderRadius="md"
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack spacing={4} align="stretch">
        <Heading as="h2" size="md" color="red.500">
          Something went wrong
        </Heading>
        
        <Text>
          An error occurred in the application. You can try to recover by clicking the button below.
        </Text>
        
        {error && (
          <Box
            p={3}
            borderRadius="md"
            bg={useColorModeValue('gray.100', 'gray.700')}
            overflowX="auto"
          >
            <Code>{error.toString()}</Code>
          </Box>
        )}
        
        <Button
          colorScheme="red"
          onClick={resetErrorBoundary}
          size="sm"
          alignSelf="flex-start"
        >
          Try again
        </Button>
      </VStack>
    </Box>
  );
};

export default ErrorBoundary;
