import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Head from 'next/head';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Text,
  VStack,
  useColorModeValue,
  List,
  ListItem,
  ListIcon,
  HStack,
  Progress,
} from '@chakra-ui/react';
import { CheckCircleIcon, CheckIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { FaMicrophone, FaRegLightbulb, FaRegComments } from 'react-icons/fa';

const WelcomePage = () => {
  const router = useRouter();
  const { session } = useAuth();
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    // Se não estiver autenticado, redirecionar para login
    if (!session.isLoading && !session.user) {
      router.push('/auth/login');
      return;
    }

    // Animação de carregamento
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setCompleted(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [router, session]);

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <Head>
        <title>{`Bem-vindo ao AgentVox | Comece sua jornada`}</title>
        <meta name="description" content="Bem-vindo à plataforma AgentVox" />
      </Head>

      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <Container maxW="container.md" py={12}>
          <VStack 
            spacing={8} 
            align="stretch" 
            bg={bgColor} 
            p={8} 
            borderRadius="lg" 
            boxShadow="lg"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Flex direction="column" align="center" textAlign="center">
              <Icon as={CheckCircleIcon} w={16} h={16} color="green.500" mb={4} />
              
              <Heading as="h1" size="xl" mb={2}>
                Bem-vindo ao AgentVox!
              </Heading>
              
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Sua conta foi verificada com sucesso. Estamos muito felizes em ter você conosco!
              </Text>
            </Flex>

            {!completed ? (
              <Box w="100%">
                <Text mb={2} fontWeight="medium" textAlign="center">
                  Preparando sua experiência...
                </Text>
                <Progress value={progress} size="md" colorScheme="blue" borderRadius="md" />
              </Box>
            ) : (
              <VStack spacing={8} align="stretch">
                <Box p={6} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
                  <Heading as="h2" size="md" mb={4}>
                    Com o AgentVox, você pode:
                  </Heading>
                  
                  <List spacing={3}>
                    <ListItem>
                      <HStack>
                        <ListIcon as={FaMicrophone} color="blue.500" fontSize="xl" />
                        <Text>Transformar sua voz em comandos inteligentes</Text>
                      </HStack>
                    </ListItem>
                    <ListItem>
                      <HStack>
                        <ListIcon as={FaRegLightbulb} color="yellow.500" fontSize="xl" />
                        <Text>Acessar insights baseados em suas interações</Text>
                      </HStack>
                    </ListItem>
                    <ListItem>
                      <HStack>
                        <ListIcon as={FaRegComments} color="green.500" fontSize="xl" />
                        <Text>Gerenciar suas memórias e interações facilmente</Text>
                      </HStack>
                    </ListItem>
                  </List>
                </Box>

                <Box textAlign="center">
                  <Text mb={6} fontSize="lg">
                    Pronto para começar sua jornada?
                  </Text>
                  
                  <Button 
                    rightIcon={<ArrowForwardIcon />} 
                    colorScheme="blue" 
                    size="lg" 
                    onClick={handleGetStarted}
                  >
                    Começar Agora
                  </Button>
                </Box>
              </VStack>
            )}
          </VStack>
        </Container>
      </Flex>
    </>
  );
};

export default WelcomePage;
