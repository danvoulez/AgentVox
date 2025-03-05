import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Container, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  HStack, 
  VStack, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Badge, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  Select, 
  IconButton, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  useToast, 
  Skeleton,
  Card,
  CardBody,
  useColorModeValue,
  Tag,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tabs,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiMoreVertical, 
  FiEdit, 
  FiTrash2, 
  FiDownload, 
  FiCalendar, 
  FiDollarSign, 
  FiUser, 
  FiShoppingBag,
  FiChevronRight
} from 'react-icons/fi';
import { supabase } from '@/utils/supabaseClient';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/hooks/useAuth';

const SalesDashboard = () => {
  const router = useRouter();
  const toast = useToast();
  
  // State
  const [sales, setSales] = useState<any[]>([]);
  const [filteredSales, setFilteredSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [timeRange, setTimeRange] = useState('month');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    revenueGrowth: 0
  });
  
  // Background colors
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // Fetch sales data
  useEffect(() => {
    const fetchSales = async () => {
      setIsLoading(true);
      
      try {
        const response: Response = await fetch('/api/sales');
        
        if (!response.ok) {
          throw new Error('Failed to fetch sales');
        }
        
        const data: any = await response.json();
        setSales(data);
        setFilteredSales(data);
        
        // Calculate stats
        if (data.length > 0) {
          const totalRevenue = data.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
          
          setStats({
            totalSales: data.length,
            totalRevenue: totalRevenue,
            averageOrderValue: totalRevenue / data.length,
            revenueGrowth: 0 // This would need to be calculated by comparing with previous period
          });
        }
      } catch (error) {
        console.error('Error fetching sales:', error);
        toast({
          title: 'Error fetching sales',
          description: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error",
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSales();
  }, [toast]);
  
  // Filter sales based on search query and status filter
  useEffect(() => {
    let filtered = [...sales];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((sale: any) => 
        (sale.client?.name && sale.client.name.toLowerCase().includes(query)) ||
        (sale.id && sale.id.toLowerCase().includes(query))
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter((sale: any) => sale.status === statusFilter);
    }
    
    setFilteredSales(filtered);
  }, [searchQuery, statusFilter, sales]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(e.target.value);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };
  
  // Handle time range change
  const handleTimeRangeChange = (index) => {
    const ranges = ['day', 'week', 'month', 'quarter', 'year', 'all'];
    setTimeRange(ranges[index]);
    
    // Here you would fetch new stats for the selected time range
    // For now, we'll just show a toast
    toast({
      title: 'Time range changed',
      description: `Stats now showing for ${ranges[index]}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Layout>
      <Box p={5}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg">Sales</Heading>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={() => router.push('/sales/new')}
          >
            New Sale
          </Button>
        </Flex>
        
        {/* Stats Cards */}
        <Card bg={cardBg}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Tabs 
                variant="soft-rounded" 
                colorScheme="blue" 
                size="sm"
                onChange={handleTimeRangeChange}
              >
                <TabList>
                  <Tab>Day</Tab>
                  <Tab>Week</Tab>
                  <Tab isSelected={timeRange === 'month'}>Month</Tab>
                  <Tab>Quarter</Tab>
                  <Tab>Year</Tab>
                  <Tab>All Time</Tab>
                </TabList>
              </Tabs>
              
              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
                <Stat>
                  <StatLabel>Total Sales</StatLabel>
                  <StatNumber>{stats.totalSales}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    23.36%
                  </StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Total Revenue</StatLabel>
                  <StatNumber>{formatCurrency(stats.totalRevenue)}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {stats.revenueGrowth.toFixed(2)}%
                  </StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Average Order Value</StatLabel>
                  <StatNumber>{formatCurrency(stats.averageOrderValue)}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    5.05%
                  </StatHelpText>
                </Stat>
                
                <Stat>
                  <StatLabel>Conversion Rate</StatLabel>
                  <StatNumber>32.5%</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    7.2%
                  </StatHelpText>
                </Stat>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
        
        {/* Filters */}
        <HStack spacing={4}>
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search by client name or ID"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </InputGroup>
          
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            maxW="200px"
          >
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          
          <Button leftIcon={<FiFilter />} variant="outline">
            More Filters
          </Button>
          
          <Button leftIcon={<FiDownload />} variant="outline">
            Export
          </Button>
        </HStack>
        
        {/* Sales Table */}
        {isLoading ? (
          <VStack spacing={4} align="stretch">
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
            <Skeleton height="40px" />
          </VStack>
        ) : (
          <Card bg={cardBg} overflow="hidden">
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Date</Th>
                    <Th>Client</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th>Payment</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
                      <Tr 
                        key={sale.id} 
                        _hover={{ bg: 'gray.50' }} 
                        cursor="pointer"
                        onClick={() => router.push(`/sales/${sale.id}`)}
                      >
                        <Td fontWeight="medium">#{sale.id.substring(0, 8)}</Td>
                        <Td>{formatDate(sale.saleDate)}</Td>
                        <Td>
                          <HStack>
                            {sale.client && (
                              <>
                                <Text fontWeight="medium">{sale.client.name}</Text>
                                {sale.dataSource && (
                                  <Tag size="sm" colorScheme={
                                    sale.dataSource === 'kyte' ? 'purple' : 'blue'
                                  }>
                                    {sale.dataSource}
                                  </Tag>
                                )}
                              </>
                            )}
                          </HStack>
                        </Td>
                        <Td fontWeight="medium">{formatCurrency(sale.totalAmount)}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(sale.status)}>
                            {sale.status}
                          </Badge>
                        </Td>
                        <Td>{sale.paymentMethod || 'N/A'}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Edit sale"
                              icon={<FiEdit />}
                              size="sm"
                              variant="ghost"
                              onClick={(e: React.ChangeEvent<HTMLInputElement>) => {
                                e.stopPropagation();
                                router.push(`/sales/${sale.id}/edit`);
                              }}
                            />
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FiMoreVertical />}
                                variant="ghost"
                                size="sm"
                                aria-label="More options"
                                onClick={(e: React.ChangeEvent<HTMLInputElement>) => e.stopPropagation()}
                              />
                              <MenuList onClick={(e: React.ChangeEvent<HTMLInputElement>) => e.stopPropagation()}>
                                <MenuItem icon={<FiTrash2 />} color="red.500">
                                  Delete
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={7} textAlign="center" py={6}>
                        <Text>No sales found</Text>
                        <Button 
                          mt={4} 
                          leftIcon={<FiPlus />}
                          onClick={() => router.push('/sales/new')}
                        >
                          Create Sale
                        </Button>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
          </Card>
        )}
      </VStack>
      </Box>
    </Layout>
  );
};

export default SalesDashboard;
