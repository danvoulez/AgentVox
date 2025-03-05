import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Textarea,
  useToast,
  VStack,
  Heading,
  FormErrorMessage,
  Divider,
  Avatar,
  Flex,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUpload, FiSave, FiX } from 'react-icons/fi';
import { supabase } from '@/utils/supabaseClient';
import { useForm, Controller } from 'react-hook-form';

type EmployeeFormProps = {
  employeeId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type EmployeeData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: string;
  position_id: string;
  hire_date: string;
  birth_date: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
  salary: number;
};

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employeeId, onSuccess, onCancel }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const {
    handleSubmit,
    register,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<EmployeeData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department_id: '',
      position_id: '',
      hire_date: new Date().toISOString().split('T')[0],
      birth_date: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      notes: '',
      salary: 0,
    },
  });

  useEffect(() => {
    const fetchDepartmentsAndPositions = async () => {
      try {
        // Fetch departments
        const { data: departmentsData, error: departmentsError } = await supabase
          .from('hr.departments')
          .select('*');

        if (departmentsError) throw departmentsError;
        setDepartments(departmentsData || []);

        // Fetch positions
        const { data: positionsData, error: positionsError } = await supabase
          .from('hr.positions')
          .select('*');

        if (positionsError) throw positionsError;
        setPositions(positionsData || []);

        // If editing an existing employee, fetch their data
        if (employeeId) {
          const { data: employeeData, error: employeeError } = await supabase
            .from('hr.employees')
            .select('*')
            .eq('id', employeeId)
            .single();

          if (employeeError) throw employeeError;

          if (employeeData) {
            // Set form values
            Object.keys(employeeData).forEach((key) => {
              if (key in employeeData && employeeData[key] !== null) {
                setValue(key as keyof EmployeeData, employeeData[key]);
              }
            });

            // If there's a profile image, fetch it
            if (employeeData.profile_image_url) {
              setProfileImageUrl(employeeData.profile_image_url);
            }
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

    fetchDepartmentsAndPositions();
  }, [employeeId, setValue, toast]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfileImageUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfileImageUrl(null);
  };

  const onSubmit = async (data: EmployeeData) => {
    setIsLoading(true);
    try {
      let profileImagePath = null;

      // Upload profile image if one was selected
      if (profileImage) {
        const fileName = `${Date.now()}-${profileImage.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('employee-photos')
          .upload(fileName, profileImage);

        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('employee-photos')
          .getPublicUrl(fileName);
          
        profileImagePath = publicUrl;
      }

      // Save employee data
      const employeeData = {
        ...data,
        profile_image_url: profileImagePath || profileImageUrl,
        updated_at: new Date(),
      };

      let result;
      if (employeeId) {
        // Update existing employee
        result = await supabase
          .from('hr.employees')
          .update(employeeData)
          .eq('id', employeeId);
      } else {
        // Insert new employee
        employeeData.created_at = new Date();
        result = await supabase
          .from('hr.employees')
          .insert(employeeData);
      }

      if (result.error) throw result.error;

      toast({
        title: employeeId ? 'Funcionário atualizado' : 'Funcionário cadastrado',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      toast({
        title: 'Erro ao salvar funcionário',
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
        <Heading size="md">{employeeId ? 'Editar Funcionário' : 'Novo Funcionário'}</Heading>
        
        {/* Profile Image */}
        <Flex justifyContent="center" mb={4}>
          <Box position="relative">
            <Avatar
              size="2xl"
              src={profileImageUrl || ''}
              name={`${profileImageUrl ? '' : 'Foto de Perfil'}`}
            />
            <Flex position="absolute" bottom="0" right="0" gap={1}>
              <IconButton
                aria-label="Upload photo"
                icon={<FiUpload />}
                size="sm"
                colorScheme="blue"
                borderRadius="full"
                onClick={() => document.getElementById('profile-image-input')?.click()}
              />
              {profileImageUrl && (
                <IconButton
                  aria-label="Remove photo"
                  icon={<FiX />}
                  size="sm"
                  colorScheme="red"
                  borderRadius="full"
                  onClick={handleRemoveImage}
                />
              )}
            </Flex>
          </Box>
          <Input
            id="profile-image-input"
            type="file"
            accept="image/*"
            onChange={handleProfileImageChange}
            hidden
          />
        </Flex>

        <Divider />

        {/* Personal Information */}
        <Box>
          <Heading size="sm" mb={4}>Informações Pessoais</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isInvalid={!!errors.first_name}>
              <FormLabel>Nome</FormLabel>
              <Input
                {...register('first_name', { required: 'Nome é obrigatório' })}
              />
              <FormErrorMessage>{errors.first_name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.last_name}>
              <FormLabel>Sobrenome</FormLabel>
              <Input
                {...register('last_name', { required: 'Sobrenome é obrigatório' })}
              />
              <FormErrorMessage>{errors.last_name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                {...register('email', { 
                  required: 'Email é obrigatório',
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

            <FormControl isInvalid={!!errors.birth_date}>
              <FormLabel>Data de Nascimento</FormLabel>
              <Input
                type="date"
                {...register('birth_date')}
              />
              <FormErrorMessage>{errors.birth_date?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Job Information */}
        <Box>
          <Heading size="sm" mb={4}>Informações Profissionais</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isInvalid={!!errors.department_id}>
              <FormLabel>Departamento</FormLabel>
              <Select
                placeholder="Selecione o departamento"
                {...register('department_id', { required: 'Departamento é obrigatório' })}
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.department_id?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.position_id}>
              <FormLabel>Cargo</FormLabel>
              <Select
                placeholder="Selecione o cargo"
                {...register('position_id', { required: 'Cargo é obrigatório' })}
              >
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.title}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.position_id?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.hire_date}>
              <FormLabel>Data de Contratação</FormLabel>
              <Input
                type="date"
                {...register('hire_date', { required: 'Data de contratação é obrigatória' })}
              />
              <FormErrorMessage>{errors.hire_date?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.salary}>
              <FormLabel>Salário</FormLabel>
              <Input
                type="number"
                step="0.01"
                {...register('salary', { 
                  valueAsNumber: true,
                  validate: value => value >= 0 || 'Salário não pode ser negativo'
                })}
              />
              <FormErrorMessage>{errors.salary?.message}</FormErrorMessage>
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
              />
              <FormErrorMessage>{errors.country?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Emergency Contact */}
        <Box>
          <Heading size="sm" mb={4}>Contato de Emergência</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isInvalid={!!errors.emergency_contact_name}>
              <FormLabel>Nome</FormLabel>
              <Input
                {...register('emergency_contact_name')}
              />
              <FormErrorMessage>{errors.emergency_contact_name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.emergency_contact_phone}>
              <FormLabel>Telefone</FormLabel>
              <Input
                {...register('emergency_contact_phone')}
              />
              <FormErrorMessage>{errors.emergency_contact_phone?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
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
            {employeeId ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </Stack>
      </VStack>
    </Box>
  );
};

export default EmployeeForm;
