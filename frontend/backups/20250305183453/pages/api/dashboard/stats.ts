import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, getServiceSupabase, formatSupabaseResponse } from '@/utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get time range from query params
  const { timeRange = 'week' } = req.query;
  
  if (!['day', 'week', 'month', 'quarter', 'year', 'all'].includes(timeRange as string)) {
    return res.status(400).json({ error: 'Invalid time range' });
  }

  // Use service role client for database operations
  const serviceClient = getServiceSupabase();

  try {
    // Fetch dashboard stats
    const { data: stats, error: statsError } = await serviceClient
      .from('dashboard_stats')
      .select('*')
      .eq('time_range', timeRange)
      .single();
    
    if (statsError) {
      throw statsError;
    }

    // Fetch recent sales
    const { data: recentSales, error: salesError } = await serviceClient
      .from('recent_sales_with_details')
      .select('*')
      .order('sale_date', { ascending: false })
      .limit(5);
    
    if (salesError) {
      throw salesError;
    }

    // Fetch top products
    const { data: topProducts, error: productsError } = await serviceClient
      .from('top_products')
      .select('*')
      .eq('time_range', timeRange)
      .order('total_revenue', { ascending: false })
      .limit(5);
    
    if (productsError) {
      throw productsError;
    }

    // Fetch top clients
    const { data: topClients, error: clientsError } = await serviceClient
      .from('top_clients')
      .select('*')
      .eq('time_range', timeRange)
      .order('total_spent', { ascending: false })
      .limit(5);
    
    if (clientsError) {
      throw clientsError;
    }

    // Format and return all dashboard data
    const formattedData = {
      stats: formatSupabaseResponse(stats),
      recentSales: formatSupabaseResponse(recentSales),
      topProducts: formatSupabaseResponse(topProducts),
      topClients: formatSupabaseResponse(topClients)
    };

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}
