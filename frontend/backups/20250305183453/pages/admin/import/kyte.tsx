import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Button, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Tabs, 
  TabPanels, 
  Tab, 
  TabPanel, 
  FormControl, 
  FormLabel, 
  Input, 
  Progress, 
  Alert, 
  AlertIcon, 
  useToast, 
  Card, 
  CardHeader, 
  CardBody, 
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import { FiUpload, FiUsers, FiPackage, FiShoppingCart, FiMessageCircle } from 'react-icons/fi';
import { supabase } from '@/utils/supabase';
import { mapKytePerson, mapKyteProduct, mapKyteSale, processWhatsAppConversation } from '@/utils/kyte-data-mapper';

// Define types for import results
interface ImportResult {
  total: number;
  imported: number;
  errors: number;
  details: any[];
}

export default function KyteImport() {
  const router = useRouter();
  const toast = useToast();
  
  // State for file uploads
  const [peopleFile, setPeopleFile] = useState<File | null>(null);
  const [productsFile, setProductsFile] = useState<File | null>(null);
  const [salesFile, setSalesFile] = useState<File | null>(null);
  const [whatsappFile, setWhatsappFile] = useState<File | null>(null);
  
  // State for import progress
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [currentImport, setCurrentImport] = useState('');
  
  // State for import results
  const [peopleResult, setPeopleResult] = useState<ImportResult | null>(null);
  const [productsResult, setProductsResult] = useState<ImportResult | null>(null);
  const [salesResult, setSalesResult] = useState<ImportResult | null>(null);
  const [whatsappResult, setWhatsappResult] = useState<ImportResult | null>(null);
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };
  
  // Read and parse JSON file
  const readJsonFile = (file: File): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  };
  
  // Import people data
  const importPeople = async () => {
    if (!peopleFile) return;
    
    try {
      setCurrentImport('people');
      setImportProgress(10);
      
      const data = await readJsonFile(peopleFile);
      setImportProgress(30);
      
      // Map data to correct format if needed
      const mappedData = Array.isArray(data) 
        ? data.map((person: any) => mapKytePerson(person))
        : [mapKytePerson(data)];
      
      setImportProgress(50);
      
      // Call the import API
      const response: Response = await fetch('/api/kyte/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data_type: 'people',
          data: mappedData
        }),
      });
      
      setImportProgress(90);
      
      if (!response.ok) {
        throw new Error('Failed to import people data');
      }
      
      const result = await response.json();
      setPeopleResult(result);
      setImportProgress(100);
      
      toast({
        title: 'People import complete',
        description: `Imported ${result.imported} of ${result.total} people records`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error importing people:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error" : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Import products data
  const importProducts = async () => {
    if (!productsFile) return;
    
    try {
      setCurrentImport('products');
      setImportProgress(10);
      
      const data = await readJsonFile(productsFile);
      setImportProgress(30);
      
      // Map data to correct format if needed
      const mappedData = Array.isArray(data) 
        ? data.map((product: any) => mapKyteProduct(product))
        : [mapKyteProduct(data)];
      
      setImportProgress(50);
      
      // Call the import API
      const response: Response = await fetch('/api/kyte/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data_type: 'products',
          data: mappedData
        }),
      });
      
      setImportProgress(90);
      
      if (!response.ok) {
        throw new Error('Failed to import product data');
      }
      
      const result = await response.json();
      setProductsResult(result);
      setImportProgress(100);
      
      toast({
        title: 'Products import complete',
        description: `Imported ${result.imported} of ${result.total} product records`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error importing products:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error" : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Import sales data
  const importSales = async () => {
    if (!salesFile) return;
    
    try {
      setCurrentImport('sales');
      setImportProgress(10);
      
      const data = await readJsonFile(salesFile);
      setImportProgress(30);
      
      // Map data to correct format if needed
      const mappedData = Array.isArray(data) 
        ? data.map((sale: any) => mapKyteSale(sale))
        : [mapKyteSale(data)];
      
      setImportProgress(50);
      
      // Call the import API
      const response: Response = await fetch('/api/kyte/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data_type: 'sales',
          data: mappedData
        }),
      });
      
      setImportProgress(90);
      
      if (!response.ok) {
        throw new Error('Failed to import sales data');
      }
      
      const result = await response.json();
      setSalesResult(result);
      setImportProgress(100);
      
      toast({
        title: 'Sales import complete',
        description: `Imported ${result.imported} of ${result.total} sale records`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error importing sales:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error" : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Import WhatsApp conversations
  const importWhatsApp = async () => {
    if (!whatsappFile) return;
    
    try {
      setCurrentImport('whatsapp');
      setImportProgress(10);
      
      const data = await readJsonFile(whatsappFile);
      setImportProgress(30);
      
      // Map data to correct format if needed
      const conversations = Array.isArray(data) ? data : [data];
      
      setImportProgress(50);
      
      // Call the import API
      const response: Response = await fetch('/api/kyte/whatsapp-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversations
        }),
      });
      
      setImportProgress(90);
      
      if (!response.ok) {
        throw new Error('Failed to import WhatsApp data');
      }
      
      const result = await response.json();
      setWhatsappResult(result);
      setImportProgress(100);
      
      toast({
        title: 'WhatsApp import complete',
        description: `Imported ${result.imported} of ${result.total} conversation records`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error importing WhatsApp conversations:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error" : 'An unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Run all imports sequentially
  const runAllImports = async () => {
    setIsImporting(true);
    
    try {
      if (peopleFile) {
        await importPeople();
      }
      
      if (productsFile) {
        await importProducts();
      }
      
      if (salesFile) {
        await importSales();
      }
      
      if (whatsappFile) {
        await importWhatsApp();
      }
      
      toast({
        title: 'All imports completed',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error during import process:', error);
    } finally {
      setIsImporting(false);
      setCurrentImport('');
      setImportProgress(0);
    }
  };
  
  // Render import result stats
  const renderImportStats = (result: ImportResult | null) => {
    if (!result) return null;
    
    return (
      <StatGroup width="100%" mt={4}>
        <Stat>
          <StatLabel>Total</StatLabel>
          <StatNumber>{result.total}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Imported</StatLabel>
          <StatNumber>{result.imported}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Errors</StatLabel>
          <StatNumber>{result.errors}</StatNumber>
        </Stat>
      </StatGroup>
    );
  };
  
  // Render import result details
  const renderImportDetails = (result: ImportResult | null) => {
    if (!result || !result.details || result.details.length === 0) return null;
    
    return (
      <Accordion allowToggle mt={4}>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                View Details ({result.details.length} items)
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4} maxHeight="300px" overflowY="auto">
            {result.details.map((item, index) => (
              <Box key={index} p={2} borderBottomWidth="1px">
                <HStack justify="space-between">
                  <Text fontWeight="bold">{item.name || item.legacy_id || `Item ${index + 1}`}</Text>
                  <Badge colorScheme={
                    item.status === 'created' ? 'green' : 
                    item.status === 'updated' ? 'blue' : 
                    item.status === 'skipped' ? 'yellow' : 
                    'red'
                  }>
                    {item.status}
                  </Badge>
                </HStack>
                {item.error && (
                  <Text color="red.500" fontSize="sm" mt={1}>{item.error}</Text>
                )}
              </Box>
            ))}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl">Kyte Data Import</Heading>
          <Text mt={2} color="gray.600">
            Import your legacy data from Kyte into AgentVox
          </Text>
        </Box>
        
        {isImporting && (
          <Box>
            <Text mb={2}>Importing {currentImport}...</Text>
            <Progress value={importProgress} size="sm" colorScheme="blue" />
          </Box>
        )}
        
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab><HStack><FiUsers /><Text ml={2}>People</Text></HStack></Tab>
            <Tab><HStack><FiPackage /><Text ml={2}>Products</Text></HStack></Tab>
            <Tab><HStack><FiShoppingCart /><Text ml={2}>Sales</Text></HStack></Tab>
            <Tab><HStack><FiMessageCircle /><Text ml={2}>WhatsApp</Text></HStack></Tab>
          </TabList>
          
          <TabPanels>
            {/* People Import Panel */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Import People Data</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Select People JSON File</FormLabel>
                      <Input
                        type="file"
                        accept=".json"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, setPeopleFile)}
                        disabled={isImporting}
                      />
                    </FormControl>
                    
                    <Button
                      leftIcon={<FiUpload />}
                      colorScheme="blue"
                      onClick={importPeople}
                      isDisabled={!peopleFile || isImporting}
                    >
                      Import People
                    </Button>
                    
                    {peopleResult && (
                      <>
                        {renderImportStats(peopleResult)}
                        {renderImportDetails(peopleResult)}
                      </>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
            
            {/* Products Import Panel */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Import Products Data</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Select Products JSON File</FormLabel>
                      <Input
                        type="file"
                        accept=".json"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, setProductsFile)}
                        disabled={isImporting}
                      />
                    </FormControl>
                    
                    <Button
                      leftIcon={<FiUpload />}
                      colorScheme="blue"
                      onClick={importProducts}
                      isDisabled={!productsFile || isImporting}
                    >
                      Import Products
                    </Button>
                    
                    {productsResult && (
                      <>
                        {renderImportStats(productsResult)}
                        {renderImportDetails(productsResult)}
                      </>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
            
            {/* Sales Import Panel */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Import Sales Data</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Select Sales JSON File</FormLabel>
                      <Input
                        type="file"
                        accept=".json"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, setSalesFile)}
                        disabled={isImporting}
                      />
                    </FormControl>
                    
                    <Button
                      leftIcon={<FiUpload />}
                      colorScheme="blue"
                      onClick={importSales}
                      isDisabled={!salesFile || isImporting}
                    >
                      Import Sales
                    </Button>
                    
                    {salesResult && (
                      <>
                        {renderImportStats(salesResult)}
                        {renderImportDetails(salesResult)}
                      </>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
            
            {/* WhatsApp Import Panel */}
            <TabPanel>
              <Card>
                <CardHeader>
                  <Heading size="md">Import WhatsApp Conversations</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Select WhatsApp JSON File</FormLabel>
                      <Input
                        type="file"
                        accept=".json"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, setWhatsappFile)}
                        disabled={isImporting}
                      />
                    </FormControl>
                    
                    <Button
                      leftIcon={<FiUpload />}
                      colorScheme="blue"
                      onClick={importWhatsApp}
                      isDisabled={!whatsappFile || isImporting}
                    >
                      Import WhatsApp Data
                    </Button>
                    
                    {whatsappResult && (
                      <>
                        {renderImportStats(whatsappResult)}
                        {renderImportDetails(whatsappResult)}
                      </>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        <Box>
          <Button
            colorScheme="green"
            size="lg"
            width="100%"
            onClick={runAllImports}
            isDisabled={
              isImporting || 
              (!peopleFile && !productsFile && !salesFile && !whatsappFile)
            }
            leftIcon={<FiUpload />}
          >
            Import All Selected Data
          </Button>
        </Box>
        
        <HStack justify="space-between">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={() => router.push('/admin/dashboard')}
          >
            Go to Dashboard
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
}
