import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, getServiceSupabase, formatSupabaseResponse } from '@/utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Use service role client for database operations
  const serviceClient = getServiceSupabase();

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return await getSales(req, serviceClient, res);
    case 'POST':
      return await createSale(req.body, serviceClient, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getSales(req: NextApiRequest, supabase: any, res: NextApiResponse) {
  try {
    const { client_id, status, data_source, start_date, end_date } = req.query;
    
    // Start building the query
    let query = supabase
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
      .order('sale_date', { ascending: false });
    
    // Add filters if provided
    if (client_id) {
      query = query.eq('client_id', client_id);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (data_source) {
      query = query.eq('data_source', data_source);
    }
    
    if (start_date) {
      query = query.gte('sale_date', start_date);
    }
    
    if (end_date) {
      query = query.lte('sale_date', end_date);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching sales:', error);
      return res.status(500).json({ error: 'Failed to fetch sales' });
    }
    
    // Format response to match camelCase format
    const formattedData = formatSupabaseResponse(data);
    
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error getting sales:', error);
    return res.status(500).json({ error: 'Failed to get sales' });
  }
}

async function createSale(data: any, supabase: any, res: NextApiResponse) {
  try {
    const { 
      client_id, 
      sale_date, 
      total_amount, 
      payment_method,
      status,
      data_source,
      conversation_id,
      notes,
      metadata,
      items,
      legacy_id
    } = data;
    
    if (!client_id || !total_amount || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Client ID, total amount, and at least one item are required' });
    }
    
    // Start a transaction
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        client_id,
        sale_date: sale_date || new Date().toISOString(),
        total_amount,
        payment_method,
        status: status || 'completed',
        data_source: data_source || 'agentvox',
        conversation_id,
        notes,
        metadata: metadata || {},
        legacy_id
      })
      .select()
      .single();
    
    if (saleError) {
      console.error('Error creating sale:', saleError);
      return res.status(500).json({ error: 'Failed to create sale' });
    }
    
    // Create sale items
    const saleItems = items.map((item: any) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price
    }));
    
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);
    
    if (itemsError) {
      console.error('Error creating sale items:', itemsError);
      // Try to delete the sale since items failed
      await supabase.from('sales').delete().eq('id', sale.id);
      return res.status(500).json({ error: 'Failed to create sale items' });
    }
    
    // Get the complete sale with items
    const { data: completeSale, error: fetchError } = await supabase
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
      .eq('id', sale.id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching complete sale:', fetchError);
      return res.status(201).json(formatSupabaseResponse(sale));
    }
    
    // Format response to match camelCase format
    const formattedData = formatSupabaseResponse(completeSale);
    
    return res.status(201).json(formattedData);
  } catch (error) {
    console.error('Error creating sale:', error);
    return res.status(500).json({ error: 'Failed to create sale' });
  }
}
