import React, { useState, useEffect } from 'react';
import { vaultService } from '../utils/vault/supabase-vault';

interface OpenAIKeyManagerProps {
  onKeyChange?: (key: string | null) => void;
}

/**
 * Componente para gerenciar a chave da API da OpenAI usando o Supabase Vault
 * Permite armazenar, recuperar e atualizar a chave de forma segura
 */
const OpenAIKeyManager: React.FC<OpenAIKeyManagerProps> = ({ onKeyChange }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | null }>({
    text: '',
    type: null,
  });

  // Carregar a chave da API da OpenAI do Vault ao montar o componente
  useEffect(() => {
    loadApiKey();
  }, []);

  // Carregar a chave da API da OpenAI do Vault
  const loadApiKey = async () => {
    setIsLoading(true);
    try {
      const key = await vaultService.getSecret('openai-api-key');
      setSavedKey(key);
      if (key && onKeyChange) {
        onKeyChange(key);
      }
      setMessage({
        text: key ? 'Chave da API da OpenAI carregada com sucesso' : 'Nenhuma chave da API da OpenAI encontrada',
        type: key ? 'success' : 'info',
      });
    } catch (error) {
      console.error('Erro ao carregar a chave da API da OpenAI:', error);
      setMessage({
        text: 'Erro ao carregar a chave da API da OpenAI',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar a chave da API da OpenAI no Vault
  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      setMessage({
        text: 'Por favor, insira uma chave da API válida',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      await vaultService.storeSecret(
        'openai-api-key',
        apiKey,
        'Chave da API da OpenAI para o AgentVox'
      );
      setSavedKey(apiKey);
      if (onKeyChange) {
        onKeyChange(apiKey);
      }
      setMessage({
        text: 'Chave da API da OpenAI salva com sucesso',
        type: 'success',
      });
      setApiKey(''); // Limpar o campo após salvar
    } catch (error) {
      console.error('Erro ao salvar a chave da API da OpenAI:', error);
      setMessage({
        text: 'Erro ao salvar a chave da API da OpenAI',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remover a chave da API da OpenAI do Vault
  const removeApiKey = async () => {
    if (!savedKey) {
      setMessage({
        text: 'Nenhuma chave da API para remover',
        type: 'info',
      });
      return;
    }

    setIsLoading(true);
    try {
      await vaultService.deleteSecret('openai-api-key');
      setSavedKey(null);
      if (onKeyChange) {
        onKeyChange(null);
      }
      setMessage({
        text: 'Chave da API da OpenAI removida com sucesso',
        type: 'success',
      });
    } catch (error) {
      console.error('Erro ao remover a chave da API da OpenAI:', error);
      setMessage({
        text: 'Erro ao remover a chave da API da OpenAI',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Gerenciador de Chave da OpenAI</h2>
      
      {/* Status da chave atual */}
      <div className="mb-4 p-3 bg-gray-100 rounded-md">
        <h3 className="font-medium mb-1">Status da Chave:</h3>
        {isLoading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : savedKey ? (
          <div>
            <p className="text-green-600 font-medium">✅ Chave da API armazenada com segurança</p>
            <p className="text-sm text-gray-500 mt-1">
              A chave está armazenada de forma criptografada no Supabase Vault
            </p>
          </div>
        ) : (
          <p className="text-yellow-600">⚠️ Nenhuma chave da API armazenada</p>
        )}
      </div>

      {/* Formulário para adicionar/atualizar a chave */}
      <div className="mb-4">
        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
          Chave da API da OpenAI
        </label>
        <input
          type="password"
          id="apiKey"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Botões de ação */}
      <div className="flex space-x-2">
        <button
          onClick={saveApiKey}
          disabled={isLoading || !apiKey.trim()}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {savedKey ? 'Atualizar Chave' : 'Salvar Chave'}
        </button>
        {savedKey && (
          <button
            onClick={removeApiKey}
            disabled={isLoading}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Remover Chave
          </button>
        )}
      </div>

      {/* Mensagem de feedback */}
      {message.text && message.type && (
        <div
          className={`mt-4 p-3 rounded-md ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : message.type === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Informações adicionais */}
      <div className="mt-6 text-sm text-gray-500">
        <p className="mb-1">
          <strong>Nota de segurança:</strong> Sua chave da API é armazenada de forma criptografada no Supabase Vault.
        </p>
        <p>
          Isso é mais seguro do que armazená-la em arquivos .env ou variáveis de ambiente comuns, pois o Vault usa
          criptografia autenticada para proteger seus segredos.
        </p>
      </div>
    </div>
  );
};

export default OpenAIKeyManager;
