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
      return await getPeople(req, serviceClient, res);
    case 'POST':
      return await createPerson(req.body, serviceClient, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getPeople(req: NextApiRequest, supabase: any, res: NextApiResponse) {
  try {
    const { function_type, data_source, search } = req.query;
    
    // Start building the query
    let query = supabase
      .from('people')
      .select(`
        id, 
        legacy_id,
        name, 
        email, 
        phone, 
        avatar_url,
        data_source,
        metadata,
        created_at, 
        updated_at,
        functions:people_functions(id, function_type, is_active)
      `);
    
    // Add filters if provided
    if (data_source) {
      query = query.eq('data_source', data_source);
    }
    
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching people:', error);
      return res.status(500).json({ error: 'Failed to fetch people' });
    }
    
    // If function_type filter is provided, filter the results
    let filteredData = data;
    if (function_type) {
      filteredData = data.filter((person: any) => 
        person.functions.some((func: any) => 
          func.function_type === function_type && func.is_active
        )
      );
    }
    
    // Format response to match camelCase format
    const formattedData = formatSupabaseResponse(filteredData);
    
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error getting people:', error);
    return res.status(500).json({ error: 'Failed to get people' });
  }
}

async function createPerson(data: any, supabase: any, res: NextApiResponse) {
  try {
    const { name, email, phone, avatar_url, data_source, metadata, functions } = data;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Create the person
    const { data: newPerson, error } = await supabase
      .from('people')
      .insert({
        name,
        email,
        phone,
        avatar_url,
        data_source: data_source || 'agentvox',
        metadata: metadata || {}
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating person:', error);
      return res.status(500).json({ error: 'Failed to create person' });
    }
    
    // If functions are provided, create them
    if (functions && functions.length > 0) {
      const functionsToInsert = functions.map((func: string) => ({
        person_id: newPerson.id,
        function_type: func,
        is_active: true
      }));
      
      const { error: functionsError } = await supabase
        .from('people_functions')
        .insert(functionsToInsert);
      
      if (functionsError) {
        console.error('Error creating person functions:', functionsError);
        // Continue anyway, we'll return the person without functions
      }
    }
    
    // Get the person with functions
    const { data: personWithFunctions, error: fetchError } = await supabase
      .from('people')
      .select(`
        id, 
        legacy_id,
        name, 
        email, 
        phone, 
        avatar_url,
        data_source,
        metadata,
        created_at, 
        updated_at,
        functions:people_functions(id, function_type, is_active)
      `)
      .eq('id', newPerson.id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching person with functions:', fetchError);
      // Return the person without functions
      return res.status(201).json(formatSupabaseResponse(newPerson));
    }
    
    return res.status(201).json(formatSupabaseResponse(personWithFunctions));
  } catch (error) {
    console.error('Error creating person:', error);
    return res.status(500).json({ error: 'Failed to create person' });
  }
}
