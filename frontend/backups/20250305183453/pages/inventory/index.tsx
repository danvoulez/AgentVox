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
  InputGroup,
  Input,
  InputRightElement,
  Tag,
  HStack,
  Divider,
  Progress,
} from '@chakra-ui/react';
import { FiPackage, FiAlertCircle, FiTruck, FiBarChart2, FiSearch } from 'react-icons/fi';
import { supabase } from '@/utils/supabaseClient';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/hooks/useAuth';

const InventoryDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    incomingOrders: 0,
    inventoryValue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cardBg = useColorModeValue('white', 'gray.700');
  const cardShadow = useColorModeValue('sm', 'none');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Simulação de dados iniciais - substitua com consultas reais ao banco
        // Exemplo:
        // const { data: products, error: productsError } = await supabase
        //   .from('products')
        //   .select('*');
        
        // if (productsError) throw productsError;
        
        // Temporariamente usando dados fake
        setTimeout(() => {
          setStats({
            totalProducts: 534,
            lowStockItems: 28,
            incomingOrders: 12,
            inventoryValue: 468750.52,
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

  const StatCard = ({ title, value, icon, helpText, format }: any) => {
    let displayValue = value;
    if (format === 'currency') {
      displayValue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    
    return (
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
            <StatNumber fontSize="2xl" fontWeight="bold">{displayValue}</StatNumber>
            {helpText && <StatHelpText>{helpText}</StatHelpText>}
          </Box>
          <Icon as={icon} w={10} h={10} color="green.500" />
        </Flex>
      </Box>
    );
  };

  // Mock data for inventory items
  const popularItems = [
    { id: 1, name: "Smartphone XYZ", sku: "SM-XYZ-123", stockLevel: 78, maxStock: 100 },
    { id: 2, name: "Laptop Pro 15\"", sku: "LP-15-456", stockLevel: 45, maxStock: 100 },
    { id: 3, name: "Wireless Headphones", sku: "WH-789", stockLevel: 23, maxStock: 100 },
    { id: 4, name: "4K Monitor 27\"", sku: "MN-4K-27", stockLevel: 12, maxStock: 100 },
    { id: 5, name: "Mechanical Keyboard", sku: "KB-MECH-01", stockLevel: 56, maxStock: 100 },
  ];

  const getStockLevelColor = (level: number, max: number) => {
    const percentage = (level / max) * 100;
    if (percentage < 20) return "red";
    if (percentage < 50) return "orange";
    return "green";
  };

  return (
    <Layout>
      <Box p={5}>
        <Flex mb={5} justifyContent="space-between" alignItems="center">
          <Heading as="h1" size="lg">Gestão de Estoque</Heading>
          <Button colorScheme="green">Novo Produto</Button>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
          <StatCard
            title="Total de Produtos"
            value={stats.totalProducts}
            icon={FiPackage}
          />
          <StatCard
            title="Itens com Estoque Baixo"
            value={stats.lowStockItems}
            icon={FiAlertCircle}
          />
          <StatCard
            title="Pedidos a Receber"
            value={stats.incomingOrders}
            icon={FiTruck}
          />
          <StatCard
            title="Valor do Estoque"
            value={stats.inventoryValue}
            icon={FiBarChart2}
            format="currency"
          />
        </SimpleGrid>

        <Box bg={cardBg} borderRadius="lg" boxShadow={cardShadow} mb={8}>
          <Tabs colorScheme="green" isLazy>
            <TabList px={5} pt={2}>
              <Tab>Produtos</Tab>
              <Tab>Entrada/Saída</Tab>
              <Tab>Localização</Tab>
              <Tab>Fornecedores</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Box p={4}>
                  <Flex mb={5} justifyContent="space-between" alignItems="center">
                    <Heading as="h3" size="md">Produtos em Estoque</Heading>
                    <InputGroup maxW="300px">
                      <Input placeholder="Buscar produtos" />
                      <InputRightElement>
                        <Icon as={FiSearch} color="gray.400" />
                      </InputRightElement>
                    </InputGroup>
                  </Flex>
                  
                  <Text mb={4}>Produtos populares:</Text>
                  {popularItems.map(item => (
                    <Box key={item.id} mb={4}>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Box>
                          <Text fontWeight="medium">{item.name}</Text>
                          <Text fontSize="sm" color="gray.500">SKU: {item.sku}</Text>
                        </Box>
                        <HStack>
                          <Tag 
                            size="md" 
                            colorScheme={getStockLevelColor(item.stockLevel, item.maxStock)}
                          >
                            {item.stockLevel} unidades
                          </Tag>
                        </HStack>
                      </Flex>
                      <Progress 
                        value={(item.stockLevel / item.maxStock) * 100} 
                        colorScheme={getStockLevelColor(item.stockLevel, item.maxStock)}
                        size="sm"
                        borderRadius="full"
                      />
                      <Divider mt={2} />
                    </Box>
                  ))}
                </Box>
              </TabPanel>
              <TabPanel>
                <Box p={4}>
                  <Heading as="h3" size="md" mb={5}>Movimentações de Estoque</Heading>
                  <Text>A implementação do registro de entrada e saída de produtos será feita em breve.</Text>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box p={4}>
                  <Heading as="h3" size="md" mb={5}>Localização de Produtos</Heading>
                  <Text>A implementação do gerenciamento de localização será feita em breve.</Text>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box p={4}>
                  <Heading as="h3" size="md" mb={5}>Cadastro de Fornecedores</Heading>
                  <Text>A implementação do cadastro de fornecedores será feita em breve.</Text>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </Layout>
  );
};

export default InventoryDashboard;
