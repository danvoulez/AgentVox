import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, getServiceSupabase, formatSupabaseResponse } from '@/utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get the sale ID from the URL
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid sale ID' });
  }

  // Use service role client for database operations
  const serviceClient = getServiceSupabase();

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return await getSale(id, serviceClient, res);
    case 'PUT':
      return await updateSale(id, req.body, serviceClient, res);
    case 'DELETE':
      return await deleteSale(id, serviceClient, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getSale(id: string, supabase: any, res: NextApiResponse) {
  try {
    // Get sale with items and client info
    const { data, error } = await supabase
      .from('sales')
      .select(`
        id, 
        legacy_id,
        client_id,
        client:client_id(id, name, email, phone),
        sale_date,
        total_amount,
        payment_method,
        status,
        data_source,
        conversation_id,
        notes,
        metadata,
        created_at, 
        updated_at,
        items:sale_items(
          id,
          product_id,
          product:product_id(id, name, price, image_url),
          quantity,
          unit_price
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return res.status(404).json({ error: 'Sale not found' });
      }
      throw error;
    }
    
    // Format response to match camelCase format
    const formattedData = formatSupabaseResponse(data);
    
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error getting sale:', error);
    return res.status(500).json({ error: 'Failed to get sale' });
  }
}

async function updateSale(id: string, data: any, supabase: any, res: NextApiResponse) {
  try {
    const { 
      client_id, 
      sale_date, 
      total_amount, 
      payment_method,
      status,
      conversation_id,
      notes,
      metadata,
      items
    } = data;
    
    // Check if sale exists
    const { data: existingSale, error: checkError } = await supabase
      .from('sales')
      .select('id, data_source')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Sale not found' });
      }
      throw checkError;
    }
    
    // Don't allow changing data_source
    const dataSource = existingSale.data_source;
    
    // Update the sale
    const { data: updatedSale, error: updateError } = await supabase
      .from('sales')
      .update({
        client_id,
        sale_date,
        total_amount,
        payment_method,
        status,
        conversation_id,
        notes,
        metadata: metadata || {},
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    // If items are provided, update them
    if (items && Array.isArray(items)) {
      // First, delete existing items
      const { error: deleteItemsError } = await supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', id);
      
      if (deleteItemsError) {
        throw deleteItemsError;
      }
      
      // Then, create new items
      const saleItems = items.map((item: any) => ({
        sale_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));
      
      const { error: createItemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);
      
      if (createItemsError) {
        throw createItemsError;
      }
    }
    
    // Get the updated sale with items
    const { data: saleWithItems, error: fetchError } = await supabase
      .from('sales')
      .select(`
        id, 
        legacy_id,
        client_id,
        client:client_id(id, name, email, phone),
        sale_date,
        total_amount,
        payment_method,
        status,
        data_source,
        conversation_id,
        notes,
        metadata,
        created_at, 
        updated_at,
        items:sale_items(
          id,
          product_id,
          product:product_id(id, name, price, image_url),
          quantity,
          unit_price
        )
      `)
      .eq('id', id)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Format response to match camelCase format
    const formattedData = formatSupabaseResponse(saleWithItems);
    
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error updating sale:', error);
    return res.status(500).json({ error: 'Failed to update sale' });
  }
}

async function deleteSale(id: string, supabase: any, res: NextApiResponse) {
  try {
    // Check if sale exists
    const { data: existingSale, error: checkError } = await supabase
      .from('sales')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Sale not found' });
      }
      throw checkError;
    }
    
    // Delete the sale (this will cascade to sale_items due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('sales')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      throw deleteError;
    }
    
    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting sale:', error);
    return res.status(500).json({ error: 'Failed to delete sale' });
  }
}
