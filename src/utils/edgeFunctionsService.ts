import { supabase } from './supabase';

/**
 * Service for interacting with Supabase Edge Functions
 */
class EdgeFunctionsService {
  /**
   * Call a Supabase Edge Function
   * @param functionName Name of the Edge Function to call
   * @param payload Data to send to the function
   * @param options Additional options for the function call
   * @returns Response from the Edge Function
   */
  async callFunction<T = any>(
    functionName: string,
    payload?: any,
    options?: {
      headers?: Record<string, string>;
    }
  ): Promise<T> {
    try {
      const { data, error } = await supabase.functions.invoke<T>(
        functionName,
        {
          body: payload,
          headers: options?.headers,
        }
      );

      if (error) {
        console.error(`Error calling ${functionName}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error in EdgeFunctionsService.callFunction(${functionName}):`, error);
      throw error;
    }
  }

  /**
   * Call the API Edge Function
   * @param path Path within the API function
   * @param method HTTP method
   * @param data Request data
   * @returns Response from the API
   */
  async callApi<T = any>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    return this.callFunction<T>('api', {
      method,
      path,
      data,
    });
  }

  /**
   * Call the Memory Edge Function
   * @param method HTTP method
   * @param path Path within the memory function
   * @param memory Memory data
   * @returns Response from the memory function
   */
  async callMemory<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    memory?: any
  ): Promise<T> {
    return this.callFunction<T>('memory', {
      method,
      path,
      memory,
    });
  }

  /**
   * Call the Voice Edge Function to process audio
   * @param audioBlob Audio blob to process
   * @returns Transcribed text
   */
  async processAudio(audioBlob: Blob): Promise<{ text: string }> {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const { data: signedURL } = await supabase.storage
      .from('audio-uploads')
      .createSignedUploadUrl('temp-audio.webm');

    if (!signedURL) {
      throw new Error('Failed to get signed URL for audio upload');
    }

    // Upload the audio file
    const uploadResponse = await fetch(signedURL.signedUrl, {
      method: 'PUT',
      body: audioBlob,
      headers: {
        'Content-Type': 'audio/webm',
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload audio file');
    }

    // Process the audio using the voice function
    return this.callFunction<{ text: string }>('voice', {
      audioPath: signedURL.path,
    });
  }

  /**
   * Create a new memory
   * @param memory Memory data to create
   * @returns Created memory
   */
  async createMemory(memory: {
    title: string;
    content: string;
    importance?: number;
    tags?: string[];
  }): Promise<any> {
    return this.callMemory('POST', 'create', memory);
  }

  /**
   * Search memories
   * @param query Search query
   * @param limit Maximum number of results
   * @param similarityThreshold Minimum similarity threshold
   * @returns Matching memories
   */
  async searchMemories(
    query: string,
    limit: number = 5,
    similarityThreshold: number = 0.7
  ): Promise<any> {
    return this.callMemory('POST', 'search', {
      query,
      limit,
      similarity_threshold: similarityThreshold,
    });
  }

  /**
   * Get user data
   * @returns User data
   */
  async getUserData(): Promise<any> {
    return this.callApi('user');
  }

  /**
   * Check API health
   * @returns Health status
   */
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return this.callApi('health');
  }
}

export const edgeFunctionsService = new EdgeFunctionsService();
export default edgeFunctionsService;
