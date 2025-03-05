import { useState, useEffect } from 'react';
import { supabase } from '@/utils/auth/supabase';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Code,
  Input,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Spinner,
  useToast
} from '@chakra-ui/react';

export default function TroubleshootPage() {
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testingLogin, setTestingLogin] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginResult, setLoginResult] = useState<any>(null);
  const [clientTest, setClientTest] = useState<any>(null);
  const toast = useToast();

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  async function fetchDiagnostics() {
    setLoading(true);
    try {
      const response = await fetch('/api/troubleshoot-login');
      const data = await response.json();
      setApiResponse(data);
    } catch (error) {
      console.error('Erro ao buscar diagnóstico:', error);
    } finally {
      setLoading(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    try {
      // Tentar uma operação básica no cliente
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      setClientTest({
        urlDefined: !!supabaseUrl,
        keyDefined: !!supabaseAnonKey,
        urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : 'não definida',
        keyValue: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 5)}...` : 'não definida',
      });

      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      toast({
        title: 'Conexão bem-sucedida!',
        description: 'O teste de conexão com o Supabase foi bem-sucedido.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Erro na conexão',
        description: error.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setTesting(false);
    }
  }

  async function testLogin() {
    setTestingLogin(true);
    setLoginResult(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      setLoginResult({
        success: true,
        message: 'Login bem-sucedido!',
        user: data.user ? {
          id: data.user.id,
          email: data.user.email
        } : null
      });
      
      toast({
        title: 'Login bem-sucedido!',
        description: `Logado como ${data.user?.email}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      setLoginResult({
        success: false,
        message: error.message
      });
      
      toast({
        title: 'Erro no login',
        description: error.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setTestingLogin(false);
    }
  }

  return (
    <Box maxW="800px" mx="auto" p={5}>
      <Heading mb={4}>Diagnóstico de Login</Heading>
      <Text mb={5}>Esta página ajuda a diagnosticar problemas de login com o Supabase</Text>

      <Button 
        colorScheme="blue" 
        onClick={fetchDiagnostics} 
        isLoading={loading}
        mb={5}
      >
        Atualizar Diagnóstico
      </Button>

      <Divider my={5} />

      <Heading size="md" mb={3}>1. Configuração do Servidor</Heading>
      {loading ? (
        <Spinner />
      ) : apiResponse ? (
        <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50">
          <Text fontWeight="bold">Status da API: {apiResponse.status}</Text>
          
          <Box mt={3}>
            <Text fontWeight="bold">Variáveis de Ambiente:</Text>
            <Code p={2} display="block" mt={2}>
              NEXT_PUBLIC_SUPABASE_URL: {apiResponse.envVariables?.url}
              <br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY: {apiResponse.envVariables?.keyPreview}
            </Code>
          </Box>
          
          <Box mt={3}>
            <Text fontWeight="bold">Teste de Conexão:</Text>
            {apiResponse.testConnection?.success ? (
              <Alert status="success" mt={2}>
                <AlertIcon />
                Conexão com Supabase bem-sucedida no servidor!
              </Alert>
            ) : (
              <Alert status="error" mt={2}>
                <AlertIcon />
                <AlertTitle>Falha na conexão:</AlertTitle>
                <AlertDescription>{apiResponse.testConnection?.error}</AlertDescription>
              </Alert>
            )}
          </Box>
        </Box>
      ) : (
        <Alert status="error">
          <AlertIcon />
          Erro ao carregar dados do diagnóstico
        </Alert>
      )}

      <Divider my={5} />

      <Heading size="md" mb={3}>2. Teste de Conexão no Cliente</Heading>
      <Button 
        colorScheme="teal" 
        onClick={testConnection} 
        isLoading={testing}
        mb={3}
      >
        Testar Conexão no Browser
      </Button>
      
      {clientTest && (
        <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50" mt={3}>
          <Text fontWeight="bold">Variáveis no cliente:</Text>
          <Code p={2} display="block" mt={2}>
            URL definida: {clientTest.urlDefined ? 'Sim' : 'Não'}<br />
            KEY definida: {clientTest.keyDefined ? 'Sim' : 'Não'}<br />
            Valor URL: {clientTest.urlValue}<br />
            Valor KEY: {clientTest.keyValue}
          </Code>
        </Box>
      )}

      <Divider my={5} />

      <Heading size="md" mb={3}>3. Teste de Login Direto</Heading>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Senha</FormLabel>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </FormControl>
        <Button 
          colorScheme="green" 
          onClick={testLogin}
          isLoading={testingLogin}
        >
          Testar Login
        </Button>
      </VStack>
      
      {loginResult && (
        <Box mt={4}>
          {loginResult.success ? (
            <Alert status="success">
              <AlertIcon />
              <Box>
                <AlertTitle>Login bem-sucedido!</AlertTitle>
                <AlertDescription>
                  Usuário: {loginResult.user?.email}
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <Alert status="error">
              <AlertIcon />
              <Box>
                <AlertTitle>Falha no login</AlertTitle>
                <AlertDescription>
                  {loginResult.message}
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}
