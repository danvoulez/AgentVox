import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Container, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Badge, 
  HStack, 
  VStack, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Checkbox,
  Avatar,
  Divider,
  Tag,
  Skeleton,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FiSearch, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiMoreVertical, 
  FiFilter, 
  FiDownload, 
  FiUpload,
  FiChevronDown,
  FiMail,
  FiPhone,
  FiUser,
  FiTag
} from 'react-icons/fi';
import { supabase } from '@/utils/supabase';

export default function PeopleList() {
  const router = useRouter();
  const toast = useToast();
  // Use the supabase client imported from utils
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // State
  const [people, setPeople] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [functionFilter, setFunctionFilter] = useState(router.query.function || '');
  const [dataSourceFilter, setDataSourceFilter] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Background colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  
  // Fetch people data
  useEffect(() => {
    const fetchPeople = async () => {
      setIsLoading(true);
      
      try {
        // Start building the query
        let query = supabase
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
            functions:people_functions(id, function_type, is_active)
          `, { count: 'exact' });
        
        // Apply filters
        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`);
        }
        
        if (functionFilter) {
          query = query.eq('people_functions.function_type', functionFilter);
        }
        
        if (dataSourceFilter) {
          query = query.eq('data_source', dataSourceFilter);
        }
        
        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        
        const { data, error, count } = await query
          .order('name')
          .range(from, to);
        
        if (error) {
          throw error;
        }
        
        setPeople(data || []);
        setTotalCount(count || 0);
      } catch (error) {
        console.error('Error fetching people:', error);
        toast({
          title: 'Error fetching people',
          description: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error",
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPeople();
  }, [searchQuery, functionFilter, dataSourceFilter, page, pageSize]);
  
  // Handle delete person
  const handleDeletePerson = async () => {
    if (!selectedPerson) return;
    
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', selectedPerson.id);
      
      if (error) {
        throw error;
      }
      
      // Remove from local state
      setPeople(people.filter((person: any) => person.id !== selectedPerson.id));
      
      toast({
        title: 'Person deleted',
        description: `${selectedPerson.name} has been deleted successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
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
  const getPersonFunctions = (person) => {
    if (!person.functions || !Array.isArray(person.functions)) return [];
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
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Heading size="xl">People</Heading>
          <HStack spacing={4}>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={() => router.push('/people/new')}
            >
              Add Person
            </Button>
            <Menu>
              <MenuButton as={Button} rightIcon={<FiChevronDown />} variant="outline">
                Actions
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiDownload />} onClick={() => router.push('/people/export')}>
                  Export People
                </MenuItem>
                <MenuItem icon={<FiUpload />} onClick={() => router.push('/admin/import/kyte')}>
                  Import from Kyte
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        
        {/* Filters */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          gap={4} 
          bg={cardBg} 
          p={4} 
          borderRadius="md" 
          shadow="sm"
        >
          <InputGroup maxW={{ md: '320px' }}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search by name, email or phone" 
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          
          <Select 
            placeholder="Filter by function" 
            maxW={{ md: '200px' }}
            value={functionFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFunctionFilter(e.target.value)}
          >
            <option value="">All Functions</option>
            <option value="client">Client</option>
            <option value="supplier">Supplier</option>
            <option value="employee">Employee</option>
            <option value="partner">Partner</option>
          </Select>
          
          <Select 
            placeholder="Filter by source" 
            maxW={{ md: '200px' }}
            value={dataSourceFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDataSourceFilter(e.target.value)}
          >
            <option value="">All Sources</option>
            <option value="kyte">Kyte</option>
            <option value="vox">Vox</option>
          </Select>
          
          <Button 
            leftIcon={<FiFilter />} 
            variant="ghost"
            onClick={() => {
              setSearchQuery('');
              setFunctionFilter('');
              setDataSourceFilter('');
            }}
          >
            Clear Filters
          </Button>
        </Flex>
        
        {/* People Table */}
        <Box bg={cardBg} borderRadius="md" shadow="sm" overflow="hidden">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Contact</Th>
                <Th>Functions</Th>
                <Th>Source</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                Array(pageSize).fill(0).map((_, i) => (
                  <Tr key={i}>
                    <Td><Skeleton height="40px" /></Td>
                    <Td><Skeleton height="40px" /></Td>
                    <Td><Skeleton height="40px" /></Td>
                    <Td><Skeleton height="40px" /></Td>
                    <Td><Skeleton height="40px" /></Td>
                  </Tr>
                ))
              ) : people.length > 0 ? (
                people.map((person) => (
                  <Tr 
                    key={person.id} 
                    _hover={{ bg: hoverBg }} 
                    cursor="pointer" 
                    onClick={() => router.push(`/people/${person.id}`)}
                  >
                    <Td>
                      <HStack spacing={3}>
                        <Avatar size="sm" name={person.name} src={person.avatar_url} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{person.name}</Text>
                          {person.legacy_id && (
                            <Text fontSize="xs" color="gray.500">ID: {person.legacy_id}</Text>
                          )}
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        {person.email && (
                          <HStack>
                            <FiMail size={14} />
                            <Text fontSize="sm">{person.email}</Text>
                          </HStack>
                        )}
                        {person.phone && (
                          <HStack>
                            <FiPhone size={14} />
                            <Text fontSize="sm">{person.phone}</Text>
                          </HStack>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        {getPersonFunctions(person).map((func, index) => (
                          <Tag key={index} size="sm" colorScheme={
                            func === 'client' ? 'green' :
                            func === 'supplier' ? 'orange' :
                            func === 'employee' ? 'blue' : 'gray'
                          }>
                            {func}
                          </Tag>
                        ))}
                      </HStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={getDataSourceColor(person.data_source)}>
                        {person.data_source || 'vox'}
                      </Badge>
                    </Td>
                    <Td onClick={(e: React.ChangeEvent<HTMLInputElement>) => e.stopPropagation()}>
                      <HStack spacing={2}>
                        <Tooltip label="Edit">
                          <IconButton
                            aria-label="Edit person"
                            icon={<FiEdit />}
                            size="sm"
                            variant="ghost"
                            onClick={(e: React.ChangeEvent<HTMLInputElement>) => {
                              e.stopPropagation();
                              router.push(`/people/${person.id}/edit`);
                            }}
                          />
                        </Tooltip>
                        <Tooltip label="Delete">
                          <IconButton
                            aria-label="Delete person"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={(e: React.ChangeEvent<HTMLInputElement>) => {
                              e.stopPropagation();
                              setSelectedPerson(person);
                              onOpen();
                            }}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={4}>
                    <Text>No people found</Text>
                    <Button 
                      mt={4} 
                      size="sm" 
                      leftIcon={<FiPlus />}
                      onClick={() => router.push('/people/new')}
                    >
                      Add Person
                    </Button>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Flex justify="space-between" align="center" p={4} borderTopWidth="1px">
              <Text fontSize="sm">
                Showing {Math.min((page - 1) * pageSize + 1, totalCount)} to {Math.min(page * pageSize, totalCount)} of {totalCount} people
              </Text>
              <HStack>
                <Button
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  isDisabled={page === 1}
                >
                  Previous
                </Button>
                <Text fontSize="sm">{page} of {totalPages}</Text>
                <Button
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  isDisabled={page === totalPages}
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          )}
        </Box>
      </VStack>
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete <strong>{selectedPerson?.name}</strong>? This action cannot be undone.
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
