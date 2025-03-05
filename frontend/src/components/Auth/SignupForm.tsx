import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { checkSupabaseConnection } from '@/utils/auth/supabase';
import { checkEnvVariables, getConfigErrorMessage } from '@/utils/auth/testConfig';
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
  Link as ChakraLink,
  Flex,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { FormErrorMessage, FormHelperText } from '@/components/Common';
import SocialLoginButtons from './SocialLoginButtons';
import { validateSignupForm } from '@/utils/auth/validation';

/**
 * Signup form component
 */
const SignupForm = () => {
  // Form state
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{connected: boolean; error?: string} | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  
  // Get auth methods and other hooks
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const toast = useToast();
  
  // Verificar configuração e conexão com Supabase ao carregar
  useEffect(() => {
    // Verificar configuração primeiro
    const envStatus = checkEnvVariables();
    if (envStatus.hasConfigIssues) {
      const errorMsg = getConfigErrorMessage();
      console.error('Problema de configuração do Supabase:', errorMsg);
      setConfigError(errorMsg);
      return; // Não tenta verificar conexão se há problemas de configuração
    }
    
    // Se a configuração estiver OK, verificar conexão
    const verifyConnection = async () => {
      try {
        const status = await checkSupabaseConnection();
        setConnectionStatus(status);
        if (!status.connected) {
          console.error('Falha na conexão com Supabase:', status.error);
          setFormErrors({ form: `Falha na conexão com o servidor: ${status.error || 'Verifique sua conexão com a internet'}` });
        }
      } catch (err: any) {
        console.error('Erro ao verificar conexão:', err);
        setConnectionStatus({ connected: false, error: 'Falha ao verificar conexão com o servidor' });
        setFormErrors({ form: 'Falha ao verificar conexão com o servidor' });
      }
    };
    
    verifyConnection();
  }, []);

  /**
   * Updates form state when input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear specific field error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handles form submission for account creation
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password, confirmPassword } = formState;
    
    console.log('Iniciando processo de cadastro');
    
    // Validate form
    const validation = validateSignupForm(email, password, confirmPassword);
    if (!validation.isValid) {
      console.log('Validação do formulário falhou:', validation.error);
      // Field-specific validation
      if (validation.error?.includes('Email')) {
        setFormErrors({ email: validation.error });
      } else if (validation.error?.includes('Senha') && !validation.error.includes('coincidem')) {
        setFormErrors({ password: validation.error });
      } else if (validation.error?.includes('coincidem')) {
        setFormErrors({ confirmPassword: validation.error });
      } else {
        setFormErrors({ form: validation.error });
      }
      return;
    }
    
    // Clear any previous errors
    setFormErrors({});
    setIsLoading(true);
    
    try {
      // Verificar conexão antes de tentar cadastro
      console.log('Verificando conexão com o servidor...');
      const connectionCheck = await checkSupabaseConnection();
      console.log('Resultado da verificação de conexão:', connectionCheck);
      
      if (!connectionCheck.connected) {
        const errorMsg = `Falha na conexão com o servidor: ${connectionCheck.error || 'Verifique sua conexão com a internet'}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Conexão OK. Tentando cadastro com:', { email });
      
      let response;
      try {
        response = await signUp(email, password);
        console.log('Resposta completa do signUp:', response);
      } catch (signUpError: any) {
        console.error('Exceção durante signUp:', signUpError);
        throw signUpError;
      }
      
      const { error, user } = response;
      
      if (error) {
        console.error('Erro de cadastro detalhado:', {
          message: error.message,
          name: error.name,
          status: error?.status,
          details: error?.details
        });
        throw error;
      }
      
      // Success notification
      toast({
        title: 'Conta criada com sucesso',
        description: 'Verifique seu email para confirmar o cadastro.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect to registration success page
      router.push({
        pathname: '/auth/registration-success',
        query: { email }
      });
      
    } catch (error: any) {
      console.error('Erro durante cadastro:', error);
      
      // Registrar informações detalhadas sobre o erro
      console.error('Detalhes do erro:', {
        message: error.message || 'Sem mensagem',
        name: error.name || 'N/A',
        stack: error.stack ? 'Presente' : 'Ausente',
        code: error.code || 'N/A',
        status: error.status || 'N/A',
        details: error.details ? JSON.stringify(error.details) : 'N/A'
      });
      
      let errorMessage = '';
      
      // Handle specific error types
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        errorMessage = 'Erro de conexão com o servidor. Verifique sua conexão com a internet e tente novamente.';
        setFormErrors({ form: errorMessage });
      } else if (error.message?.includes('Email already registered') || error.message?.includes('already exists')) {
        errorMessage = 'Este email já está registrado';
        setFormErrors({ email: errorMessage });
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Email inválido';
        setFormErrors({ email: errorMessage });
      } else if (error.message?.includes('Password')) {
        errorMessage = error.message;
        setFormErrors({ password: errorMessage });
      } else {
        // Generic error
        errorMessage = error instanceof Error ? error.message : 'Houve um erro ao criar sua conta';
        setFormErrors({ form: errorMessage });
      }
      
      toast({
        title: 'Erro no cadastro',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handles Google login/signup
   */
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    console.log('Iniciando login com Google...');
    
    try {
      // Verificar conexão antes de tentar login com Google
      const connectionCheck = await checkSupabaseConnection();
      console.log('Verificação de conexão para Google login:', connectionCheck);
      
      if (!connectionCheck.connected) {
        throw new Error(`Falha na conexão com o servidor: ${connectionCheck.error || 'Verifique sua conexão com a internet'}`);
      }
      
      console.log('Tentando login com Google...');
      const response = await signInWithGoogle();
      console.log('Resposta do login com Google:', response);
      // Auth state listener in context will handle redirect
    } catch (error: any) {
      console.error('Erro durante login com Google:', error);
      console.error('Detalhes do erro Google:', {
        message: error.message || 'Sem mensagem',
        name: error.name || 'N/A',
        code: error.code || 'N/A',
        stack: error.stack ? 'Presente' : 'Ausente'
      });
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Não foi possível autenticar com Google';
      
      toast({
        title: 'Erro na autenticação',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      setFormErrors({ form: `Erro ao fazer login com Google: ${errorMessage}` });
    } finally {
      setIsLoading(false);
    }
  };

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
      >
        <Box textAlign="center" mb={8}>
          <Heading size="xl">AgentVox</Heading>
          <Text mt={2} color="gray.600">
            Crie sua conta para continuar
          </Text>
        </Box>
        
        {/* Configuration error */}
        {configError && (
          <Box mb={4} p={4} bg="orange.50" borderRadius="md" borderWidth="1px" borderColor="orange.300">
            <Heading size="sm" color="orange.700" mb={2}>Erro de Configuração</Heading>
            <Text color="orange.700" fontSize="sm">
              {configError}
            </Text>
            <Text mt={2} fontSize="xs" color="orange.600">
              O administrador do sistema precisa configurar as variáveis de ambiente no arquivo .env.local
            </Text>
          </Box>
        )}
        
        {/* Connection status */}
        {!configError && connectionStatus && !connectionStatus.connected && (
          <Box mb={4} p={3} bg="red.50" borderRadius="md" borderWidth="1px" borderColor="red.200">
            <Text color="red.500" fontSize="sm" textAlign="center">
              Problema de conexão: {connectionStatus.error || 'Verifique sua conexão com a internet'}
              <Button 
                size="xs" 
                colorScheme="red" 
                variant="link" 
                ml={2} 
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </Button>
            </Text>
          </Box>
        )}
        
        {formErrors.form && (
          <Text color="red.500" fontSize="sm" textAlign="center" mb={4}>
            {formErrors.form}
          </Text>
        )}
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl isInvalid={!!formErrors.email} isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                autoComplete="email"
              />
              {formErrors.email && (
                <FormErrorMessage>{formErrors.email}</FormErrorMessage>
              )}
            </FormControl>
            
            <FormControl isInvalid={!!formErrors.password} isRequired>
              <FormLabel>Senha</FormLabel>
              <Input
                type="password"
                name="password"
                value={formState.password}
                onChange={handleChange}
                placeholder="********"
                autoComplete="new-password"
              />
              {formErrors.password ? (
                <FormErrorMessage>{formErrors.password}</FormErrorMessage>
              ) : (
                <FormHelperText>
                  Mínimo de 8 caracteres, com letras e números
                </FormHelperText>
              )}
            </FormControl>
            
            <FormControl isInvalid={!!formErrors.confirmPassword} isRequired>
              <FormLabel>Confirmar Senha</FormLabel>
              <Input
                type="password"
                name="confirmPassword"
                value={formState.confirmPassword}
                onChange={handleChange}
                placeholder="********"
                autoComplete="new-password"
              />
              {formErrors.confirmPassword && (
                <FormErrorMessage>{formErrors.confirmPassword}</FormErrorMessage>
              )}
            </FormControl>
            
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isLoading}
              loadingText="Criando conta..."
              width="100%"
              mt={4}
            >
              Criar Conta
            </Button>
          </Stack>
        </form>
        
        <HStack my={4}>
          <Divider />
          <Text fontSize="sm" color="gray.500">
            ou
          </Text>
          <Divider />
        </HStack>
        
        <SocialLoginButtons
          onGoogleLogin={handleGoogleLogin}
          isLoading={isLoading}
        />
        
        <Box textAlign="center" mt={4}>
          <Text display="inline" fontSize="sm">
            Já tem uma conta? {' '}
          </Text>
          <ChakraLink as={Link} href="/auth/login" color="blue.500" fontWeight="medium">
            Faça login
          </ChakraLink>
        </Box>
      </Box>
    </Flex>
  );
};

export default SignupForm;
