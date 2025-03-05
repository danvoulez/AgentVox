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
  Avatar, 
  Badge, 
  Tabs, 
  TabPanels, 
  Tab, 
  TabPanel, 
  Card, 
  CardHeader, 
  CardBody, 
  SimpleGrid, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  Divider, 
  IconButton, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  useToast, 
  useDisclosure, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalFooter, 
  ModalBody, 
  ModalCloseButton,
  Skeleton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FiEdit, 
  FiTrash2, 
  FiMoreVertical, 
  FiMail, 
  FiPhone, 
  FiUser, 
  FiShoppingCart, 
  FiMessageCircle, 
  FiCalendar, 
  FiDollarSign,
  FiChevronLeft,
  FiChevronDown,
  FiTag
} from 'react-icons/fi';
import { supabase } from '@/utils/supabase';

export default function PersonDetail() {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { id } = router.query;
  
  // State
  const [person, setPerson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sales, setSales] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  
  // Background colors
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // Fetch person data
  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    
    const fetchPerson = async () => {
      setIsLoading(true);
      
      try {
        // Fetch person with their functions
        const { data, error } = await supabase
          .from('people')
          .select(`
            id,
            name,
            email,
            phone,
            avatar_url,
            data_source,
            legacy_id,
            created_at,
            updated_at,
            metadata,
            functions:people_functions(id, function_type, is_active)
          `)
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setPerson(data);
        
        // Fetch sales for this person
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select(`
            id,
            sale_date,
            total_amount,
            payment_method,
            status,
            notes,
            created_at
          `)
          .eq('client_id', id)
          .order('sale_date', { ascending: false });
        
        if (salesError) {
          console.error('Error fetching sales:', salesError);
        } else {
          setSales(salesData || []);
        }
        
        // Fetch WhatsApp conversations for this person
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('whatsapp_conversations')
          .select(`
            id,
            client_phone,
            start_timestamp,
            end_timestamp,
            conversation_summary,
            has_sale
          `)
          .eq('client_id', id)
          .order('start_timestamp', { ascending: false });
        
        if (conversationsError) {
          console.error('Error fetching conversations:', conversationsError);
        } else {
          setConversations(conversationsData || []);
        }
      } catch (error) {
        console.error('Error fetching person:', error);
        toast({
          title: 'Error fetching person',
          description: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error",
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPerson();
  }, [id, toast]);
  
  // Handle delete person
  const handleDeletePerson = async () => {
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Person deleted',
        description: `${person.name} has been deleted successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      router.push('/people');
    } catch (error) {
      console.error('Error deleting person:', error);
      toast({
        title: 'Error deleting person',
        description: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Get person functions
  const getPersonFunctions = () => {
    if (!person || !person.functions || !Array.isArray(person.functions)) return [];
    return person.functions.filter((f: any) => f.is_active).map((f: any) => f.function_type);
  };
  
  // Get data source badge color
  const getDataSourceColor = (source) => {
    switch (source) {
      case 'kyte':
        return 'purple';
      case 'vox':
        return 'blue';
      default:
        return 'gray';
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Calculate total spent
  const calculateTotalSpent = () => {
    if (!sales || sales.length === 0) return 0;
    return sales.reduce((total, sale) => total + (sale.total_amount || 0), 0);
  };
  
  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Skeleton height="200px" />
          <Skeleton height="400px" />
        </VStack>
      </Container>
    );
  }
  
  if (!person) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" py={10}>
            <Heading size="xl">Person Not Found</Heading>
            <Text mt={4}>The person you're looking for doesn't exist or has been deleted.</Text>
            <Button mt={6} onClick={() => router.push('/people')}>
              Back to People
            </Button>
          </Box>
        </VStack>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header with back button */}
        <HStack justify="space-between">
          <Button 
            leftIcon={<FiChevronLeft />} 
            variant="ghost" 
            onClick={() => router.push('/people')}
          >
            Back to People
          </Button>
          
          <HStack>
            <Button
              leftIcon={<FiEdit />}
              colorScheme="blue"
              onClick={() => router.push(`/people/${id}/edit`)}
            >
              Edit
            </Button>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                aria-label="Options"
              />
              <MenuList>
                <MenuItem 
                  icon={<FiTrash2 />} 
                  color="red.500"
                  onClick={onOpen}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </HStack>
        
        {/* Person Profile Card */}
        <Card bg={cardBg}>
          <CardBody>
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              align={{ base: 'center', md: 'flex-start' }}
              gap={6}
            >
              <Avatar 
                size="2xl" 
                name={person.name} 
                src={person.avatar_url} 
                bg="blue.500"
              />
              
              <VStack align="start" flex={1} spacing={4}>
                <HStack>
                  <Heading size="xl">{person.name}</Heading>
                  <Badge colorScheme={getDataSourceColor(person.data_source)}>
                    {person.data_source || 'vox'}
                  </Badge>
                </HStack>
                
                <HStack spacing={4} wrap="wrap">
                  {getPersonFunctions().map((func, index) => (
                    <Tag key={index} size="md" colorScheme={
                      func === 'client' ? 'green' :
                      func === 'supplier' ? 'orange' :
                      func === 'employee' ? 'blue' : 'gray'
                    }>
                      {func}
                    </Tag>
                  ))}
                </HStack>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                  {person.email && (
                    <HStack>
                      <FiMail />
                      <Text>{person.email}</Text>
                    </HStack>
                  )}
                  
                  {person.phone && (
                    <HStack>
                      <FiPhone />
                      <Text>{person.phone}</Text>
                    </HStack>
                  )}
                  
                  {person.legacy_id && (
                    <HStack>
                      <FiTag />
                      <Text>Legacy ID: {person.legacy_id}</Text>
                    </HStack>
                  )}
                  
                  <HStack>
                    <FiCalendar />
                    <Text>Added: {formatDate(person.created_at)}</Text>
                  </HStack>
                </SimpleGrid>
              </VStack>
              
              <VStack 
                align={{ base: 'center', md: 'flex-end' }} 
                spacing={4}
                minW={{ md: '200px' }}
              >
                <Stat textAlign={{ base: 'center', md: 'right' }}>
                  <StatLabel>Total Spent</StatLabel>
                  <StatNumber>${calculateTotalSpent().toFixed(2)}</StatNumber>
                  <StatHelpText>{sales.length} orders</StatHelpText>
                </Stat>
                
                <Stat textAlign={{ base: 'center', md: 'right' }}>
                  <StatLabel>Conversations</StatLabel>
                  <StatNumber>{conversations.length}</StatNumber>
                </Stat>
              </VStack>
            </Flex>
          </CardBody>
        </Card>
        
        {/* Tabs for different sections */}
        <Tabs 
          variant="enclosed" 
          colorScheme="blue" 
          index={activeTab}
          onChange={(index) => setActiveTab(index)}
        >
          <TabList>
            <Tab><HStack><FiShoppingCart /><Text ml={2}>Sales</Text></HStack></Tab>
            <Tab><HStack><FiMessageCircle /><Text ml={2}>Conversations</Text></HStack></Tab>
            <Tab><HStack><FiUser /><Text ml={2}>Details</Text></HStack></Tab>
          </TabList>
          
          <TabPanels>
            {/* Sales Tab */}
            <TabPanel p={0} pt={4}>
              <Card bg={cardBg}>
                <CardHeader>
                  <Heading size="md">Sales History</Heading>
                </CardHeader>
                <CardBody>
                  {sales.length > 0 ? (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Amount</Th>
                          <Th>Payment</Th>
                          <Th>Status</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {sales.map((sale) => (
                          <Tr key={sale.id} _hover={{ bg: 'gray.50' }} cursor="pointer">
                            <Td>{formatDate(sale.sale_date)}</Td>
                            <Td>${sale.total_amount?.toFixed(2)}</Td>
                            <Td>{sale.payment_method}</Td>
                            <Td>
                              <Badge colorScheme={
                                sale.status === 'completed' ? 'green' :
                                sale.status === 'pending' ? 'yellow' : 'red'
                              }>
                                {sale.status}
                              </Badge>
                            </Td>
                            <Td>
                              <IconButton
                                aria-label="View sale"
                                icon={<FiEdit />}
                                size="sm"
                                variant="ghost"
                                onClick={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  e.stopPropagation();
                                  router.push(`/sales/${sale.id}`);
                                }}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Box textAlign="center" py={6}>
                      <Text>No sales records found</Text>
                      <Button 
                        mt={4} 
                        leftIcon={<FiShoppingCart />}
                        onClick={() => router.push('/sales/new?clientId=' + id)}
                      >
                        Create Sale
                      </Button>
                    </Box>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
            
            {/* Conversations Tab */}
            <TabPanel p={0} pt={4}>
              <Card bg={cardBg}>
                <CardHeader>
                  <Heading size="md">WhatsApp Conversations</Heading>
                </CardHeader>
                <CardBody>
                  {conversations.length > 0 ? (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Date</Th>
                          <Th>Summary</Th>
                          <Th>Has Sale</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {conversations.map((conversation) => (
                          <Tr key={conversation.id} _hover={{ bg: 'gray.50' }} cursor="pointer">
                            <Td>{formatDate(conversation.start_timestamp)}</Td>
                            <Td>
                              {conversation.conversation_summary || 
                               'No summary available'}
                            </Td>
                            <Td>
                              <Badge colorScheme={conversation.has_sale ? 'green' : 'gray'}>
                                {conversation.has_sale ? 'Yes' : 'No'}
                              </Badge>
                            </Td>
                            <Td>
                              <IconButton
                                aria-label="View conversation"
                                icon={<FiMessageCircle />}
                                size="sm"
                                variant="ghost"
                                onClick={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  e.stopPropagation();
                                  router.push(`/conversations/${conversation.id}`);
                                }}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Box textAlign="center" py={6}>
                      <Text>No WhatsApp conversations found</Text>
                    </Box>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
            
            {/* Details Tab */}
            <TabPanel p={0} pt={4}>
              <Card bg={cardBg}>
                <CardHeader>
                  <Heading size="md">Additional Information</Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box>
                      <Text fontWeight="bold" mb={2}>Created</Text>
                      <Text>{formatDate(person.created_at)}</Text>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="bold" mb={2}>Last Updated</Text>
                      <Text>{formatDate(person.updated_at)}</Text>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="bold" mb={2}>Data Source</Text>
                      <Badge colorScheme={getDataSourceColor(person.data_source)}>
                        {person.data_source || 'vox'}
                      </Badge>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="bold" mb={2}>Functions</Text>
                      <HStack spacing={2}>
                        {getPersonFunctions().length > 0 ? (
                          getPersonFunctions().map((func, index) => (
                            <Tag key={index} size="sm" colorScheme={
                              func === 'client' ? 'green' :
                              func === 'supplier' ? 'orange' :
                              func === 'employee' ? 'blue' : 'gray'
                            }>
                              {func}
                            </Tag>
                          ))
                        ) : (
                          <Text fontSize="sm" color="gray.500">No functions assigned</Text>
                        )}
                      </HStack>
                    </Box>
                    
                    {person.metadata && Object.keys(person.metadata).length > 0 && (
                      <Box gridColumn="1 / -1">
                        <Text fontWeight="bold" mb={2}>Metadata</Text>
                        <Box 
                          p={4} 
                          bg="gray.50" 
                          borderRadius="md" 
                          fontSize="sm" 
                          fontFamily="monospace"
                        >
                          <pre>{JSON.stringify(person.metadata, null, 2)}</pre>
                        </Box>
                      </Box>
                    )}
                  </SimpleGrid>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete <strong>{person.name}</strong>? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeletePerson}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
