import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Container, 
  Flex, 
  Grid, 
  GridItem, 
  Heading, 
  Text, 
  Button, 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  StatArrow, 
  StatGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  VStack,
  Icon,
  Divider,
  useColorModeValue,
  Skeleton,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { 
  FiUsers, 
  FiPackage, 
  FiShoppingCart, 
  FiDollarSign, 
  FiBarChart2, 
  FiActivity, 
  FiCalendar,
  FiChevronDown,
  FiPlus,
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi';
import { supabase } from '@/utils/supabase';

export default function Dashboard() {
  const router = useRouter();
  // Use the supabase client imported from utils
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  
  // Dashboard data states
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    activeProducts: 0,
    totalClients: 0,
    newClients: 0
  });
  
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch all dashboard data from the API
        const response: Response = await fetch(`/api/dashboard/stats?timeRange=${timeRange}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data: any = await response.json();
        
        // Update stats
        if (data.stats) {
          setStats({
            totalSales: data.stats.totalSales || 0,
            totalRevenue: data.stats.totalRevenue || 0,
            averageOrderValue: data.stats.averageOrderValue || 0,
            revenueGrowth: data.stats.revenueGrowth || 0,
            activeProducts: data.stats.activeProducts || 0,
            totalClients: data.stats.totalClients || 0,
            newClients: data.stats.newClients || 0
          });
        }
        
        // Update recent sales
        if (data.recentSales) {
          setRecentSales(data.recentSales || []);
        }
        
        // Update top products
        if (data.topProducts) {
          setTopProducts(data.topProducts || []);
        }
        
        // Update top clients
        if (data.topClients) {
          setTopClients(data.topClients || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [timeRange]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'green';
      case 'processing':
        return 'blue';
      case 'pending':
        return 'yellow';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };
  
  // Card background color
  const cardBg = useColorModeValue('white', 'gray.700');
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="xl">Dashboard</Heading>
          <HStack spacing={4}>
            <Select 
              value={timeRange} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimeRange(e.target.value)}
              width="150px"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </Select>
            <Button 
              leftIcon={<FiRefreshCw />} 
              onClick={() => router.reload()}
              variant="outline"
            >
              Refresh
            </Button>
            <Menu>
              <MenuButton as={Button} rightIcon={<FiChevronDown />} colorScheme="blue">
                Actions
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiPlus />} onClick={() => router.push('/sales/new')}>
                  New Sale
                </MenuItem>
                <MenuItem icon={<FiPlus />} onClick={() => router.push('/people/new')}>
                  New Person
                </MenuItem>
                <MenuItem icon={<FiPlus />} onClick={() => router.push('/products/new')}>
                  New Product
                </MenuItem>
                <MenuItem icon={<FiBarChart2 />} onClick={() => router.push('/reports')}>
                  View Reports
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        
        {/* Stats Cards */}
        <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
          <GridItem>
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Sales</StatLabel>
                  <Skeleton isLoaded={!isLoading}>
                    <StatNumber>{stats.totalSales}</StatNumber>
                  </Skeleton>
                  <Skeleton isLoaded={!isLoading}>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      23.36%
                    </StatHelpText>
                  </Skeleton>
                </Stat>
                <Icon as={FiShoppingCart} position="absolute" top={4} right={4} boxSize={6} color="blue.500" />
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Revenue</StatLabel>
                  <Skeleton isLoaded={!isLoading}>
                    <StatNumber>{formatCurrency(stats.totalRevenue)}</StatNumber>
                  </Skeleton>
                  <Skeleton isLoaded={!isLoading}>
                    <StatHelpText>
                      <StatArrow type={stats.revenueGrowth >= 0 ? "increase" : "decrease"} />
                      {Math.abs(stats.revenueGrowth)}%
                    </StatHelpText>
                  </Skeleton>
                </Stat>
                <Icon as={FiDollarSign} position="absolute" top={4} right={4} boxSize={6} color="green.500" />
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>Active Products</StatLabel>
                  <Skeleton isLoaded={!isLoading}>
                    <StatNumber>{stats.activeProducts}</StatNumber>
                  </Skeleton>
                  <Skeleton isLoaded={!isLoading}>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      5.14%
                    </StatHelpText>
                  </Skeleton>
                </Stat>
                <Icon as={FiPackage} position="absolute" top={4} right={4} boxSize={6} color="purple.500" />
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Clients</StatLabel>
                  <Skeleton isLoaded={!isLoading}>
                    <StatNumber>{stats.totalClients}</StatNumber>
                  </Skeleton>
                  <Skeleton isLoaded={!isLoading}>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      {stats.newClients} new
                    </StatHelpText>
                  </Skeleton>
                </Stat>
                <Icon as={FiUsers} position="absolute" top={4} right={4} boxSize={6} color="orange.500" />
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
        
        {/* Recent Sales */}
        <Card bg={cardBg}>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Recent Sales</Heading>
              <Button 
                variant="ghost" 
                rightIcon={<FiChevronDown />}
                onClick={() => router.push('/sales')}
              >
                View All
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Client</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <Tr key={i}>
                      <Td><Skeleton height="20px" /></Td>
                      <Td><Skeleton height="20px" /></Td>
                      <Td><Skeleton height="20px" /></Td>
                      <Td><Skeleton height="20px" /></Td>
                    </Tr>
                  ))
                ) : recentSales.length > 0 ? (
                  recentSales.map((sale) => (
                    <Tr key={sale.id} _hover={{ bg: "gray.50" }} cursor="pointer" onClick={() => router.push(`/sales/${sale.id}`)}>
                      <Td>{formatDate(sale.sale_date)}</Td>
                      <Td>{sale.client?.name || 'Unknown'}</Td>
                      <Td>{formatCurrency(sale.total_amount)}</Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(sale.status)}>
                          {sale.status}
                        </Badge>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={4} textAlign="center">No recent sales</Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
        
        {/* Top Products and Clients */}
        <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={6}>
          <GridItem>
            <Card bg={cardBg} height="100%">
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Top Products</Heading>
                  <Button 
                    variant="ghost" 
                    rightIcon={<FiChevronDown />}
                    onClick={() => router.push('/products')}
                  >
                    View All
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Product</Th>
                      <Th isNumeric>Units Sold</Th>
                      <Th isNumeric>Revenue</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {isLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <Tr key={i}>
                          <Td><Skeleton height="20px" /></Td>
                          <Td isNumeric><Skeleton height="20px" /></Td>
                          <Td isNumeric><Skeleton height="20px" /></Td>
                        </Tr>
                      ))
                    ) : topProducts.length > 0 ? (
                      topProducts.map((product) => (
                        <Tr key={product.product_id} _hover={{ bg: "gray.50" }} cursor="pointer" onClick={() => router.push(`/products/${product.product_id}`)}>
                          <Td>{product.product_name}</Td>
                          <Td isNumeric>{product.total_sold}</Td>
                          <Td isNumeric>{formatCurrency(product.total_revenue)}</Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={3} textAlign="center">No product data available</Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card bg={cardBg} height="100%">
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Top Clients</Heading>
                  <Button 
                    variant="ghost" 
                    rightIcon={<FiChevronDown />}
                    onClick={() => router.push('/people?function=client')}
                  >
                    View All
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Client</Th>
                      <Th isNumeric>Orders</Th>
                      <Th isNumeric>Total Spent</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {isLoading ? (
                      Array(5).fill(0).map((_, i) => (
                        <Tr key={i}>
                          <Td><Skeleton height="20px" /></Td>
                          <Td isNumeric><Skeleton height="20px" /></Td>
                          <Td isNumeric><Skeleton height="20px" /></Td>
                        </Tr>
                      ))
                    ) : topClients.length > 0 ? (
                      topClients.map((client) => (
                        <Tr key={client.client_id} _hover={{ bg: "gray.50" }} cursor="pointer" onClick={() => router.push(`/people/${client.client_id}`)}>
                          <Td>{client.client_name}</Td>
                          <Td isNumeric>{client.order_count}</Td>
                          <Td isNumeric>{formatCurrency(client.total_spent)}</Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={3} textAlign="center">No client data available</Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  );
}
