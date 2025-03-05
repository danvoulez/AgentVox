import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Switch,
  FormHelperText,
  Divider,
} from '@chakra-ui/react';
import AuthLayout from '@/components/Layout/AuthLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/auth/supabase';
import Head from 'next/head';

const ProfilePage = () => {
  const { session } = useAuth();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gdprConsents, setGdprConsents] = useState({
    marketing: false,
    analytics: false,
    thirdParty: false,
  });
  const toast = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session.user?.id) return;

      try {
        // Buscar dados do usuário no perfil
        const { data, error } = await supabase
          .from('people')
          .select('name, email, phone')
          .eq('user_id', session.user.id)
          .single();

        if (error) throw error;

        if (data) {
          setUserData({
            name: data.name || '',
            email: data.email || session.user.email || '',
            phone: data.phone || '',
          });
        }

        // Buscar consentimentos GDPR
        const { data: gdprData, error: gdprError } = await supabase
          .from('gdpr_consents')
          .select('consent_type, consented')
          .eq('user_id', session.user.id);

        if (gdprError) throw gdprError;

        if (gdprData?.length) {
          const consentMap = gdprData.reduce((acc: any, item) => {
            acc[item.consent_type] = item.consented;
            return acc;
          }, {});

          setGdprConsents({
            marketing: consentMap.marketing || false,
            analytics: consentMap.analytics || false,
            thirdParty: consentMap.thirdParty || false,
          });
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        toast({
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar seus dados de perfil.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (session.user) {
      fetchUserData();
    }
  }, [session.user, toast]);

  const handleUpdateProfile = async () => {
    if (!session.user?.id) return;

    setIsLoading(true);

    try {
      // Atualizar dados do usuário
      const { error } = await supabase
        .from('people')
        .upsert({
          user_id: session.user.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        })
        .select();

      if (error) throw error;

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message || 'Houve um erro ao atualizar suas informações.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
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
        description: 'A senha e a confirmação devem ser iguais.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

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
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      toast({
        title: 'Senha atualizada',
        description: 'Sua senha foi alterada com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Limpar campos
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Erro ao alterar senha',
        description: error.message || 'Houve um erro ao alterar sua senha.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGdprConsentChange = async (consentType: string, value: boolean) => {
    if (!session.user?.id) return;

    try {
      // Atualizar o estado local primeiro para feedback imediato
      setGdprConsents({
        ...gdprConsents,
        [consentType]: value,
      });

      // Registrar o consentimento no banco de dados
      const { error } = await supabase
        .from('gdpr_consents')
        .upsert({
          user_id: session.user.id,
          consent_type: consentType,
          consented: value,
          consent_date: value ? new Date().toISOString() : null,
          revocation_date: value ? null : new Date().toISOString(),
        }, {
          onConflict: 'user_id, consent_type',
        });

      if (error) throw error;
    } catch (error: any) {
      // Reverter o estado em caso de erro
      setGdprConsents({
        ...gdprConsents,
        [consentType]: !value,
      });

      toast({
        title: 'Erro ao atualizar consentimento',
        description: error.message || 'Não foi possível atualizar suas preferências de privacidade.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Head>
        <title>{`Meu Perfil | AgentVox`}</title>
        <meta name="description" content="Gerencie seu perfil na plataforma AgentVox" />
      </Head>
      
      <AuthLayout>
        <Box maxW="800px" mx="auto">
          <Heading as="h1" size="xl" mb={6}>
            Meu Perfil
          </Heading>

          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>Informações Pessoais</Tab>
              <Tab>Segurança</Tab>
              <Tab>Privacidade</Tab>
            </TabList>

            <TabPanels>
              {/* Painel de Informações Pessoais */}
              <TabPanel>
                <Box
                  bg="white"
                  p={6}
                  rounded="md"
                  shadow="sm"
                  borderWidth="1px"
                >
                  <VStack spacing={4} align="stretch">
                    {isEditing ? (
                      <>
                        <FormControl id="name">
                          <FormLabel>Nome</FormLabel>
                          <Input
                            value={userData.name}
                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                          />
                        </FormControl>

                        <FormControl id="email">
                          <FormLabel>Email</FormLabel>
                          <Input
                            type="email"
                            value={userData.email}
                            isReadOnly
                          />
                          <FormHelperText>
                            O email não pode ser alterado.
                          </FormHelperText>
                        </FormControl>

                        <FormControl id="phone">
                          <FormLabel>Telefone</FormLabel>
                          <Input
                            value={userData.phone}
                            onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                          />
                        </FormControl>

                        <HStack spacing={4} justify="flex-end" pt={4}>
                          <Button
                            onClick={() => setIsEditing(false)}
                            variant="outline"
                          >
                            Cancelar
                          </Button>
                          <Button
                            colorScheme="blue"
                            onClick={handleUpdateProfile}
                            isLoading={isLoading}
                          >
                            Salvar
                          </Button>
                        </HStack>
                      </>
                    ) : (
                      <>
                        <Box>
                          <Text fontWeight="bold" fontSize="sm" color="gray.500">
                            Nome
                          </Text>
                          <Text fontSize="md">{userData.name || 'Não informado'}</Text>
                        </Box>

                        <Box>
                          <Text fontWeight="bold" fontSize="sm" color="gray.500">
                            Email
                          </Text>
                          <Text fontSize="md">{userData.email}</Text>
                        </Box>

                        <Box>
                          <Text fontWeight="bold" fontSize="sm" color="gray.500">
                            Telefone
                          </Text>
                          <Text fontSize="md">{userData.phone || 'Não informado'}</Text>
                        </Box>

                        <Box pt={4}>
                          <Button
                            colorScheme="blue"
                            onClick={() => setIsEditing(true)}
                          >
                            Editar Perfil
                          </Button>
                        </Box>
                      </>
                    )}
                  </VStack>
                </Box>
              </TabPanel>

              {/* Painel de Segurança */}
              <TabPanel>
                <Box
                  bg="white"
                  p={6}
                  rounded="md"
                  shadow="sm"
                  borderWidth="1px"
                >
                  <Heading as="h3" size="md" mb={4}>
                    Alterar Senha
                  </Heading>

                  <VStack spacing={4} align="stretch">
                    <FormControl id="password">
                      <FormLabel>Nova Senha</FormLabel>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <FormHelperText>
                        A senha deve ter pelo menos 8 caracteres
                      </FormHelperText>
                    </FormControl>

                    <FormControl id="confirmPassword">
                      <FormLabel>Confirmar Nova Senha</FormLabel>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </FormControl>

                    <Box pt={4}>
                      <Button
                        colorScheme="blue"
                        onClick={handleChangePassword}
                        isLoading={isLoading}
                      >
                        Atualizar Senha
                      </Button>
                    </Box>
                  </VStack>
                </Box>
              </TabPanel>

              {/* Painel de Privacidade */}
              <TabPanel>
                <Box
                  bg="white"
                  p={6}
                  rounded="md"
                  shadow="sm"
                  borderWidth="1px"
                >
                  <Heading as="h3" size="md" mb={4}>
                    Preferências de Privacidade
                  </Heading>
                  
                  <Text mb={4} color="gray.600">
                    Controle como seus dados são utilizados na plataforma.
                  </Text>

                  <VStack spacing={4} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="marketing-emails" mb="0">
                        Receber emails de marketing
                      </FormLabel>
                      <Switch
                        id="marketing-emails"
                        isChecked={gdprConsents.marketing}
                        onChange={(e) => handleGdprConsentChange('marketing', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>
                    
                    <Divider />
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="analytics" mb="0">
                        Permitir análise de uso da plataforma
                      </FormLabel>
                      <Switch
                        id="analytics"
                        isChecked={gdprConsents.analytics}
                        onChange={(e) => handleGdprConsentChange('analytics', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>
                    
                    <Divider />
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="third-party" mb="0">
                        Compartilhar dados com parceiros
                      </FormLabel>
                      <Switch
                        id="third-party"
                        isChecked={gdprConsents.thirdParty}
                        onChange={(e) => handleGdprConsentChange('thirdParty', e.target.checked)}
                        colorScheme="blue"
                      />
                    </FormControl>
                    
                    <Box pt={4}>
                      <Text fontSize="sm" color="gray.500">
                        Suas escolhas de privacidade são salvas automaticamente. Você pode alterá-las a qualquer momento.
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </AuthLayout>
    </>
  );
};

export default ProfilePage;
