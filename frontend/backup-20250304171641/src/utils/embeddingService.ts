import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Tipos para o serviço de embeddings
export interface EmbeddingVector {
  vector: number[];
  text: string;
  metadata?: Record<string, any>;
}

export interface EmbeddingResult {
  id: string;
  vector: number[];
  text: string;
  metadata: Record<string, any>;
  similarity?: number;
}

export interface EmbeddingSearchParams {
  query: string;
  filter?: Record<string, any>;
  topK?: number;
  minSimilarity?: number;
}

/**
 * Serviço para geração e busca de embeddings usando OpenAI e Supabase Vector
 * Implementa técnicas de Retrieval Augmented Generation (RAG)
 */
class EmbeddingService {
  private embeddingModel = 'text-embedding-3-small';
  private embeddingDimension = 1536; // Dimensão do modelo text-embedding-3-small
  private supabase = supabase;
  private embeddingsTable = 'vox_embeddings';

  /**
   * Gera um embedding para um texto usando a API da OpenAI
   * @param text Texto para gerar embedding
   * @returns Vetor de embedding
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('/api/vox/embedding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model: this.embeddingModel
        }),
      });

      if (!response.ok) {
        throw new Error(`Embedding generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Armazena um embedding no banco de dados vetorial
   * @param userId ID do usuário
   * @param text Texto original
   * @param vector Vetor de embedding
   * @param metadata Metadados associados ao embedding
   * @returns ID do embedding armazenado
   */
  async storeEmbedding(
    userId: string,
    text: string,
    vector: number[],
    metadata: Record<string, any>
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from(this.embeddingsTable)
        .insert([
          {
            user_id: userId,
            text,
            embedding: vector,
            metadata,
            created_at: new Date().toISOString(),
          },
        ])
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error storing embedding:', error);
      throw error;
    }
  }

  /**
   * Busca embeddings similares usando similaridade de cosseno
   * @param userId ID do usuário
   * @param queryVector Vetor de consulta
   * @param params Parâmetros de busca
   * @returns Resultados ordenados por similaridade
   */
  async searchSimilarEmbeddings(
    userId: string,
    queryVector: number[],
    params: Omit<EmbeddingSearchParams, 'query'>
  ): Promise<EmbeddingResult[]> {
    try {
      const { filter = {}, topK = 5, minSimilarity = 0.7 } = params;
      
      // Construir a consulta com filtros
      let query = this.supabase
        .from(this.embeddingsTable)
        .select('id, text, embedding, metadata, created_at')
        .eq('user_id', userId)
        .order('similarity', { ascending: false })
        .limit(topK);
      
      // Adicionar filtros adicionais
      Object.entries(filter).forEach(([key, value]) => {
        if (key.startsWith('metadata.')) {
          const metadataKey = key.replace('metadata.', '');
          query = query.filter(`metadata->${metadataKey}`, 'eq', value);
        } else {
          query = query.eq(key, value);
        }
      });
      
      // Executar a busca vetorial usando a função de similaridade de cosseno do PostgreSQL/pgvector
      const { data, error } = await query.rpc('match_embeddings', {
        query_embedding: queryVector,
        match_threshold: minSimilarity,
        match_count: topK
      });

      if (error) throw error;
      
      return data.map((item: any) => ({
        id: item.id,
        text: item.text,
        vector: item.embedding,
        metadata: item.metadata,
        similarity: item.similarity
      }));
    } catch (error) {
      console.error('Error searching embeddings:', error);
      throw error;
    }
  }

  /**
   * Busca embeddings similares a partir de um texto de consulta
   * @param userId ID do usuário
   * @param query Texto de consulta
   * @param params Parâmetros de busca
   * @returns Resultados ordenados por similaridade
   */
  async searchByText(
    userId: string,
    query: string,
    params: Omit<EmbeddingSearchParams, 'query'>
  ): Promise<EmbeddingResult[]> {
    try {
      // Gerar embedding para o texto de consulta
      const queryVector = await this.generateEmbedding(query);
      
      // Buscar embeddings similares
      return this.searchSimilarEmbeddings(userId, queryVector, params);
    } catch (error) {
      console.error('Error searching by text:', error);
      throw error;
    }
  }

  /**
   * Atualiza um embedding existente
   * @param embeddingId ID do embedding
   * @param text Novo texto
   * @param metadata Novos metadados
   * @returns Sucesso da operação
   */
  async updateEmbedding(
    embeddingId: string,
    text: string,
    metadata: Record<string, any>
  ): Promise<boolean> {
    try {
      // Gerar novo embedding para o texto atualizado
      const vector = await this.generateEmbedding(text);
      
      const { error } = await this.supabase
        .from(this.embeddingsTable)
        .update({
          text,
          embedding: vector,
          metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', embeddingId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating embedding:', error);
      return false;
    }
  }

  /**
   * Remove um embedding do banco de dados
   * @param embeddingId ID do embedding
   * @returns Sucesso da operação
   */
  async deleteEmbedding(embeddingId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from(this.embeddingsTable)
        .delete()
        .eq('id', embeddingId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting embedding:', error);
      return false;
    }
  }

  /**
   * Processa um texto para melhorar a qualidade dos embeddings
   * Aplica técnicas de chunking, normalização e expansão de contexto
   * @param text Texto para processar
   * @returns Texto processado
   */
  processTextForEmbedding(text: string): string {
    // Remover caracteres especiais e normalizar espaços
    let processed = text.replace(/[^\w\s.,?!]/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Expandir abreviações comuns
    const abbreviations: Record<string, string> = {
      'p.ex.': 'por exemplo',
      'etc.': 'et cetera',
      'i.e.': 'isto é',
      'e.g.': 'por exemplo',
    };
    
    Object.entries(abbreviations).forEach(([abbr, expanded]) => {
      processed = processed.replace(new RegExp(`\\b${abbr}\\b`, 'g'), expanded);
    });
    
    return processed;
  }

  /**
   * Divide um texto longo em chunks para processamento mais eficiente
   * @param text Texto para dividir
   * @param maxChunkSize Tamanho máximo de cada chunk
   * @param overlap Sobreposição entre chunks
   * @returns Array de chunks de texto
   */
  chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 200): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    
    let currentChunk: string[] = [];
    let currentLength = 0;
    
    for (const word of words) {
      if (currentLength + word.length + 1 > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
        // Manter sobreposição para preservar contexto
        const overlapWords = currentChunk.slice(-Math.ceil(overlap / 5));
        currentChunk = [...overlapWords];
        currentLength = overlapWords.join(' ').length;
      }
      
      currentChunk.push(word);
      currentLength += word.length + 1; // +1 para o espaço
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }
    
    return chunks;
  }
}

export const embeddingService = new EmbeddingService();
export default embeddingService;
