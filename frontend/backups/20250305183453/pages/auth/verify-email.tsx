import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  Link as ChakraLink,
} from '@chakra-ui/react';
import Link from 'next/link';
import { supabase } from '@/utils/auth/supabase';

const VerifyEmailPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Verificar se a URL contém um token de confirmação
  useEffect(() => {
    const checkEmailVerification = async () => {
      try {
        // Verificar se há um token na URL
        const { token_hash, type } = router.query;
        
        // Se há um token de confirmação de email
        if (token_hash && type === 'signup') {
          setIsChecking(true);
          
          // Verificar o token
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token_hash as string,
            type: 'signup',
          });
          
          if (error) {
            throw error;
          }
          
          setIsVerified(true);
          
          // Redirecionar após 3 segundos para a página de boas-vindas
          setTimeout(() => {
            router.push('/auth/welcome');
          }, 3000);
        } else {
          // Se não há token, apenas mostrar a página de instruções
          // Tentar recuperar o email do usuário da storage local
          const lastEmail = localStorage.getItem('signupEmail');
          if (lastEmail) {
            setEmail(lastEmail);
          }
          setIsChecking(false);
        }
      } catch (error: any) {
        console.error('Erro ao verificar email:', error);
        setErrorMessage(error.message || 'Erro ao verificar o e-mail');
        setIsChecking(false);
      }
    };
    
    checkEmailVerification();
  }, [router]);

  return (
    <>
      <Head>
        <title>{`Verificação de Email | AgentVox`}</title>
        <meta name="description" content="Verificação de email para a plataforma AgentVox" />
      </Head>
      
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <Box
          p={8}
          maxWidth="500px"
          borderWidth={1}
          borderRadius={8}
          boxShadow="lg"
          bg="white"
          width="100%"
          textAlign="center"
        >
          <Heading size="xl" mb={4}>AgentVox</Heading>
          
          {isChecking ? (
            <VStack spacing={4}>
              <Text fontSize="lg">Verificando...</Text>
            </VStack>
          ) : isVerified ? (
            <Alert
              status="success"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              borderRadius="md"
              py={4}
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Email Verificado!
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                Seu email foi verificado com sucesso. Você será redirecionado para a página de login em instantes.
              </AlertDescription>
            </Alert>
          ) : (
            <VStack spacing={6}>
              <Heading size="md">Verifique seu Email</Heading>
              
              {errorMessage && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              <Text>
                {email 
                  ? `Enviamos um link de confirmação para ${email}` 
                  : 'Enviamos um link de confirmação para o seu email'}
              </Text>
              
              <Text>
                Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
              </Text>
              
              <Text fontSize="sm" color="gray.600">
                Não recebeu o email? Verifique sua pasta de spam ou
                <ChakraLink as={Link} href="/auth/signup" color="blue.500" ml={1}>
                  tente novamente
                </ChakraLink>
              </Text>
              
              <Button
                colorScheme="blue"
                width="100%"
                onClick={() => router.push('/auth/login')}
                mt={4}
              >
                Voltar para o Login
              </Button>
            </VStack>
          )}
        </Box>
      </Flex>
    </>
  );
};

export default VerifyEmailPage;
