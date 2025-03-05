import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Stack,
  Textarea,
  useToast,
  VStack,
  Heading,
  FormErrorMessage,
  Divider,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  useColorModeValue,
  Select,
  RadioGroup,
  Radio
} from '@chakra-ui/react';
import { FiSave, FiPlus } from 'react-icons/fi';
import { supabase } from '@/utils/supabaseClient';
import { useForm, Controller } from 'react-hook-form';

type CustomerFormProps = {
  customerId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type CustomerData = {
  company_name: string;
  trade_name: string;
  document_number: string;
  email: string;
  phone: string;
  website: string;
  customer_type: string;
  industry: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  status: string;
  sales_rep_id: string;
  notes: string;
};

type ContactData = {
  name: string;
  role: string;
  email: string;
  phone: string;
  is_primary: boolean;
};

const CustomerForm: React.FC<CustomerFormProps> = ({ customerId, onSuccess, onCancel }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [salesReps, setSalesReps] = useState<any[]>([]);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [newContact, setNewContact] = useState<ContactData>({
    name: '',
    role: '',
    email: '',
    phone: '',
    is_primary: false
  });
  const [contactErrors, setContactErrors] = useState<{[key: string]: string}>({});
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const tagBg = useColorModeValue('blue.50', 'blue.900');

  const {
    handleSubmit,
    register,
    control,
    setValue,
    formState: { errors },
  } = useForm<CustomerData>({
    defaultValues: {
      company_name: '',
      trade_name: '',
      document_number: '',
      email: '',
      phone: '',
      website: '',
      customer_type: 'business',
      industry: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      status: 'active',
      sales_rep_id: '',
      notes: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sales representatives
        const { data: salesRepsData, error: salesRepsError } = await supabase
          .from('sales.sales_reps')
          .select('*');

        if (salesRepsError) throw salesRepsError;
        setSalesReps(salesRepsData || []);

        // If editing an existing customer, fetch their data
        if (customerId) {
          // Fetch customer data
          const { data: customerData, error: customerError } = await supabase
            .from('sales.customers')
            .select('*')
            .eq('id', customerId)
            .single();

          if (customerError) throw customerError;

          if (customerData) {
            // Set form values
            Object.keys(customerData).forEach((key) => {
              if (key in customerData && customerData[key] !== null) {
                setValue(key as keyof CustomerData, customerData[key]);
              }
            });
          }

          // Fetch customer contacts
          const { data: contactsData, error: contactsError } = await supabase
            .from('sales.customer_contacts')
            .select('*')
            .eq('customer_id', customerId);

          if (contactsError) throw contactsError;
          
          if (contactsData) {
            setContacts(contactsData);
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Erro ao carregar dados',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchData();
  }, [customerId, setValue, toast]);

  const validateContact = () => {
    const errors: {[key: string]: string} = {};
    
    if (!newContact.name) {
      errors.name = 'Nome é obrigatório';
    }
    
    if (!newContact.email) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(newContact.email)) {
      errors.email = 'Email inválido';
    }
    
    if (newContact.is_primary && contacts.some(c => c.is_primary)) {
      errors.is_primary = 'Já existe um contato principal';
    }
    
    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddContact = () => {
    if (validateContact()) {
      setContacts([...contacts, newContact]);
      setNewContact({
        name: '',
        role: '',
        email: '',
        phone: '',
        is_primary: false
      });
      setContactErrors({});
    }
  };

  const handleRemoveContact = (index: number) => {
    const updatedContacts = [...contacts];
    updatedContacts.splice(index, 1);
    setContacts(updatedContacts);
  };

  const handleContactChange = (field: keyof ContactData, value: string | boolean) => {
    setNewContact({
      ...newContact,
      [field]: value
    });
    
    if (contactErrors[field]) {
      const updatedErrors = { ...contactErrors };
      delete updatedErrors[field];
      setContactErrors(updatedErrors);
    }
  };

  const onSubmit = async (data: CustomerData) => {
    setIsLoading(true);
    try {
      // Save customer data
      let customerId;
      
      if (customerId) {
        // Update existing customer
        const { error } = await supabase
          .from('sales.customers')
          .update({
            ...data,
            updated_at: new Date()
          })
          .eq('id', customerId);

        if (error) throw error;
      } else {
        // Insert new customer
        const { data: insertedCustomer, error } = await supabase
          .from('sales.customers')
          .insert({
            ...data,
            created_at: new Date(),
            updated_at: new Date()
          })
          .select();

        if (error) throw error;
        customerId = insertedCustomer?.[0]?.id;
      }

      // Save contacts
      if (customerId) {
        // First, delete existing contacts (for update case)
        if (customerId) {
          await supabase
            .from('sales.customer_contacts')
            .delete()
            .eq('customer_id', customerId);
        }
        
        // Then insert all contacts
        if (contacts.length > 0) {
          const { error: contactsError } = await supabase
            .from('sales.customer_contacts')
            .insert(
              contacts.map(contact => ({
                ...contact,
                customer_id: customerId,
                created_at: new Date(),
                updated_at: new Date()
              }))
            );

          if (contactsError) throw contactsError;
        }
      }

      toast({
        title: customerId ? 'Cliente atualizado' : 'Cliente cadastrado',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      toast({
        title: 'Erro ao salvar cliente',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      bg={cardBg}
      p={6}
      borderRadius="lg"
      boxShadow="sm"
      border="1px"
      borderColor={borderColor}
    >
      <VStack spacing={6} align="stretch">
        <Heading size="md">{customerId ? 'Editar Cliente' : 'Novo Cliente'}</Heading>
        
        {/* Customer Type */}
        <Box>
          <Heading size="sm" mb={4}>Tipo de Cliente</Heading>
          <Controller
            name="customer_type"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field}>
                <Stack direction="row">
                  <Radio value="business">Empresa</Radio>
                  <Radio value="individual">Pessoa Física</Radio>
                  <Radio value="government">Governo</Radio>
                  <Radio value="nonprofit">ONG/Sem Fins Lucrativos</Radio>
                </Stack>
              </RadioGroup>
            )}
          />
        </Box>

        <Divider />

        {/* Basic Information */}
        <Box>
          <Heading size="sm" mb={4}>Informações Básicas</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isInvalid={!!errors.company_name}>
              <FormLabel>Nome da Empresa</FormLabel>
              <Input
                {...register('company_name', { required: 'Nome da empresa é obrigatório' })}
              />
              <FormErrorMessage>{errors.company_name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.trade_name}>
              <FormLabel>Nome Fantasia</FormLabel>
              <Input
                {...register('trade_name')}
              />
              <FormErrorMessage>{errors.trade_name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.document_number}>
              <FormLabel>CNPJ/CPF</FormLabel>
              <Input
                {...register('document_number', { required: 'CNPJ/CPF é obrigatório' })}
              />
              <FormErrorMessage>{errors.document_number?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.industry}>
              <FormLabel>Setor/Indústria</FormLabel>
              <Input
                {...register('industry')}
              />
              <FormErrorMessage>{errors.industry?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                {...register('email', { 
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.phone}>
              <FormLabel>Telefone</FormLabel>
              <Input
                {...register('phone')}
              />
              <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.website}>
              <FormLabel>Website</FormLabel>
              <Input
                {...register('website')}
              />
              <FormErrorMessage>{errors.website?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.status}>
              <FormLabel>Status</FormLabel>
              <Select
                {...register('status')}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
              </Select>
              <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.sales_rep_id}>
              <FormLabel>Representante de Vendas</FormLabel>
              <Select
                placeholder="Selecione um representante"
                {...register('sales_rep_id')}
              >
                {salesReps.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    {rep.name}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.sales_rep_id?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Address Information */}
        <Box>
          <Heading size="sm" mb={4}>Endereço</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isInvalid={!!errors.address}>
              <FormLabel>Endereço</FormLabel>
              <Input
                {...register('address')}
              />
              <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.city}>
              <FormLabel>Cidade</FormLabel>
              <Input
                {...register('city')}
              />
              <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.state}>
              <FormLabel>Estado</FormLabel>
              <Input
                {...register('state')}
              />
              <FormErrorMessage>{errors.state?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.postal_code}>
              <FormLabel>CEP</FormLabel>
              <Input
                {...register('postal_code')}
              />
              <FormErrorMessage>{errors.postal_code?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.country}>
              <FormLabel>País</FormLabel>
              <Input
                {...register('country')}
                defaultValue="Brasil"
              />
              <FormErrorMessage>{errors.country?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Contacts */}
        <Box>
          <Heading size="sm" mb={4}>Contatos</Heading>
          
          {/* List of existing contacts */}
          {contacts.length > 0 && (
            <Box mb={4}>
              <HStack spacing={2} mb={2} flexWrap="wrap">
                {contacts.map((contact, index) => (
                  <Tag 
                    key={index} 
                    size="lg" 
                    borderRadius="full" 
                    variant="solid"
                    colorScheme="blue"
                    bg={tagBg}
                    my={1}
                  >
                    <TagLabel>
                      <Box>
                        <Text fontWeight="bold">{contact.name}</Text>
                        <Text fontSize="xs">{contact.email} {contact.is_primary && '(Principal)'}</Text>
                      </Box>
                    </TagLabel>
                    <TagCloseButton onClick={() => handleRemoveContact(index)} />
                  </Tag>
                ))}
              </HStack>
            </Box>
          )}
          
          {/* Add new contact form */}
          <Box p={4} borderWidth="1px" borderRadius="md" mb={4}>
            <Heading size="xs" mb={3}>Adicionar Contato</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!contactErrors.name}>
                <FormLabel>Nome</FormLabel>
                <Input
                  value={newContact.name}
                  onChange={(e) => handleContactChange('name', e.target.value)}
                />
                {contactErrors.name && (
                  <FormErrorMessage>{contactErrors.name}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!contactErrors.role}>
                <FormLabel>Cargo</FormLabel>
                <Input
                  value={newContact.role}
                  onChange={(e) => handleContactChange('role', e.target.value)}
                />
                {contactErrors.role && (
                  <FormErrorMessage>{contactErrors.role}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!contactErrors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                />
                {contactErrors.email && (
                  <FormErrorMessage>{contactErrors.email}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl isInvalid={!!contactErrors.phone}>
                <FormLabel>Telefone</FormLabel>
                <Input
                  value={newContact.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                />
                {contactErrors.phone && (
                  <FormErrorMessage>{contactErrors.phone}</FormErrorMessage>
                )}
              </FormControl>
            </SimpleGrid>

            <Flex mt={4} alignItems="center" justifyContent="space-between">
              <FormControl display="flex" alignItems="center" isInvalid={!!contactErrors.is_primary}>
                <FormLabel htmlFor="is-primary" mb="0">
                  Contato Principal
                </FormLabel>
                <input
                  id="is-primary"
                  type="checkbox"
                  checked={newContact.is_primary}
                  onChange={(e) => handleContactChange('is_primary', e.target.checked)}
                />
                {contactErrors.is_primary && (
                  <FormErrorMessage ml={2}>{contactErrors.is_primary}</FormErrorMessage>
                )}
              </FormControl>
              <Button
                leftIcon={<FiPlus />}
                onClick={handleAddContact}
                size="sm"
              >
                Adicionar
              </Button>
            </Flex>
          </Box>
        </Box>

        <Divider />

        {/* Notes */}
        <FormControl isInvalid={!!errors.notes}>
          <FormLabel>Observações</FormLabel>
          <Textarea
            {...register('notes')}
            rows={4}
          />
          <FormErrorMessage>{errors.notes?.message}</FormErrorMessage>
        </FormControl>

        {/* Form Actions */}
        <Stack direction="row" spacing={4} justifyContent="flex-end">
          <Button
            variant="outline"
            onClick={onCancel}
            isDisabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            leftIcon={<FiSave />}
            isLoading={isLoading}
          >
            {customerId ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </Stack>
      </VStack>
    </Box>
  );
};

export default CustomerForm;
