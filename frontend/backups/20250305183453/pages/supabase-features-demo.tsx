import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { realtimeService } from '../utils/realtime/supabase-realtime';
import { vaultService } from '../utils/vault/supabase-vault';

// Componente para demonstrar as funcionalidades do Supabase Vault e Realtime
export default function SupabaseFeaturesDemo() {
  const supabase = useSupabaseClient();
  const user = useUser();
  
  // Estados para o Realtime
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  
  // Estados para o Vault
  const [secrets, setSecrets] = useState<any[]>([]);
  const [secretName, setSecretName] = useState('');
  const [secretValue, setSecretValue] = useState('');
  const [secretDescription, setSecretDescription] = useState('');
  const [selectedSecret, setSelectedSecret] = useState<string | null>(null);
  const [retrievedSecret, setRetrievedSecret] = useState<string | null>(null);

  // Configurar canais Realtime ao carregar o componente
  useEffect(() => {
    if (!user) return;

    // 1. Configurar canal de broadcast para chat
    const chatChannel = realtimeService.createBroadcastChannel(
      'demo-chat',
      'new-message',
      (payload) => {
        setMessages((prev) => [...prev, payload.payload]);
      }
    );

    // 2. Configurar canal de presence para usuários online
    const presenceChannel = realtimeService.createPresenceChannel(
      'online-users',
      {
        user_id: user.id,
        username: user.email?.split('@')[0] || 'Anônimo',
        online_at: new Date().toISOString(),
      },
      // onSync
      () => {
        const channel = presenceChannel;
        const state = channel.presenceState();
        const users = Object.entries(state).map(([key, value]) => ({
          key,
          user: value[0],
        }));
        setOnlineUsers(users);
      },
      // onJoin
      (key, newPresences) => {
        setOnlineUsers((prev) => [
          ...prev,
          { key, user: newPresences[0] },
        ]);
      },
      // onLeave
      (key) => {
        setOnlineUsers((prev) => prev.filter((u) => u.key !== key));
      }
    );

    // 3. Configurar listener para alterações na tabela de mensagens (exemplo)
    realtimeService.subscribeToTableChanges(
      'messages-changes',
      'public',
      'messages',
      '*',
      (payload) => {
        console.log('Alteração na tabela de mensagens:', payload);
        // Aqui você poderia atualizar a lista de mensagens baseado nas alterações do banco
      }
    );

    // Carregar segredos do Vault (apenas nomes, não valores)
    loadSecrets();

    // Limpar canais ao desmontar o componente
    return () => {
      realtimeService.removeAllChannels();
    };
  }, [user]);

  // Função para enviar mensagem
  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageData = {
      text: newMessage,
      sender: user.email?.split('@')[0] || 'Anônimo',
      timestamp: new Date().toISOString(),
    };

    await realtimeService.sendBroadcastMessage(
      'demo-chat',
      'new-message',
      messageData
    );

    // Opcional: Salvar a mensagem no banco de dados
    // await supabase.from('messages').insert([messageData]);

    setNewMessage('');
  };

  // Funções para o Vault
  const loadSecrets = async () => {
    const secretsList = await vaultService.listSecrets();
    setSecrets(secretsList);
  };

  const saveSecret = async () => {
    if (!secretName.trim() || !secretValue.trim()) return;

    await vaultService.storeSecret(
      secretName,
      secretValue,
      secretDescription
    );

    // Limpar campos e recarregar lista
    setSecretName('');
    setSecretValue('');
    setSecretDescription('');
    loadSecrets();
  };

  const getSecret = async () => {
    if (!selectedSecret) return;

    const value = await vaultService.getSecret(selectedSecret);
    setRetrievedSecret(value);
  };

  const deleteSecret = async () => {
    if (!selectedSecret) return;

    await vaultService.deleteSecret(selectedSecret);
    setSelectedSecret(null);
    setRetrievedSecret(null);
    loadSecrets();
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Demonstração de Recursos Avançados do Supabase</h1>
        <p>Você precisa estar logado para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Demonstração de Recursos Avançados do Supabase</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seção Realtime */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">Supabase Realtime</h2>

          {/* Usuários online (Presence) */}
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Usuários Online</h3>
            <div className="bg-gray-100 p-3 rounded-md max-h-32 overflow-y-auto">
              {onlineUsers.length === 0 ? (
                <p className="text-gray-500">Nenhum usuário online</p>
              ) : (
                <ul>
                  {onlineUsers.map((u) => (
                    <li key={u.key} className="mb-1">
                      {u.user.username} (online desde {new Date(u.user.online_at).toLocaleTimeString()})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Chat em tempo real (Broadcast) */}
          <div>
            <h3 className="text-lg font-medium mb-2">Chat em Tempo Real</h3>
            <div className="bg-gray-100 p-3 rounded-md h-64 mb-3 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-gray-500">Nenhuma mensagem ainda</p>
              ) : (
                <ul>
                  {messages.map((msg, i) => (
                    <li key={i} className="mb-2">
                      <span className="font-semibold">{msg.sender}:</span> {msg.text}
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-grow border rounded-l-md px-3 py-2"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>

        {/* Seção Vault */}
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">Supabase Vault</h2>

          {/* Adicionar novo segredo */}
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Adicionar Segredo</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={secretName}
                onChange={(e) => setSecretName(e.target.value)}
                placeholder="Nome do segredo"
                className="w-full border rounded-md px-3 py-2"
              />
              <input
                type="password"
                value={secretValue}
                onChange={(e) => setSecretValue(e.target.value)}
                placeholder="Valor do segredo"
                className="w-full border rounded-md px-3 py-2"
              />
              <input
                type="text"
                value={secretDescription}
                onChange={(e) => setSecretDescription(e.target.value)}
                placeholder="Descrição (opcional)"
                className="w-full border rounded-md px-3 py-2"
              />
              <button
                onClick={saveSecret}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full"
              >
                Salvar Segredo
              </button>
            </div>
          </div>

          {/* Gerenciar segredos existentes */}
          <div>
            <h3 className="text-lg font-medium mb-2">Gerenciar Segredos</h3>
            <div className="bg-gray-100 p-3 rounded-md mb-3 max-h-48 overflow-y-auto">
              {secrets.length === 0 ? (
                <p className="text-gray-500">Nenhum segredo armazenado</p>
              ) : (
                <ul>
                  {secrets.map((secret) => (
                    <li
                      key={secret.id}
                      className={`mb-2 p-2 rounded cursor-pointer ${
                        selectedSecret === secret.name ? 'bg-blue-100' : ''
                      }`}
                      onClick={() => setSelectedSecret(secret.name)}
                    >
                      <div className="font-semibold">{secret.name}</div>
                      {secret.description && (
                        <div className="text-sm text-gray-600">{secret.description}</div>
                      )}
                      <div className="text-xs text-gray-500">
                        Criado em: {new Date(secret.created_at).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={getSecret}
                disabled={!selectedSecret}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex-1 disabled:opacity-50"
              >
                Recuperar
              </button>
              <button
                onClick={deleteSecret}
                disabled={!selectedSecret}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex-1 disabled:opacity-50"
              >
                Excluir
              </button>
            </div>
            {retrievedSecret !== null && (
              <div className="mt-3 p-3 bg-yellow-100 rounded-md">
                <p className="font-medium">Valor recuperado:</p>
                <p className="font-mono break-all">{retrievedSecret}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
