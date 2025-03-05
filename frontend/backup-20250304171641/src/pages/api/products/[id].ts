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

  // Get the product ID from the URL
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  // Use service role client for database operations
  const serviceClient = getServiceSupabase();

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return await getProduct(id, serviceClient, res);
    case 'PUT':
      return await updateProduct(id, req.body, serviceClient, res);
    case 'DELETE':
      return await deleteProduct(id, serviceClient, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getProduct(id: string, supabase: any, res: NextApiResponse) {
  try {
    // Get product
    const { data, error } = await supabase
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
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return res.status(404).json({ error: 'Product not found' });
      }
      throw error;
    }
    
    // Format response to match camelCase format
    const formattedData = formatSupabaseResponse(data);
    
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error getting product:', error);
    return res.status(500).json({ error: 'Failed to get product' });
  }
}

async function updateProduct(id: string, data: any, supabase: any, res: NextApiResponse) {
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
      metadata
    } = data;
    
    // Check if product exists
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('id, data_source')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Product not found' });
      }
      throw checkError;
    }
    
    // Don't allow changing data_source
    const dataSource = existingProduct.data_source;
    
    // Update the product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        name,
        description,
        price,
        legacy_price,
        image_url,
        sku,
        category,
        is_active,
        stock,
        metadata: metadata || {},
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    // Format response to match camelCase format
    const formattedData = formatSupabaseResponse(updatedProduct);
    
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: 'Failed to update product' });
  }
}

async function deleteProduct(id: string, supabase: any, res: NextApiResponse) {
  try {
    // Check if product exists
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Product not found' });
      }
      throw checkError;
    }
    
    // Delete the product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      throw deleteError;
    }
    
    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
}
