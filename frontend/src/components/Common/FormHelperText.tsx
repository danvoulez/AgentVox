import React from 'react';
import { Text, TextProps } from '@chakra-ui/react';

interface FormHelperTextProps extends TextProps {
  children: React.ReactNode;
}

/**
 * Custom form helper text component
 * Provides additional guidance or information about form fields
 */
const FormHelperText: React.FC<FormHelperTextProps> = ({ children, ...props }) => {
  if (!children) return null;
  
  return (
    <Text
      fontSize="sm"
      color="gray.500"
      mt={1}
      {...props}
    >
      {children}
    </Text>
  );
};

export default FormHelperText;
