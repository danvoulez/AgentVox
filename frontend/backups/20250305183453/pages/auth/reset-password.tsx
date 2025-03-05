import { useState, useEffect } from 'react';
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
  Flex,
  FormHelperText,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { supabase, updatePassword } from '@/utils/auth/supabase';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const router = useRouter();
  const toast = useToast();

  // Verificar o token ao carregar a página
  useEffect(() => {
    const checkToken = async () => {
      try {
        // Obter os parâmetros da URL
        const { token_hash, type } = router.query;
        
        // Verificar se o token é válido
        if (token_hash && type === 'recovery') {
          // Verificar o token com o Supabase
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token_hash as string,
            type: 'recovery',
          });
          
          if (error) {
            throw error;
          }
          
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
        }
      } catch (error: any) {
        console.error('Token inválido:', error);
        setIsTokenValid(false);
        
        toast({
          title: 'Link inválido',
          description: 'O link de redefinição de senha expirou ou é inválido.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsValidating(false);
      }
    };
    
    if (router.isReady) {
      checkToken();
    }
  }, [router.isReady, router.query, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!password || !confirmPassword) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'A senha e a confirmação de senha devem ser iguais.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Validação de força da senha
    if (password.length < 8) {
      toast({
        title: 'Senha fraca',
        description: 'A senha deve ter pelo menos 8 caracteres.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await updatePassword(password);
      
      if (error) throw error;
      
      toast({
        title: 'Senha atualizada',
        description: 'Sua senha foi redefinida com sucesso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirecionar para a página de login após 2 segundos
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      
    } catch (error: any) {
      toast({
        title: 'Erro ao redefinir senha',
        description: error instanceof Error ? error.message : 'Houve um erro ao redefinir sua senha.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Se ainda estiver validando o token, mostrar mensagem de carregamento
  if (isValidating) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <Box textAlign="center">
          <Heading size="md" mb={4}>Verificando...</Heading>
          <Text>Por favor, aguarde enquanto validamos seu link de redefinição de senha.</Text>
        </Box>
      </Flex>
    );
  }

  // Se o token for inválido, mostrar mensagem de erro
  if (!isTokenValid) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <Box 
          p={8}
          maxWidth="400px"
          borderWidth={1}
          borderRadius={8}
          boxShadow="lg"
          bg="white"
          width="100%"
          textAlign="center"
        >
          <Heading size="xl" mb={4}>AgentVox</Heading>
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            Link inválido ou expirado
          </Alert>
          <Text mb={6}>
            O link para redefinição de senha é inválido ou expirou. Por favor, solicite um novo link.
          </Text>
          <Button 
            onClick={() => router.push('/auth/forgot-password')}
            colorScheme="blue" 
            width="100%"
          >
            Solicitar novo link
          </Button>
        </Box>
      </Flex>
    );
  }

  return (
    <>
      <Head>
        <title>{`Redefinir Senha | AgentVox`}</title>
        <meta name="description" content="Redefina sua senha da plataforma AgentVox" />
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
              Crie uma nova senha
            </Text>
          </Box>
          
          <form onSubmit={handleResetPassword}>
            <Stack spacing={4}>
              <FormControl id="password" isRequired>
                <FormLabel>Nova Senha</FormLabel>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                />
                <FormHelperText>
                  A senha deve ter pelo menos 8 caracteres
                </FormHelperText>
              </FormControl>
              
              <FormControl id="confirmPassword" isRequired>
                <FormLabel>Confirmar Nova Senha</FormLabel>
                <Input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="******"
                />
              </FormControl>
              
              <Button
                colorScheme="blue"
                type="submit"
                isLoading={isLoading}
                loadingText="Atualizando..."
                width="100%"
                mt={4}
              >
                Redefinir Senha
              </Button>
            </Stack>
          </form>
        </Box>
      </Flex>
    </>
  );
};

export default ResetPasswordPage;
