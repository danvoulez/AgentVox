import React from 'react';
import { Text, TextProps } from '@chakra-ui/react';

interface FormErrorMessageProps extends TextProps {
  children: React.ReactNode;
}

/**
 * Custom form error message component
 * Displays validation errors with consistent styling
 */
const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ children, ...props }) => {
  if (!children) return null;
  
  return (
    <Text
      color="red.500"
      fontSize="sm"
      mt={1}
      {...props}
    >
      {children}
    </Text>
  );
};

export default FormErrorMessage;
