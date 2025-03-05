import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  useToast,
  Link,
  Flex,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { resetPassword } from '@/utils/auth/supabase';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, informe seu email.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) throw error;
      
      setIsSubmitted(true);
      
      // Armazenar o email para uso na página de verificação
      localStorage.setItem('resetEmail', email);
      
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar o email',
        description: error instanceof Error ? error.message : 'Houve um erro ao processar sua solicitação.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{`Recuperar Senha | AgentVox`}</title>
        <meta name="description" content="Recupere sua senha da plataforma AgentVox" />
      </Head>
      
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <Box
          p={8}
          maxWidth="400px"
          borderWidth={1}
          borderRadius={8}
          boxShadow="lg"
          bg="white"
          width="100%"
        >
          <Box textAlign="center" mb={8}>
            <Heading size="xl">AgentVox</Heading>
            <Text mt={2} color="gray.600">
              Recuperação de senha
            </Text>
          </Box>
          
          {isSubmitted ? (
            <Box textAlign="center">
              <Alert status="success" borderRadius="md" mb={4}>
                <AlertIcon />
                Email para redefinição de senha enviado!
              </Alert>
              
              <Text mb={4}>
                Enviamos um link para redefinir sua senha para <strong>{email}</strong>.
              </Text>
              
              <Text mb={6}>
                Por favor, verifique sua caixa de entrada e clique no link para criar uma nova senha.
              </Text>
              
              <Button 
                onClick={() => router.push('/auth/login')}
                colorScheme="blue" 
                width="100%"
              >
                Voltar para o Login
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleResetPassword}>
              <Stack spacing={4}>
                <Text mb={2}>
                  Informe o email associado à sua conta para receber instruções de recuperação de senha.
                </Text>
                
                <FormControl id="email" isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </FormControl>
                
                <Button
                  colorScheme="blue"
                  type="submit"
                  isLoading={isLoading}
                  loadingText="Enviando..."
                  width="100%"
                  mt={4}
                >
                  Enviar Link de Recuperação
                </Button>
                
                <Box textAlign="center">
                  <Link color="blue.500" href="/auth/login">
                    Voltar para o Login
                  </Link>
                </Box>
              </Stack>
            </form>
          )}
        </Box>
      </Flex>
    </>
  );
};

export default ForgotPasswordPage;
