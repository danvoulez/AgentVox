import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
  Alert,
  AlertIcon,
  Box,
  Link as ChakraLink,
  Heading,
  Flex,
} from '@chakra-ui/react';
import { FormErrorMessage, FormHelperText } from '@/components/Common';
import { isValidEmail, getPasswordValidationError } from '@/utils/auth/validation';
import { supabase } from '@/utils/auth/supabase';

interface PasswordResetFormProps {
  type: 'request' | 'reset';
}

/**
 * Form component for password reset process (request email or set new password)
 */
const PasswordResetForm = ({ type }: PasswordResetFormProps) => {
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Hooks
  const router = useRouter();
  const toast = useToast();
  
  // Get token from query params for reset password
  const { token } = router.query;

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
   * Request password reset email with validation
   */
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email } = formState;
    
    // Validate email
    if (!email) {
      setFormErrors({ email: 'Email é obrigatório' });
      return;
    }
    
    if (!isValidEmail(email)) {
      setFormErrors({ email: 'Formato de email inválido' });
      return;
    }
    
    // Clear any previous errors
    setFormErrors({});
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      setIsSubmitted(true);
      
      // Store email for reference
      sessionStorage.setItem('resetEmail', email);
      
    } catch (error: any) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Houve um erro ao processar sua solicitação';
        
      toast({
        title: 'Erro ao enviar email',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      setFormErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Set new password after reset with validation
   */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { password, confirmPassword } = formState;
    
    // Validate password fields
    if (!password) {
      setFormErrors({ password: 'Nova senha é obrigatória' });
      return;
    }
    
    if (!confirmPassword) {
      setFormErrors({ confirmPassword: 'Confirmação de senha é obrigatória' });
      return;
    }
    
    // Check password strength
    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      setFormErrors({ password: passwordError });
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setFormErrors({ confirmPassword: 'As senhas não coincidem' });
      return;
    }
    
    // Clear any previous errors
    setFormErrors({});
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      setIsSubmitted(true);
      
      toast({
        title: 'Senha atualizada com sucesso',
        description: 'Sua senha foi atualizada. Você já pode fazer login com sua nova senha.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
      
    } catch (error: any) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Houve um erro ao processar sua solicitação';
        
      toast({
        title: 'Erro ao atualizar senha',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      setFormErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Render different form based on type
  if (type === 'request') {
    if (isSubmitted) {
      return (
        <Flex direction="column" align="center" justify="center" width="100%">
          <Alert status="success" borderRadius="md" mb={4} width="100%">
            <AlertIcon />
            Email para redefinição de senha enviado!
          </Alert>
          
          <Text mb={4} textAlign="center">
            Enviamos um link para redefinir sua senha para <strong>{formState.email}</strong>.
          </Text>
          
          <Text mb={6} textAlign="center">
            Por favor, verifique sua caixa de entrada (e pasta de spam) e clique no link para criar uma nova senha.
          </Text>
          
          <Button 
            as={Link}
            href="/auth/login"
            colorScheme="blue" 
            width="100%"
          >
            Voltar para o Login
          </Button>
        </Flex>
      );
    }
    
    return (
      <Flex direction="column" width="100%">
        {formErrors.form && (
          <Text color="red.500" fontSize="sm" textAlign="center" mb={4}>
            {formErrors.form}
          </Text>
        )}
        
        <form onSubmit={handleRequestReset} style={{ width: '100%' }}>
          <Stack spacing={4}>
            <Text mb={2}>
              Informe o email associado à sua conta para receber instruções de recuperação de senha.
            </Text>
            
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
              <ChakraLink as={Link} href="/auth/login" color="blue.500" fontWeight="medium">
                Voltar para o Login
              </ChakraLink>
            </Box>
          </Stack>
        </form>
      </Flex>
    );
  }
  
  // Reset password form
  if (isSubmitted) {
    return (
      <Flex direction="column" align="center" justify="center" width="100%">
        <Alert status="success" borderRadius="md" mb={4} width="100%">
          <AlertIcon />
          Senha atualizada com sucesso!
        </Alert>
        
        <Text mb={6} textAlign="center">
          Você será redirecionado para a página de login em instantes...
        </Text>
      </Flex>
    );
  }
  
  return (
    <Flex direction="column" width="100%">
      {formErrors.form && (
        <Text color="red.500" fontSize="sm" textAlign="center" mb={4}>
          {formErrors.form}
        </Text>
      )}
      
      <form onSubmit={handleResetPassword} style={{ width: '100%' }}>
        <Stack spacing={4}>
          <Text mb={2}>
            Crie uma nova senha para sua conta.
          </Text>
          
          <FormControl isInvalid={!!formErrors.password} isRequired>
            <FormLabel>Nova Senha</FormLabel>
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
            <FormLabel>Confirmar Nova Senha</FormLabel>
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
            loadingText="Atualizando..."
            width="100%"
            mt={4}
          >
            Atualizar Senha
          </Button>
        </Stack>
      </form>
    </Flex>
  );
};

export default PasswordResetForm;
