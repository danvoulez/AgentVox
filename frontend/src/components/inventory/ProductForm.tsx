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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Image,
  Flex,
  IconButton,
  useColorModeValue,
  Switch,
} from '@chakra-ui/react';
import { FiUpload, FiSave, FiX } from 'react-icons/fi';
import { supabase } from '@/utils/supabaseClient';
import { useForm, Controller } from 'react-hook-form';

type ProductFormProps = {
  productId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type ProductData = {
  name: string;
  sku: string;
  description: string;
  category_id: string;
  supplier_id: string;
  unit_id: string;
  purchase_price: number;
  selling_price: number;
  min_stock_level: number;
  max_stock_level: number;
  current_stock: number;
  barcode: string;
  is_active: boolean;
  notes: string;
};

const ProductForm: React.FC<ProductFormProps> = ({ productId, onSuccess, onCancel }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const {
    handleSubmit,
    register,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProductData>({
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      category_id: '',
      supplier_id: '',
      unit_id: '',
      purchase_price: 0,
      selling_price: 0,
      min_stock_level: 0,
      max_stock_level: 0,
      current_stock: 0,
      barcode: '',
      is_active: true,
      notes: '',
    },
  });

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('inventory.product_categories')
          .select('*');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch suppliers
        const { data: suppliersData, error: suppliersError } = await supabase
          .from('inventory.suppliers')
          .select('*');

        if (suppliersError) throw suppliersError;
        setSuppliers(suppliersData || []);

        // Fetch units
        const { data: unitsData, error: unitsError } = await supabase
          .from('inventory.measurement_units')
          .select('*');

        if (unitsError) throw unitsError;
        setUnits(unitsData || []);

        // If editing an existing product, fetch its data
        if (productId) {
          const { data: productData, error: productError } = await supabase
            .from('inventory.products')
            .select('*')
            .eq('id', productId)
            .single();

          if (productError) throw productError;

          if (productData) {
            // Set form values
            Object.keys(productData).forEach((key) => {
              if (key in productData && productData[key] !== null) {
                setValue(key as keyof ProductData, productData[key]);
              }
            });

            // If there's a product image, fetch it
            if (productData.image_url) {
              setProductImageUrl(productData.image_url);
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

    fetchReferenceData();
  }, [productId, setValue, toast]);

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProductImage(file);
      setProductImageUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setProductImage(null);
    setProductImageUrl(null);
  };

  const generateSKU = () => {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    const sku = `PRD-${randomPart}-${timestamp}`;
    setValue('sku', sku);
  };

  const onSubmit = async (data: ProductData) => {
    setIsLoading(true);
    try {
      let productImagePath = null;

      // Upload product image if one was selected
      if (productImage) {
        const fileName = `${Date.now()}-${productImage.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, productImage);

        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
          
        productImagePath = publicUrl;
      }

      // Save product data
      const productData = {
        ...data,
        image_url: productImagePath || productImageUrl,
        updated_at: new Date(),
      };

      let result;
      if (productId) {
        // Update existing product
        result = await supabase
          .from('inventory.products')
          .update(productData)
          .eq('id', productId);
      } else {
        // Insert new product
        productData.created_at = new Date();
        result = await supabase
          .from('inventory.products')
          .insert(productData);
      }

      if (result.error) throw result.error;

      toast({
        title: productId ? 'Produto atualizado' : 'Produto cadastrado',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: 'Erro ao salvar produto',
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
        <Heading size="md">{productId ? 'Editar Produto' : 'Novo Produto'}</Heading>
        
        {/* Product Image */}
        <Flex justifyContent="center" mb={4}>
          <Box position="relative" width="200px" height="200px">
            {productImageUrl ? (
              <Image
                src={productImageUrl}
                alt="Imagem do produto"
                objectFit="cover"
                width="100%"
                height="100%"
                borderRadius="md"
              />
            ) : (
              <Flex
                width="100%"
                height="100%"
                borderRadius="md"
                border="1px"
                borderColor="gray.300"
                justifyContent="center"
                alignItems="center"
                bg="gray.100"
              >
                <Heading size="sm" color="gray.500">Sem Imagem</Heading>
              </Flex>
            )}
            <Flex position="absolute" bottom="2" right="2" gap={1}>
              <IconButton
                aria-label="Upload photo"
                icon={<FiUpload />}
                size="sm"
                colorScheme="green"
                borderRadius="full"
                onClick={() => document.getElementById('product-image-input')?.click()}
              />
              {productImageUrl && (
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
            id="product-image-input"
            type="file"
            accept="image/*"
            onChange={handleProductImageChange}
            hidden
          />
        </Flex>

        <Divider />

        {/* Basic Information */}
        <Box>
          <Heading size="sm" mb={4}>Informações Básicas</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Nome do Produto</FormLabel>
              <Input
                {...register('name', { required: 'Nome é obrigatório' })}
              />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.sku}>
              <FormLabel>SKU</FormLabel>
              <Flex>
                <Input
                  {...register('sku', { required: 'SKU é obrigatório' })}
                  flex="1"
                  mr={2}
                />
                <Button onClick={generateSKU} size="sm">
                  Gerar
                </Button>
              </Flex>
              <FormErrorMessage>{errors.sku?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.barcode}>
              <FormLabel>Código de Barras</FormLabel>
              <Input
                {...register('barcode')}
              />
              <FormErrorMessage>{errors.barcode?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.category_id}>
              <FormLabel>Categoria</FormLabel>
              <Select
                placeholder="Selecione a categoria"
                {...register('category_id', { required: 'Categoria é obrigatória' })}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.category_id?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.supplier_id}>
              <FormLabel>Fornecedor</FormLabel>
              <Select
                placeholder="Selecione o fornecedor"
                {...register('supplier_id')}
              >
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.supplier_id?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.unit_id}>
              <FormLabel>Unidade de Medida</FormLabel>
              <Select
                placeholder="Selecione a unidade"
                {...register('unit_id', { required: 'Unidade é obrigatória' })}
              >
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.abbreviation})
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.unit_id?.message}</FormErrorMessage>
            </FormControl>

            <FormControl display="flex" alignItems="center" mt={2}>
              <FormLabel htmlFor="is-active" mb="0">
                Produto Ativo
              </FormLabel>
              <Controller
                name="is_active"
                control={control}
                render={({ field: { onChange, value, ref } }) => (
                  <Switch 
                    id="is-active"
                    colorScheme="green"
                    isChecked={value}
                    onChange={onChange}
                    ref={ref}
                  />
                )}
              />
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Pricing and Stock */}
        <Box>
          <Heading size="sm" mb={4}>Preços e Estoque</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isInvalid={!!errors.purchase_price}>
              <FormLabel>Preço de Compra</FormLabel>
              <Controller
                name="purchase_price"
                control={control}
                rules={{ 
                  required: 'Preço de compra é obrigatório',
                  min: { value: 0, message: 'Preço não pode ser negativo' } 
                }}
                render={({ field }) => (
                  <NumberInput
                    precision={2}
                    step={0.01}
                    min={0}
                    {...field}
                    onChange={val => field.onChange(parseFloat(val))}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                )}
              />
              <FormErrorMessage>{errors.purchase_price?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.selling_price}>
              <FormLabel>Preço de Venda</FormLabel>
              <Controller
                name="selling_price"
                control={control}
                rules={{ 
                  required: 'Preço de venda é obrigatório',
                  min: { value: 0, message: 'Preço não pode ser negativo' } 
                }}
                render={({ field }) => (
                  <NumberInput
                    precision={2}
                    step={0.01}
                    min={0}
                    {...field}
                    onChange={val => field.onChange(parseFloat(val))}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                )}
              />
              <FormErrorMessage>{errors.selling_price?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.current_stock}>
              <FormLabel>Estoque Atual</FormLabel>
              <Controller
                name="current_stock"
                control={control}
                rules={{ min: { value: 0, message: 'Estoque não pode ser negativo' } }}
                render={({ field }) => (
                  <NumberInput
                    min={0}
                    {...field}
                    onChange={val => field.onChange(parseInt(val))}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                )}
              />
              <FormErrorMessage>{errors.current_stock?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.min_stock_level}>
              <FormLabel>Estoque Mínimo</FormLabel>
              <Controller
                name="min_stock_level"
                control={control}
                rules={{ min: { value: 0, message: 'Estoque mínimo não pode ser negativo' } }}
                render={({ field }) => (
                  <NumberInput
                    min={0}
                    {...field}
                    onChange={val => field.onChange(parseInt(val))}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                )}
              />
              <FormErrorMessage>{errors.min_stock_level?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.max_stock_level}>
              <FormLabel>Estoque Máximo</FormLabel>
              <Controller
                name="max_stock_level"
                control={control}
                rules={{ min: { value: 0, message: 'Estoque máximo não pode ser negativo' } }}
                render={({ field }) => (
                  <NumberInput
                    min={0}
                    {...field}
                    onChange={val => field.onChange(parseInt(val))}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                )}
              />
              <FormErrorMessage>{errors.max_stock_level?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Description */}
        <Box>
          <Heading size="sm" mb={4}>Descrição</Heading>
          <FormControl isInvalid={!!errors.description}>
            <FormLabel>Descrição do Produto</FormLabel>
            <Textarea
              {...register('description')}
              rows={4}
            />
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>
        </Box>

        <Divider />

        {/* Notes */}
        <FormControl isInvalid={!!errors.notes}>
          <FormLabel>Observações</FormLabel>
          <Textarea
            {...register('notes')}
            rows={3}
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
            colorScheme="green"
            leftIcon={<FiSave />}
            isLoading={isLoading}
          >
            {productId ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </Stack>
      </VStack>
    </Box>
  );
};

export default ProductForm;
