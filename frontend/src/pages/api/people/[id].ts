import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, getServiceSupabase, formatSupabaseResponse } from '@/utils/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get the person ID from the URL
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid person ID' });
  }

  // Use service role client for database operations
  const serviceClient = getServiceSupabase();

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return await getPerson(id, serviceClient, res);
    case 'PUT':
      return await updatePerson(id, req.body, serviceClient, res);
    case 'DELETE':
      return await deletePerson(id, serviceClient, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getPerson(id: string, supabase: any, res: NextApiResponse) {
  try {
    // Get person with functions
    const { data, error } = await supabase
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
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return res.status(404).json({ error: 'Person not found' });
      }
      throw error;
    }
    
    // Format response to match camelCase format
    const formattedData = formatSupabaseResponse(data);
    
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error getting person:', error);
    return res.status(500).json({ error: 'Failed to get person' });
  }
}

async function updatePerson(id: string, data: any, supabase: any, res: NextApiResponse) {
  try {
    const { name, email, phone, avatar_url, metadata, functions } = data;
    
    // Check if person exists
    const { data: existingPerson, error: checkError } = await supabase
      .from('people')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Person not found' });
      }
      throw checkError;
    }
    
    // Update the person
    const { data: updatedPerson, error: updateError } = await supabase
      .from('people')
      .update({
        name,
        email,
        phone,
        avatar_url,
        metadata: metadata || {},
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    // If functions are provided, update them
    if (functions && Array.isArray(functions)) {
      // First, get existing functions
      const { data: existingFunctions, error: fetchFunctionsError } = await supabase
        .from('people_functions')
        .select('id, function_type')
        .eq('person_id', id);
      
      if (fetchFunctionsError) {
        throw fetchFunctionsError;
      }
      
      // Determine which functions to add, update, or remove
      const existingFunctionTypes = existingFunctions.map((f: any) => f.function_type);
      const newFunctionTypes = functions.map((f: any) => 
        typeof f === 'string' ? f : f.function_type
      );
      
      // Functions to add
      const functionsToAdd = newFunctionTypes
        .filter((f: string) => !existingFunctionTypes.includes(f))
        .map((f: string) => ({
          person_id: id,
          function_type: f,
          is_active: true
        }));
      
      // Functions to remove (set is_active to false)
      const functionsToDeactivate = existingFunctions
        .filter((f: any) => !newFunctionTypes.includes(f.function_type))
        .map((f: any) => f.id);
      
      // Add new functions
      if (functionsToAdd.length > 0) {
        const { error: addError } = await supabase
          .from('people_functions')
          .insert(functionsToAdd);
        
        if (addError) {
          throw addError;
        }
      }
      
      // Deactivate removed functions
      if (functionsToDeactivate.length > 0) {
        const { error: deactivateError } = await supabase
          .from('people_functions')
          .update({ is_active: false })
          .in('id', functionsToDeactivate);
        
        if (deactivateError) {
          throw deactivateError;
        }
      }
    }
    
    // Get the updated person with functions
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
      .eq('id', id)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    return res.status(200).json(formatSupabaseResponse(personWithFunctions));
  } catch (error) {
    console.error('Error updating person:', error);
    return res.status(500).json({ error: 'Failed to update person' });
  }
}

async function deletePerson(id: string, supabase: any, res: NextApiResponse) {
  try {
    // Check if person exists
    const { data: existingPerson, error: checkError } = await supabase
      .from('people')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Person not found' });
      }
      throw checkError;
    }
    
    // Delete the person (this will cascade to people_functions due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('people')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      throw deleteError;
    }
    
    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting person:', error);
    return res.status(500).json({ error: 'Failed to delete person' });
  }
}
