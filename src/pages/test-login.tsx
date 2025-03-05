import { useState } from 'react';
import { supabase } from '@/utils/auth/supabase';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Divider,
} from '@chakra-ui/react';

export default function TestLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [envInfo, setEnvInfo] = useState<any>(null);

  // Função para verificar as variáveis de ambiente
  const checkEnv = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    setEnvInfo({
      urlDefined: !!url,
      keyDefined: !!key,
      urlValue: url ? `${url.substring(0, 15)}...` : 'não definida',
      keyValue: key ? `${key.substring(0, 10)}...${key.substring(key.length - 5)}` : 'não definida',
      urlLength: url?.length || 0,
      keyLength: key?.length || 0,
    });
  };

  // Função para testar o login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Tentando login com:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      setResult({
        success: true,
        message: 'Login realizado com sucesso!',
        user: data.user,
        session: data.session ? {
          access_token: `${data.session.access_token.substring(0, 10)}...`,
          expires_at: data.session.expires_at,
        } : null,
      });
      
    } catch (error: any) {
      console.error('Erro no login:', error);
      setResult({
        success: false,
        message: error.message,
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="600px" mx="auto" p={5}>
      <Heading mb={4}>Teste de Login Simplificado</Heading>
      <Text mb={5}>Use esta página para testar o login com Supabase diretamente</Text>
      
      <Button onClick={checkEnv} mb={4} colorScheme="blue">
        Verificar Variáveis de Ambiente
      </Button>
      
      {envInfo && (
        <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50" mb={5}>
          <Heading size="sm" mb={2}>Informações das Variáveis de Ambiente:</Heading>
          <Code p={2} display="block">
            URL definida: {envInfo.urlDefined ? 'Sim' : 'Não'}<br />
            URL valor: {envInfo.urlValue}<br />
            URL comprimento: {envInfo.urlLength} caracteres<br />
            <br />
            KEY definida: {envInfo.keyDefined ? 'Sim' : 'Não'}<br />
            KEY valor: {envInfo.keyValue}<br />
            KEY comprimento: {envInfo.keyLength} caracteres
          </Code>
        </Box>
      )}
      
      <Divider my={5} />
      
      <form onSubmit={handleLogin}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="seu@email.com"
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Senha</FormLabel>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </FormControl>
          
          <Button 
            type="submit" 
            colorScheme="green" 
            isLoading={loading}
          >
            Fazer Login
          </Button>
        </VStack>
      </form>
      
      {result && (
        <Box mt={5}>
          {result.success ? (
            <Alert status="success" variant="solid">
              <AlertIcon />
              <Box>
                <AlertTitle>Login bem-sucedido!</AlertTitle>
                <AlertDescription>
                  <Text>Usuário: {result.user?.email}</Text>
                  {result.session && (
                    <Text mt={2}>
                      Token: {result.session.access_token}<br />
                      Expira em: {new Date(result.session.expires_at * 1000).toLocaleString()}
                    </Text>
                  )}
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <Alert status="error" variant="solid">
              <AlertIcon />
              <Box>
                <AlertTitle>Falha no login</AlertTitle>
                <AlertDescription>
                  <Text>{result.message}</Text>
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}
