import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, getServiceSupabase, formatSupabaseResponse } from '@/utils/supabase';
import { processWhatsAppConversation } from '@/utils/kyte-data-mapper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only allow POST method for import
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use service role client for database operations
  const serviceClient = getServiceSupabase();

  try {
    const { conversations } = req.body;

    if (!conversations || !Array.isArray(conversations)) {
      return res.status(400).json({ error: 'Invalid import data. Must provide conversations array.' });
    }

    const results = await importWhatsAppConversations(conversations, serviceClient);
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error importing WhatsApp conversations:', error);
    return res.status(500).json({ error: 'Failed to import WhatsApp conversations' });
  }
}

async function importWhatsAppConversations(conversations: any[], supabase: any) {
  const results = {
    total: conversations.length,
    imported: 0,
    errors: 0,
    details: [] as any[]
  };

  for (const conversation of conversations) {
    try {
      // Process the conversation data
      const processedConversation = processWhatsAppConversation(conversation);
      
      // Check if this conversation already exists (by phone and timestamp)
      const { data: existingConversation, error: checkError } = await supabase
        .from('whatsapp_conversations')
        .select('id')
        .eq('client_phone', processedConversation.client_phone)
        .eq('start_timestamp', processedConversation.start_timestamp)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingConversation) {
        // Skip existing conversations to avoid duplicates
        results.details.push({
          client_phone: processedConversation.client_phone,
          start_timestamp: processedConversation.start_timestamp,
          id: existingConversation.id,
          status: 'skipped',
          message: 'Conversation already imported'
        });
        continue;
      }

      // Try to find an existing client by phone number
      let clientId = null;
      if (processedConversation.client_phone) {
        const { data: client, error: clientError } = await supabase
          .from('people')
          .select('id')
          .eq('phone', processedConversation.client_phone)
          .maybeSingle();

        if (clientError && clientError.code !== 'PGRST116') {
          throw clientError;
        }

        if (client) {
          clientId = client.id;
        } else if (processedConversation.client_name) {
          // Create a new client if we have a name
          const { data: newClient, error: createClientError } = await supabase
            .from('people')
            .insert({
              name: processedConversation.client_name,
              phone: processedConversation.client_phone,
              data_source: 'kyte',
              metadata: { 
                imported_from_whatsapp: true,
                import_date: new Date().toISOString()
              }
            })
            .select()
            .single();

          if (createClientError) {
            throw createClientError;
          }

          // Add client function
          const { error: functionError } = await supabase
            .from('people_functions')
            .insert({
              person_id: newClient.id,
              function_type: 'client',
              is_active: true
            });

          if (functionError) {
            throw functionError;
          }

          clientId = newClient.id;
        }
      }

      // Create the conversation record
      const { data: newConversation, error: createError } = await supabase
        .from('whatsapp_conversations')
        .insert({
          client_id: clientId,
          client_phone: processedConversation.client_phone,
          client_name: processedConversation.client_name,
          start_timestamp: processedConversation.start_timestamp,
          end_timestamp: processedConversation.end_timestamp,
          conversation_text: processedConversation.conversation_text,
          conversation_summary: processedConversation.conversation_summary,
          has_sale: processedConversation.has_sale
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      results.imported++;
      results.details.push({
        client_phone: processedConversation.client_phone,
        client_name: processedConversation.client_name,
        id: newConversation.id,
        client_id: clientId,
        has_sale: newConversation.has_sale,
        status: 'created'
      });
    } catch (error) {
      console.error('Error importing WhatsApp conversation:', error, conversation);
      results.errors++;
      results.details.push({
        client_phone: conversation.clientPhone || conversation.phone,
        client_name: conversation.clientName || conversation.name,
        status: 'error',
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  return results;
}
