import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/utils/supabase/api';
import { getServiceSupabase } from '@/utils/supabase';
import { formatSupabaseResponse } from '@/utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the authenticated user
  const supabase = createClient(req, res);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Use service role client for database operations
  const serviceClient = getServiceSupabase();

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return await getProducts(req, serviceClient, res);
    case 'POST':
      return await createProduct(req.body, serviceClient, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getProducts(req: NextApiRequest, supabase: any, res: NextApiResponse) {
  try {
    const { category, data_source, search, is_active } = req.query;
    
    // Start building the query
    let query = supabase
      .from('products')
      .select(`
        id, 
        legacy_id,
        name, 
        description, 
        price,
        legacy_price,
        image_url,
        sku,
        category,
        is_active,
        stock,
        data_source,
        metadata,
        created_at, 
        updated_at
      `);
    
    // Add filters if provided
    if (category) {
      query = query.eq('category', category);
    }
    
    if (data_source) {
      query = query.eq('data_source', data_source);
    }
    
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    
    // Format response to match camelCase format
    const formattedData = formatSupabaseResponse(data);
    
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error getting products:', error);
    return res.status(500).json({ error: 'Failed to get products' });
  }
}

async function createProduct(data: any, supabase: any, res: NextApiResponse) {
  try {
    const { 
      name, 
      description, 
      price, 
      legacy_price,
      image_url, 
      sku, 
      category, 
      is_active,
      stock,
      data_source,
      metadata,
      legacy_id
    } = data;
    
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    
    // Create the product
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price,
        legacy_price,
        image_url,
        sku,
        category,
        is_active: is_active !== undefined ? is_active : true,
        stock: stock || 0,
        data_source: data_source || 'agentvox',
        metadata: metadata || {},
        legacy_id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({ error: 'Failed to create product' });
    }
    
    // Format response to match camelCase format
    const formattedData = formatSupabaseResponse(newProduct);
    
    return res.status(201).json(formattedData);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
}
