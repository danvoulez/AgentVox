import React from 'react';
import { Box, Text, List, ListItem, ListIcon } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';

interface ValidationErrorProps {
  errors: string[] | string | null | undefined;
  showIcon?: boolean;
  color?: string;
  fontSize?: string;
  mt?: string | number;
  mb?: string | number;
}

/**
 * Component for displaying validation errors in forms
 * Can display a single error string or an array of error strings
 */
const ValidationError: React.FC<ValidationErrorProps> = ({
  errors,
  showIcon = true,
  color = 'red.500',
  fontSize = 'sm',
  mt = 1,
  mb = 0,
}) => {
  if (!errors) return null;

  const errorArray = Array.isArray(errors) ? errors : [errors];
  
  // Filter out any empty strings or nulls
  const filteredErrors = errorArray.filter(error => error);
  
  if (filteredErrors.length === 0) return null;

  return (
    <Box mt={mt} mb={mb}>
      {filteredErrors.length === 1 ? (
        <Text color={color} fontSize={fontSize} display="flex" alignItems="center">
          {showIcon && <WarningIcon mr={2} boxSize="0.8em" />}
          {filteredErrors[0]}
        </Text>
      ) : (
        <List spacing={1}>
          {filteredErrors.map((error, index) => (
            <ListItem 
              key={index} 
              color={color} 
              fontSize={fontSize}
              display="flex"
              alignItems="center"
            >
              {showIcon && <ListIcon as={WarningIcon} color={color} />}
              {error}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ValidationError;
