import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import OpenAI from 'openai';

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * API endpoint para gerar embeddings usando OpenAI
 * 
 * Suporta os modelos:
 * - text-embedding-3-small (1536 dimensões)
 * - text-embedding-3-large (3072 dimensões)
 * - text-embedding-ada-002 (1536 dimensões, legado)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verificar método
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar autenticação
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extrair parâmetros
    const { text, model = 'text-embedding-3-small' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    // Validar modelo
    const validModels = ['text-embedding-3-small', 'text-embedding-3-large', 'text-embedding-ada-002'];
    if (!validModels.includes(model)) {
      return res.status(400).json({ 
        error: `Invalid model. Must be one of: ${validModels.join(', ')}` 
      });
    }

    // Pré-processamento do texto
    const processedText = text.trim();
    
    // Gerar embedding
    const embeddingResponse = await openai.embeddings.create({
      model: model,
      input: processedText,
      encoding_format: 'float'
    });

    // Extrair vetor de embedding
    const embedding = embeddingResponse.data[0].embedding;

    // Retornar resultado
    return res.status(200).json({
      embedding,
      model,
      dimensions: embedding.length,
      usage: embeddingResponse.usage
    });
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    
    // Determinar código de status apropriado
    const statusCode = error.status || 500;
    
    // Formatar mensagem de erro
    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : "Unknown error" || 'Internal server error';
    
    return res.status(statusCode).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}
