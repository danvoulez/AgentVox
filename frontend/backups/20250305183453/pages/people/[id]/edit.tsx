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
  FormControl, 
  FormLabel, 
  Input, 
  FormErrorMessage, 
  useToast, 
  Card, 
  CardBody, 
  CardHeader, 
  CardFooter, 
  Divider, 
  Switch, 
  SimpleGrid, 
  Checkbox, 
  CheckboxGroup, 
  Textarea,
  useColorModeValue,
  Skeleton
} from '@chakra-ui/react';
import { FiChevronLeft, FiSave, FiUser } from 'react-icons/fi';
import { supabase } from '@/utils/supabase';

export default function EditPerson() {
  const router = useRouter();
  const toast = useToast();
  const { id } = router.query;
  const isNewPerson = id === 'new';
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar_url: '',
    notes: '',
    functions: []
  });
  
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(!isNewPerson);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Background colors
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // Fetch person data if editing existing person
  useEffect(() => {
    if (isNewPerson) {
      setIsLoading(false);
      return;
    }
    
    if (!id || typeof id !== 'string') return;
    
    const fetchPerson = async () => {
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
            metadata,
            functions:people_functions(id, function_type, is_active)
          `)
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        // Extract active functions
        const activeFunctions = data.functions
          .filter((f: any) => f.is_active)
          .map((f: any) => f.function_type);
        
        // Set form data
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          avatar_url: data.avatar_url || '',
          notes: data.metadata?.notes || '',
          functions: activeFunctions
        });
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
  }, [id, isNewPerson, toast]);
  
  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Handle function checkboxes
  const handleFunctionChange = (selectedFunctions) => {
    setFormData(prev => ({
      ...prev,
      functions: selectedFunctions
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare metadata
      const metadata = {
        notes: formData.notes
      };
      
      if (isNewPerson) {
        // Create new person
        const { data: personData, error: personError } = await supabase
          .from('people')
          .insert([
            {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              avatar_url: formData.avatar_url,
              metadata: metadata,
              data_source: 'vox'
            }
          ])
          .select()
          .single();
        
        if (personError) {
          throw personError;
        }
        
        // Create function associations
        if (formData.functions.length > 0) {
          const functionRecords = formData.functions.map((functionType: any) => ({
            person_id: personData.id,
            function_type: functionType,
            is_active: true
          }));
          
          const { error: functionsError } = await supabase
            .from('people_functions')
            .insert(functionRecords);
          
          if (functionsError) {
            throw functionsError;
          }
        }
        
        toast({
          title: 'Person created',
          description: `${formData.name} has been created successfully.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        router.push(`/people/${personData.id}`);
      } else {
        // Update existing person
        const { error: personError } = await supabase
          .from('people')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            avatar_url: formData.avatar_url,
            metadata: metadata
          })
          .eq('id', id);
        
        if (personError) {
          throw personError;
        }
        
        // Get current functions
        const { data: currentFunctions, error: fetchError } = await supabase
          .from('people_functions')
          .select('id, function_type, is_active')
          .eq('person_id', id);
        
        if (fetchError) {
          throw fetchError;
        }
        
        // Determine which functions to add, update, or deactivate
        const currentFunctionTypes = currentFunctions.map((f: any) => f.function_type);
        const functionsToAdd = formData.functions.filter((f: any) => !currentFunctionTypes.includes(f));
        
        // Add new functions
        if (functionsToAdd.length > 0) {
          const newFunctionRecords = functionsToAdd.map((functionType: any) => ({
            person_id: id,
            function_type: functionType,
            is_active: true
          }));
          
          const { error: addError } = await supabase
            .from('people_functions')
            .insert(newFunctionRecords);
          
          if (addError) {
            throw addError;
          }
        }
        
        // Update existing functions (activate/deactivate)
        for (const func of currentFunctions) {
          const shouldBeActive = formData.functions.includes(func.function_type);
          
          if (func.is_active !== shouldBeActive) {
            const { error: updateError } = await supabase
              .from('people_functions')
              .update({ is_active: shouldBeActive })
              .eq('id', func.id);
            
            if (updateError) {
              throw updateError;
            }
          }
        }
        
        toast({
          title: 'Person updated',
          description: `${formData.name} has been updated successfully.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        router.push(`/people/${id}`);
      }
    } catch (error) {
      console.error('Error saving person:', error);
      toast({
        title: 'Error saving person',
        description: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8} align="stretch">
          <Skeleton height="50px" />
          <Skeleton height="400px" />
        </VStack>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch" as="form" onSubmit={handleSubmit}>
        {/* Header with back button */}
        <HStack justify="space-between">
          <Button 
            leftIcon={<FiChevronLeft />} 
            variant="ghost" 
            onClick={() => router.back()}
          >
            Back
          </Button>
          
          <Heading size="lg">
            {isNewPerson ? 'New Person' : `Edit ${formData.name}`}
          </Heading>
          
          <Button
            leftIcon={<FiSave />}
            colorScheme="blue"
            type="submit"
            isLoading={isSubmitting}
          >
            Save
          </Button>
        </HStack>
        
        {/* Main form */}
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Person Information</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full name"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Avatar URL</FormLabel>
                <Input
                  name="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleChange}
                  placeholder="URL to profile picture"
                />
              </FormControl>
              
              <FormControl gridColumn="1 / -1">
                <FormLabel>Notes</FormLabel>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional notes about this person"
                  rows={4}
                />
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>
        
        {/* Functions */}
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Functions</Heading>
          </CardHeader>
          <CardBody>
            <Text mb={4}>
              Assign functions to this person to define their role in your system.
            </Text>
            
            <CheckboxGroup
              colorScheme="blue"
              value={formData.functions}
              onChange={handleFunctionChange}
            >
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Checkbox value="client">Client</Checkbox>
                <Checkbox value="supplier">Supplier</Checkbox>
                <Checkbox value="employee">Employee</Checkbox>
                <Checkbox value="partner">Partner</Checkbox>
                <Checkbox value="lead">Lead</Checkbox>
                <Checkbox value="other">Other</Checkbox>
              </SimpleGrid>
            </CheckboxGroup>
          </CardBody>
          <CardFooter>
            <Text fontSize="sm" color="gray.500">
              A person can have multiple functions. For example, someone can be both a client and a supplier.
            </Text>
          </CardFooter>
        </Card>
      </VStack>
    </Container>
  );
}
