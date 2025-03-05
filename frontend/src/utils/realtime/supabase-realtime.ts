Need to install the following packages:
shadcn-ui@0.9.5
Ok to proceed? (y)

Need to install the following packages:
shadcn-ui@0.9.5
Ok to proceed? (y)y
Need to install the following packages:
shadcn-ui@0.9.5
Ok to proceed? (y)

import { createClient, RealtimeChannel } from '@supabase/supabase-js';

// Inicializar o cliente Supabase com as variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Classe para gerenciar funcionalidades Realtime do Supabase no AgentVox
 */
export class SupabaseRealtime {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Inscreve-se para receber alterações em uma tabela específica do banco de dados
   * @param channelName Nome único para o canal (não pode ser 'realtime')
   * @param schema Nome do schema (geralmente 'public')
   * @param table Nome da tabela para monitorar
   * @param event Tipo de evento ('INSERT', 'UPDATE', 'DELETE' ou '*')
   * @param callback Função a ser chamada quando ocorrer uma alteração
   * @returns O canal criado
   */
  subscribeToTableChanges(
    channelName: string,
    schema: string,
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    callback: (payload: any) => void
  ): RealtimeChannel {
    // Verificar se já existe um canal com este nome
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    // Criar um novo canal
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table,
        },
        (payload) => callback(payload)
      )
      .subscribe();

    // Armazenar o canal para referência futura
    this.channels.set(channelName, channel);

    return channel;
  }

  /**
   * Cria um canal de broadcast para comunicação em tempo real
   * @param roomName Nome da sala/tópico
   * @param eventName Nome do evento para filtrar
   * @param callback Função a ser chamada quando uma mensagem for recebida
   * @returns O canal criado
   */
  createBroadcastChannel(
    roomName: string,
    eventName: string,
    callback: (payload: any) => void
  ): RealtimeChannel {
    // Verificar se já existe um canal com este nome
    if (this.channels.has(roomName)) {
      return this.channels.get(roomName)!;
    }

    // Criar um novo canal com configuração para receber as próprias mensagens
    const channel = supabase
      .channel(roomName, {
        config: {
          broadcast: { self: true },
        },
      })
      .on('broadcast', { event: eventName }, (payload) => callback(payload))
      .subscribe();

    // Armazenar o canal para referência futura
    this.channels.set(roomName, channel);

    return channel;
  }

  /**
   * Envia uma mensagem através de um canal de broadcast
   * @param channelName Nome do canal
   * @param eventName Nome do evento
   * @param message Mensagem a ser enviada
   * @returns Promise que resolve quando a mensagem for enviada
   */
  async sendBroadcastMessage(
    channelName: string,
    eventName: string,
    message: any
  ): Promise<any> {
    // Verificar se o canal existe
    if (!this.channels.has(channelName)) {
      throw new Error(`Canal ${channelName} não encontrado`);
    }

    const channel = this.channels.get(channelName)!;

    // Enviar a mensagem
    return channel.send({
      type: 'broadcast',
      event: eventName,
      payload: message,
    });
  }

  /**
   * Cria um canal de presence para rastrear estado entre usuários
   * @param roomName Nome da sala/tópico
   * @param initialState Estado inicial do usuário
   * @param onSync Callback para evento de sincronização
   * @param onJoin Callback para evento de entrada
   * @param onLeave Callback para evento de saída
   * @returns O canal criado
   */
  createPresenceChannel(
    roomName: string,
    initialState: any,
    onSync?: () => void,
    onJoin?: (key: string, newPresences: any) => void,
    onLeave?: (key: string, leftPresences: any) => void
  ): RealtimeChannel {
    // Verificar se já existe um canal com este nome
    if (this.channels.has(roomName)) {
      return this.channels.get(roomName)!;
    }

    // Criar um novo canal
    const channel = supabase.channel(roomName);

    // Configurar os listeners de eventos
    if (onSync) {
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Presence state synchronized:', state);
        onSync();
      });
    }

    if (onJoin) {
      channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        onJoin(key, newPresences);
      });
    }

    if (onLeave) {
      channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        onLeave(key, leftPresences);
      });
    }

    // Inscrever-se no canal
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED' && initialState) {
        // Quando inscrito, começar a rastrear o estado
        channel.track(initialState);
      }
    });

    // Armazenar o canal para referência futura
    this.channels.set(roomName, channel);

    return channel;
  }

  /**
   * Atualiza o estado de presença em um canal
   * @param channelName Nome do canal
   * @param newState Novo estado
   * @returns Promise que resolve quando o estado for atualizado
   */
  async updatePresenceState(channelName: string, newState: any): Promise<any> {
    // Verificar se o canal existe
    if (!this.channels.has(channelName)) {
      throw new Error(`Canal ${channelName} não encontrado`);
    }

    const channel = this.channels.get(channelName)!;

    // Atualizar o estado
    return channel.track(newState);
  }

  /**
   * Remove um canal
   * @param channelName Nome do canal a ser removido
   */
  removeChannel(channelName: string): void {
    if (this.channels.has(channelName)) {
      const channel = this.channels.get(channelName)!;
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  /**
   * Remove todos os canais
   */
  removeAllChannels(): void {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

// Exportar uma instância singleton
export const realtimeService = new SupabaseRealtime();
