import React from 'react';
import { Box, Heading, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/router';

interface NotFoundProps {
  title?: string;
  message?: string;
  buttonText?: string;
  redirectPath?: string;
}

/**
 * Not Found component for 404 pages or when resources aren't found
 */
const NotFound: React.FC<NotFoundProps> = ({
  title = 'Página não encontrada',
  message = 'A página que você está procurando não existe ou foi movida.',
  buttonText = 'Voltar para a página inicial',
  redirectPath = '/'
}) => {
  const router = useRouter();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleRedirect = () => {
    router.push(redirectPath);
  };

  return (
    <Box
      p={8}
      m={4}
      borderRadius="lg"
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      textAlign="center"
    >
      <VStack spacing={6}>
        <Heading as="h1" size="4xl" color="gray.400">
          404
        </Heading>
        
        <Heading as="h2" size="xl">
          {title}
        </Heading>
        
        <Text fontSize="lg" color="gray.500">
          {message}
        </Text>
        
        <Button
          colorScheme="blue"
          onClick={handleRedirect}
          size="lg"
          mt={4}
        >
          {buttonText}
        </Button>
      </VStack>
    </Box>
  );
};

export default NotFound;
