import { createClient } from '@supabase/supabase-js';

// Inicializar o cliente Supabase com as variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Usar a chave de serviço para ter acesso ao Vault
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Classe para gerenciar o Vault do Supabase no AgentVox
 * Permite armazenar e recuperar segredos de forma segura
 */
export class SupabaseVault {
  /**
   * Armazena um segredo no Vault
   * @param name Nome do segredo
   * @param secret Valor do segredo
   * @param description Descrição opcional do segredo
   * @returns O resultado da operação
   */
  async storeSecret(
    name: string,
    secret: string,
    description?: string
  ): Promise<any> {
    try {
      // Verificar se o segredo já existe
      const { data: existingSecret } = await supabase
        .from('vault.secrets')
        .select('id')
        .eq('name', name)
        .single();

      if (existingSecret) {
        // Atualizar segredo existente
        const { data, error } = await supabase.rpc('vault.update_secret', {
          secret_id: existingSecret.id,
          secret_value: secret,
          secret_description: description || '',
        });

        if (error) throw error;
        return { success: true, data, operation: 'update' };
      } else {
        // Criar novo segredo
        const { data, error } = await supabase.rpc('vault.create_secret', {
          secret_name: name,
          secret_value: secret,
          secret_description: description || '',
        });

        if (error) throw error;
        return { success: true, data, operation: 'create' };
      }
    } catch (error) {
      console.error('Erro ao armazenar segredo no Vault:', error);
      return { success: false, error };
    }
  }

  /**
   * Recupera um segredo do Vault
   * @param name Nome do segredo
   * @returns O valor do segredo ou null se não encontrado
   */
  async getSecret(name: string): Promise<string | null> {
    try {
      // Buscar o segredo pelo nome
      const { data, error } = await supabase
        .from('vault.decrypted_secrets')
        .select('decrypted_secret')
        .eq('name', name)
        .single();

      if (error) throw error;
      return data?.decrypted_secret || null;
    } catch (error) {
      console.error('Erro ao recuperar segredo do Vault:', error);
      return null;
    }
  }

  /**
   * Lista todos os segredos disponíveis no Vault
   * @param includeValues Se true, inclui os valores decriptados (use com cuidado)
   * @returns Lista de segredos
   */
  async listSecrets(includeValues: boolean = false): Promise<any[]> {
    try {
      if (includeValues) {
        // Buscar segredos com valores decriptados
        const { data, error } = await supabase
          .from('vault.decrypted_secrets')
          .select('id, name, description, decrypted_secret, created_at, updated_at');

        if (error) throw error;
        return data || [];
      } else {
        // Buscar segredos sem valores decriptados (mais seguro)
        const { data, error } = await supabase
          .from('vault.secrets')
          .select('id, name, description, created_at, updated_at');

        if (error) throw error;
        return data || [];
      }
    } catch (error) {
      console.error('Erro ao listar segredos do Vault:', error);
      return [];
    }
  }

  /**
   * Remove um segredo do Vault
   * @param name Nome do segredo
   * @returns O resultado da operação
   */
  async deleteSecret(name: string): Promise<any> {
    try {
      // Buscar o ID do segredo pelo nome
      const { data: secretData } = await supabase
        .from('vault.secrets')
        .select('id')
        .eq('name', name)
        .single();

      if (!secretData) {
        return { success: false, error: 'Segredo não encontrado' };
      }

      // Remover o segredo
      const { data, error } = await supabase
        .from('vault.secrets')
        .delete()
        .eq('id', secretData.id);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao remover segredo do Vault:', error);
      return { success: false, error };
    }
  }

  /**
   * Cria uma nova chave de criptografia no Vault
   * @param name Nome da chave
   * @param description Descrição opcional da chave
   * @returns O resultado da operação
   */
  async createEncryptionKey(name: string, description?: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('vault.create_key', {
        key_name: name,
        key_description: description || '',
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao criar chave de criptografia no Vault:', error);
      return { success: false, error };
    }
  }

  /**
   * Lista todas as chaves de criptografia disponíveis no Vault
   * @returns Lista de chaves
   */
  async listEncryptionKeys(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('vault.encryption_keys')
        .select('id, name, description, created_at, updated_at');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao listar chaves de criptografia do Vault:', error);
      return [];
    }
  }
}

// Exportar uma instância singleton
export const vaultService = new SupabaseVault();
