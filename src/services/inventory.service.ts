import { supabase } from '@/utils/supabaseClient';

/**
 * Serviços para o módulo de Inventário
 */

interface Product {
  id?: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category_id?: string;
  supplier_id?: string;
  unit_id?: string;
  cost_price?: number;
  selling_price: number;
  min_stock_level?: number;
  max_stock_level?: number;
  reorder_point?: number;
  current_stock: number;
  is_active: boolean;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface Category {
  id?: string;
  name: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
}

interface Supplier {
  id?: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  payment_terms?: string;
  notes?: string;
  is_active: boolean;
}

interface Unit {
  id?: string;
  name: string;
  abbreviation: string;
  description?: string;
}

interface StockMovement {
  id?: string;
  product_id: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  from_location_id?: string;
  to_location_id?: string;
  reference_id?: string;
  reference_type?: string;
  unit_price?: number;
  notes?: string;
  created_by?: string;
  created_at?: string;
}

interface Location {
  id?: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  is_active: boolean;
}

interface ProductInventory {
  id?: string;
  product_id: string;
  location_id: string;
  quantity: number;
  last_counted_at?: string;
}

// Product services
export const getProducts = async (categoryId?: string, supplierId?: string) => {
  try {
    let query = supabase
      .from('inventory.products')
      .select(`
        *,
        category:category_id(id, name),
        supplier:supplier_id(id, name),
        unit:unit_id(id, name, abbreviation)
      `)
      .order('name', { ascending: true });
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    if (supplierId) {
      query = query.eq('supplier_id', supplierId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: null, error };
  }
};

export const getProduct = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('inventory.products')
      .select(`
        *,
        category:category_id(id, name),
        supplier:supplier_id(id, name),
        unit:unit_id(id, name, abbreviation)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const createProduct = async (product: Product) => {
  try {
    const { data, error } = await supabase
      .from('inventory.products')
      .insert(product)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating product:', error);
    return { data: null, error };
  }
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  try {
    const { data, error } = await supabase
      .from('inventory.products')
      .update(product)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const { error } = await supabase
      .from('inventory.products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    return { error };
  }
};

export const getLowStockProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('inventory.products')
      .select(`
        *,
        category:category_id(id, name),
        supplier:supplier_id(id, name),
        unit:unit_id(id, name, abbreviation)
      `)
      .lt('current_stock', supabase.raw('reorder_point'))
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return { data: null, error };
  }
};

// Category services
export const getCategories = async (parentId?: string) => {
  try {
    let query = supabase
      .from('inventory.categories')
      .select(`
        *,
        parent:parent_id(id, name)
      `)
      .order('name', { ascending: true });
    
    if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { data: null, error };
  }
};

export const getCategory = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('inventory.categories')
      .select(`
        *,
        parent:parent_id(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const createCategory = async (category: Category) => {
  try {
    const { data, error } = await supabase
      .from('inventory.categories')
      .insert(category)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating category:', error);
    return { data: null, error };
  }
};

export const updateCategory = async (id: string, category: Partial<Category>) => {
  try {
    const { data, error } = await supabase
      .from('inventory.categories')
      .update(category)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating category with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const { error } = await supabase
      .from('inventory.categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Error deleting category with ID ${id}:`, error);
    return { error };
  }
};

// Supplier services
export const getSuppliers = async () => {
  try {
    const { data, error } = await supabase
      .from('inventory.suppliers')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return { data: null, error };
  }
};

export const getSupplier = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('inventory.suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching supplier with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const createSupplier = async (supplier: Supplier) => {
  try {
    const { data, error } = await supabase
      .from('inventory.suppliers')
      .insert(supplier)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating supplier:', error);
    return { data: null, error };
  }
};

export const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
  try {
    const { data, error } = await supabase
      .from('inventory.suppliers')
      .update(supplier)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating supplier with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const deleteSupplier = async (id: string) => {
  try {
    const { error } = await supabase
      .from('inventory.suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Error deleting supplier with ID ${id}:`, error);
    return { error };
  }
};

// Unit services
export const getUnits = async () => {
  try {
    const { data, error } = await supabase
      .from('inventory.units')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching units:', error);
    return { data: null, error };
  }
};

export const getUnit = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('inventory.units')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching unit with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const createUnit = async (unit: Unit) => {
  try {
    const { data, error } = await supabase
      .from('inventory.units')
      .insert(unit)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating unit:', error);
    return { data: null, error };
  }
};

export const updateUnit = async (id: string, unit: Partial<Unit>) => {
  try {
    const { data, error } = await supabase
      .from('inventory.units')
      .update(unit)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating unit with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const deleteUnit = async (id: string) => {
  try {
    const { error } = await supabase
      .from('inventory.units')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Error deleting unit with ID ${id}:`, error);
    return { error };
  }
};

// Stock Movement services
export const getStockMovements = async (productId?: string, type?: string) => {
  try {
    let query = supabase
      .from('inventory.stock_movements')
      .select(`
        *,
        product:product_id(id, name, sku),
        from_location:from_location_id(id, name),
        to_location:to_location_id(id, name),
        created_by_user:created_by(id, email)
      `)
      .order('created_at', { ascending: false });
    
    if (productId) {
      query = query.eq('product_id', productId);
    }
    
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return { data: null, error };
  }
};

export const createStockMovement = async (movement: StockMovement) => {
  try {
    const { data, error } = await supabase
      .from('inventory.stock_movements')
      .insert(movement)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating stock movement:', error);
    return { data: null, error };
  }
};

// Location services
export const getLocations = async () => {
  try {
    const { data, error } = await supabase
      .from('inventory.locations')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching locations:', error);
    return { data: null, error };
  }
};

export const getLocation = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('inventory.locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching location with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const createLocation = async (location: Location) => {
  try {
    const { data, error } = await supabase
      .from('inventory.locations')
      .insert(location)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating location:', error);
    return { data: null, error };
  }
};

export const updateLocation = async (id: string, location: Partial<Location>) => {
  try {
    const { data, error } = await supabase
      .from('inventory.locations')
      .update(location)
      .eq('id', id)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating location with ID ${id}:`, error);
    return { data: null, error };
  }
};

export const deleteLocation = async (id: string) => {
  try {
    const { error } = await supabase
      .from('inventory.locations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error(`Error deleting location with ID ${id}:`, error);
    return { error };
  }
};

// Product Inventory services
export const getProductInventory = async (productId?: string, locationId?: string) => {
  try {
    let query = supabase
      .from('inventory.product_inventory')
      .select(`
        *,
        product:product_id(id, name, sku),
        location:location_id(id, name)
      `);
    
    if (productId) {
      query = query.eq('product_id', productId);
    }
    
    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching product inventory:', error);
    return { data: null, error };
  }
};

export const updateProductInventory = async (productId: string, locationId: string, quantity: number) => {
  try {
    // Check if the inventory record exists
    const { data: existing, error: checkError } = await supabase
      .from('inventory.product_inventory')
      .select('*')
      .eq('product_id', productId)
      .eq('location_id', locationId);

    if (checkError) throw checkError;

    let result;
    if (existing && existing.length > 0) {
      // Update existing record
      const { data, error } = await supabase
        .from('inventory.product_inventory')
        .update({ quantity, last_counted_at: new Date().toISOString() })
        .eq('product_id', productId)
        .eq('location_id', locationId)
        .select();

      if (error) throw error;
      result = { data, error: null };
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('inventory.product_inventory')
        .insert({
          product_id: productId,
          location_id: locationId,
          quantity,
          last_counted_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;
      result = { data, error: null };
    }

    return result;
  } catch (error) {
    console.error(`Error updating inventory for product ID ${productId} at location ID ${locationId}:`, error);
    return { data: null, error };
  }
};

// Inventory valuation
export const getInventoryValuation = async () => {
  try {
    const { data, error } = await supabase
      .rpc('inventory.calculate_inventory_value');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error calculating inventory valuation:', error);
    return { data: null, error };
  }
};

// Utilities
export const searchProducts = async (query: string) => {
  try {
    const { data, error } = await supabase
      .from('inventory.products')
      .select(`
        *,
        category:category_id(id, name),
        supplier:supplier_id(id, name),
        unit:unit_id(id, name, abbreviation)
      `)
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%,barcode.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error searching products with query "${query}":`, error);
    return { data: null, error };
  }
};
