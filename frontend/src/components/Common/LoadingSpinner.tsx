import React from 'react';
import { Spinner, Box, Text, Flex, useColorModeValue } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  color?: string;
}

/**
 * A reusable loading spinner component
 * Can be used as a standalone component or as a full-screen loader
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text,
  size = 'md',
  fullScreen = false,
  color,
}) => {
  const spinnerColor = color || useColorModeValue('blue.500', 'blue.300');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const spinner = (
    <Box textAlign="center">
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color={spinnerColor}
        size={size}
      />
      {text && (
        <Text mt={2} color={textColor} fontSize="sm">
          {text}
        </Text>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Flex
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex="overlay"
        bg={useColorModeValue('whiteAlpha.900', 'blackAlpha.900')}
        justify="center"
        align="center"
      >
        {spinner}
      </Flex>
    );
  }

  return spinner;
};

export default LoadingSpinner;
