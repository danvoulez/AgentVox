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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from session
    const { user } = await serviceClient.auth.getUser(req.headers.authorization?.split(' ')[1] || '');
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { command } = req.body;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({ error: 'Command is required' });
    }

    // Retrieve user's memories for context
    const { data: memories, error: memoriesError } = await serviceClient
      .from('vox_memory')
      .select('*')
      .eq('user_id', user.id)
      .order('importance', { ascending: false })
      .limit(10);

    if (memoriesError) {
      console.error('Error retrieving memories:', memoriesError);
      return res.status(500).json({ error: 'Failed to retrieve memories' });
    }

    // Retrieve user's evolution data
    const { data: evolution, error: evolutionError } = await serviceClient
      .from('vox_evolution')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (evolutionError && evolutionError.code !== 'PGRST116') {
      console.error('Error retrieving evolution data:', evolutionError);
      return res.status(500).json({ error: 'Failed to retrieve evolution data' });
    }

    // Retrieve recent command history
    const { data: commandHistory, error: commandHistoryError } = await serviceClient
      .from('voice_commands')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (commandHistoryError) {
      console.error('Error retrieving command history:', commandHistoryError);
      return res.status(500).json({ error: 'Failed to retrieve command history' });
    }

    // Prepare context for the AI
    const contextMemories = memories.map((memory: any) => {
      return `Memory (${memory.memory_type}): ${JSON.stringify(memory.content)}`;
    }).join('\\n');

    const contextCommands = commandHistory.map((cmd: any) => {
      return `Previous command: "${cmd.command}" -> Response: "${cmd.response || 'No response'}"`;
    }).join('\\n');

    const evolutionContext = evolution 
      ? `Vox Intelligence Level: ${evolution.intelligence_level}, Learning Points: ${evolution.learning_points}`
      : 'Vox is at initial intelligence level.';

    // Process the command with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are Vox, an advanced AI assistant with the following capabilities:
          
1. You can answer questions and provide information.
2. You can remember user preferences and important information.
3. You can suggest actions based on context.
4. You learn from interactions and improve over time.

User Context:
${contextMemories}

Recent Interaction History:
${contextCommands}

${evolutionContext}

When responding to the user:
1. Be concise and helpful.
2. If you need to take an action, include it in a structured format.
3. If you learn something new about the user, consider storing it as a memory.
4. Respond in a natural, conversational manner.`
        },
        {
          role: "user",
          content: command
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      function_call: "auto",
      functions: [
        {
          name: "take_action",
          description: "Take an action based on the user's command",
          parameters: {
            type: "object",
            properties: {
              action_type: {
                type: "string",
                enum: ["navigate", "search", "playAudio", "setReminder", "other"],
                description: "The type of action to take"
              },
              parameters: {
                type: "object",
                description: "Parameters for the action"
              }
            },
            required: ["action_type"]
          }
        },
        {
          name: "create_memory",
          description: "Create a new memory based on user information",
          parameters: {
            type: "object",
            properties: {
              memory_type: {
                type: "string",
                enum: ["preference", "fact", "reminder", "skill"],
                description: "The type of memory to create"
              },
              content: {
                type: "object",
                description: "The content of the memory"
              },
              importance: {
                type: "integer",
                minimum: 1,
                maximum: 10,
                description: "The importance of this memory (1-10)"
              }
            },
            required: ["memory_type", "content"]
          }
        }
      ]
    });

    const responseMessage = completion.choices[0].message;
    let response = responseMessage.content || '';
    let action = null;
    let memoryCreated = false;

    // Handle function calls
    if (responseMessage.function_call) {
      const functionName = responseMessage.function_call.name;
      const functionArgs = JSON.parse(responseMessage.function_call.arguments || '{}');
      
      if (functionName === 'take_action') {
        action = {
          type: functionArgs.action_type,
          ...functionArgs.parameters
        };
      } else if (functionName === 'create_memory') {
        // Create a new memory
        const { data: memoryData, error: memoryError } = await serviceClient
          .from('vox_memory')
          .insert([
            {
              user_id: user.id,
              memory_type: functionArgs.memory_type,
              content: functionArgs.content,
              importance: functionArgs.importance || 1
            }
          ])
          .select()
          .single();

        if (memoryError) {
          console.error('Error creating memory:', memoryError);
        } else {
          memoryCreated = true;
        }
      }
    }

    // Update evolution with learning points
    if (evolution) {
      const { error: updateError } = await serviceClient
        .from('vox_evolution')
        .update({ 
          learning_points: evolution.learning_points + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', evolution.id)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating evolution:', updateError);
      }
    }

    // Return the response
    return res.status(200).json({
      response,
      action,
      memoryCreated,
      success: true
    });

  } catch (error) {
    console.error('Error processing command:', error);
    return res.status(500).json({ error: 'Failed to process command', success: false });
  }
}
