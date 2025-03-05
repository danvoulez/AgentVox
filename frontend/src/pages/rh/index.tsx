import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Button,
  Select,
  Stack,
} from '@chakra-ui/react';
import { FiUsers, FiBriefcase, FiCalendar, FiAward } from 'react-icons/fi';
import { supabase } from '@/utils/supabaseClient';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/hooks/useAuth';

const RHDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    departmentCount: 0,
    openPositions: 0,
    upcomingReviews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cardBg = useColorModeValue('white', 'gray.700');
  const cardShadow = useColorModeValue('sm', 'none');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Simulação de dados iniciais - substitua com consultas reais
        // Exemplo:
        // const { data: employees, error: employeesError } = await supabase
        //   .from('employees')
        //   .select('*');
        
        // if (employeesError) throw employeesError;
        
        // Temporariamente usando dados fake
        setTimeout(() => {
          setStats({
            totalEmployees: 42,
            departmentCount: 5,
            openPositions: 7,
            upcomingReviews: 12,
          });
          setIsLoading(false);
        }, 1000);
        
      } catch (err: any) {
        console.error('Erro ao carregar estatísticas:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const StatCard = ({ title, value, icon, helpText }: any) => (
    <Box
      p={5}
      bg={cardBg}
      borderRadius="lg"
      boxShadow={cardShadow}
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-5px)', boxShadow: 'md' }}
    >
      <Flex justify="space-between" align="center">
        <Box>
          <StatLabel fontSize="sm" color="gray.500">{title}</StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold">{value}</StatNumber>
          {helpText && <StatHelpText>{helpText}</StatHelpText>}
        </Box>
        <Icon as={icon} w={10} h={10} color="blue.500" />
      </Flex>
    </Box>
  );

  return (
    <Layout>
      <Box p={5}>
        <Flex mb={5} justifyContent="space-between" alignItems="center">
          <Heading as="h1" size="lg">Recursos Humanos</Heading>
          <Button colorScheme="blue">Novo Funcionário</Button>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
          <StatCard
            title="Total de Funcionários"
            value={stats.totalEmployees}
            icon={FiUsers}
          />
          <StatCard
            title="Departamentos"
            value={stats.departmentCount}
            icon={FiBriefcase}
          />
          <StatCard
            title="Vagas Abertas"
            value={stats.openPositions}
            icon={FiAward}
          />
          <StatCard
            title="Avaliações Pendentes"
            value={stats.upcomingReviews}
            icon={FiCalendar}
            helpText="Próximos 30 dias"
          />
        </SimpleGrid>

        <Box bg={cardBg} borderRadius="lg" boxShadow={cardShadow} mb={8}>
          <Tabs colorScheme="blue" isLazy>
            <TabList px={5} pt={2}>
              <Tab>Funcionários</Tab>
              <Tab>Departamentos</Tab>
              <Tab>Vagas</Tab>
              <Tab>Avaliações</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Box p={4}>
                  <Flex mb={5} justifyContent="space-between" alignItems="center">
                    <Heading as="h3" size="md">Lista de Funcionários</Heading>
                    <Stack direction="row">
                      <Select placeholder="Departamento" maxW="200px">
                        <option value="todos">Todos</option>
                        <option value="ti">TI</option>
                        <option value="vendas">Vendas</option>
                        <option value="marketing">Marketing</option>
                        <option value="financeiro">Financeiro</option>
                        <option value="rh">RH</option>
                      </Select>
                      <Button colorScheme="blue" variant="outline">Filtros</Button>
                    </Stack>
                  </Flex>
                  <Text>A implementação da lista de funcionários será feita em breve.</Text>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box p={4}>
                  <Heading as="h3" size="md" mb={5}>Departamentos</Heading>
                  <Text>A implementação da lista de departamentos será feita em breve.</Text>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box p={4}>
                  <Heading as="h3" size="md" mb={5}>Vagas Abertas</Heading>
                  <Text>A implementação da lista de vagas será feita em breve.</Text>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box p={4}>
                  <Heading as="h3" size="md" mb={5}>Avaliações de Desempenho</Heading>
                  <Text>A implementação das avaliações será feita em breve.</Text>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </Layout>
  );
};

export default RHDashboard;
