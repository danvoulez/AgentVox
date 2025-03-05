import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from session
    const { user } = await serviceClient.auth.getUser(req.headers.authorization?.split(' ')[1] || '');
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search for similar memories using the match_vox_memories function
    const { data, error } = await serviceClient.rpc('match_vox_memories', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 5,
      user_id: user.id
    });

    if (error) {
      console.error('Error searching memories:', error);
      return res.status(500).json({ error: 'Failed to search memories' });
    }

    // Format the memories
    const memories = data.map((item: any) => ({
      id: item.memory_id,
      memoryType: item.content.memory_type,
      content: item.content.content,
      importance: item.content.importance,
      similarity: item.similarity
    }));

    // Return the relevant memories
    return res.status(200).json({
      memories,
      success: true
    });
  } catch (error) {
    console.error('Error searching memories:', error);
    return res.status(500).json({ error: 'Failed to search memories', success: false });
  }
}
