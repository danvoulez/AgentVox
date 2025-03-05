import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Button,
  Text,
  Heading,
  Container,
  VStack,
  Flex,
  Icon,
  Alert,
  AlertIcon,
  Spinner,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { CheckCircleIcon, EmailIcon } from '@chakra-ui/icons';
import Link from 'next/link';

const RegistrationSuccessPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    // Recuperar o email da query ou session storage
    const emailParam = router.query.email as string;
    if (emailParam) {
      setEmail(emailParam);
      sessionStorage.setItem('registrationEmail', emailParam);
    } else {
      const storedEmail = sessionStorage.getItem('registrationEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        // Se não houver email, redirecionar para registro
        router.push('/auth/signup');
      }
    }

    // Iniciar contagem regressiva para reenvio
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleResendEmail = async () => {
    if (!email || countdown > 0) return;

    setIsResendingEmail(true);
    setResendSuccess(false);
    setResendError('');

    try {
      // Implementar função de reenvio de email
      const { error } = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }).then(res => res.json());

      if (error) throw new Error(error);

      setResendSuccess(true);
      setCountdown(60);

      // Reiniciar contador
      const timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
    } catch (error) {
      setResendError(error instanceof Error ? error.message : 'Não foi possível reenviar o email');
    } finally {
      setIsResendingEmail(false);
    }
  };

  return (
    <>
      <Head>
        <title>{`Cadastro Realizado | AgentVox`}</title>
        <meta name="description" content="Sua conta foi criada com sucesso" />
      </Head>

      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <Container maxW="lg" py={12} px={{ base: 4, md: 8 }}>
          <VStack spacing={8} align="center" justify="center" bg="white" p={8} borderRadius="lg" boxShadow="md">
            <Icon as={CheckCircleIcon} w={20} h={20} color="green.400" />
            
            <Heading as="h1" size="xl" textAlign="center">
              Cadastro Realizado!
            </Heading>
            
            <Text fontSize="lg" textAlign="center">
              Enviamos um email de confirmação para
            </Text>
            
            <Box 
              py={2} 
              px={4} 
              bg="gray.100" 
              borderRadius="md"
              fontWeight="bold"
            >
              {email || 'seu endereço de email'}
            </Box>

            <Text textAlign="center" color="gray.600">
              Por favor, verifique sua caixa de entrada (e pasta de spam) e clique no link de confirmação para ativar sua conta.
            </Text>

            {resendSuccess && (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                Email de verificação reenviado com sucesso!
              </Alert>
            )}

            {resendError && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {resendError}
              </Alert>
            )}

            <Button
              leftIcon={<EmailIcon />}
              colorScheme="blue"
              isDisabled={countdown > 0}
              isLoading={isResendingEmail}
              onClick={handleResendEmail}
              width="full"
            >
              {countdown > 0 
                ? `Reenviar email (${countdown}s)` 
                : 'Reenviar email de verificação'}
            </Button>

            <Flex width="full" direction="column" align="center" gap={2}>
              <Button as={Link} href="/auth/login" variant="ghost" colorScheme="blue" width="full">
                Ir para o login
              </Button>
              
              <Button as={Link} href="/" variant="link" colorScheme="gray">
                Voltar para a página inicial
              </Button>
            </Flex>
          </VStack>
        </Container>
      </Flex>
    </>
  );
};

export default RegistrationSuccessPage;
