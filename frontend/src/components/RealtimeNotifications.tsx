import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { realtimeService } from '../utils/realtime/supabase-realtime';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

interface RealtimeNotificationsProps {
  maxNotifications?: number;
}

/**
 * Componente para exibir notificações em tempo real usando Supabase Realtime
 * Demonstra o uso de Broadcast e Postgres Changes
 */
const RealtimeNotifications: React.FC<RealtimeNotificationsProps> = ({
  maxNotifications = 5,
}) => {
  const supabase = useSupabaseClient();
  const user = useUser();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [testMessage, setTestMessage] = useState<string>('');

  // Configurar canais Realtime ao montar o componente
  useEffect(() => {
    if (!user) return;

    // Canal para notificações de broadcast (mensagens efêmeras)
    const broadcastChannel = realtimeService.createBroadcastChannel(
      'notifications',
      'new-notification',
      (payload) => {
        const newNotification = payload.payload as Notification;
        
        // Adicionar a nova notificação à lista
        setNotifications((prev) => {
          const updated = [newNotification, ...prev].slice(0, maxNotifications);
          
          // Atualizar contador de não lidas
          setUnreadCount((count) => count + 1);
          
          return updated;
        });
      }
    );

    // Canal para alterações no banco de dados (persistentes)
    // Exemplo: se você tiver uma tabela 'notifications' no banco
    realtimeService.subscribeToTableChanges(
      'db-notifications',
      'public',
      'notifications',
      'INSERT',
      (payload) => {
        const { new: newNotification } = payload;
        
        // Verificar se a notificação é para o usuário atual
        if (newNotification.user_id === user.id) {
          setNotifications((prev) => {
            const notification = {
              id: newNotification.id,
              message: newNotification.message,
              type: newNotification.type,
              timestamp: newNotification.created_at,
              read: false,
            };
            
            const updated = [notification, ...prev].slice(0, maxNotifications);
            
            // Atualizar contador de não lidas
            setUnreadCount((count) => count + 1);
            
            return updated;
          });
        }
      }
    );

    // Limpar canais ao desmontar o componente
    return () => {
      realtimeService.removeChannel('notifications');
      realtimeService.removeChannel('db-notifications');
    };
  }, [user, maxNotifications]);

  // Marcar todas as notificações como lidas
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  // Alternar visibilidade do painel de notificações
  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    if (!showNotifications) {
      markAllAsRead();
    }
  };

  // Enviar uma notificação de teste
  const sendTestNotification = () => {
    if (!testMessage.trim()) return;

    const newNotification: Notification = {
      id: Date.now().toString(),
      message: testMessage,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Enviar via broadcast
    realtimeService.sendBroadcastMessage(
      'notifications',
      'new-notification',
      newNotification
    );

    setTestMessage('');
  };

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <button
        onClick={toggleNotifications}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Contador de notificações não lidas */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Painel de notificações */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
          <div className="p-3 bg-gray-100 border-b flex justify-between items-center">
            <h3 className="font-medium">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
          
          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhuma notificação
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`p-3 border-b last:border-b-0 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      {/* Ícone baseado no tipo de notificação */}
                      <div className="mr-3">
                        {notification.type === 'success' && (
                          <span className="text-green-500">✓</span>
                        )}
                        {notification.type === 'warning' && (
                          <span className="text-yellow-500">⚠</span>
                        )}
                        {notification.type === 'error' && (
                          <span className="text-red-500">✗</span>
                        )}
                        {notification.type === 'info' && (
                          <span className="text-blue-500">ℹ</span>
                        )}
                      </div>
                      
                      {/* Conteúdo da notificação */}
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Campo para enviar notificação de teste */}
          <div className="p-3 bg-gray-100 border-t">
            <div className="flex">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enviar notificação de teste..."
                className="flex-1 px-3 py-1 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && sendTestNotification()}
              />
              <button
                onClick={sendTestNotification}
                disabled={!testMessage.trim()}
                className="px-3 py-1 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Isso demonstra o recurso de Broadcast do Supabase Realtime
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeNotifications;
