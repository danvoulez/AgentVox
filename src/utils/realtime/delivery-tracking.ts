import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { realtimeService } from './supabase-realtime';

// Inicializar o cliente Supabase com as variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Interface para representar a localização do estafeta
 */
export interface CourierLocation {
  courierId: string;
  orderId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  status: 'preparing' | 'picked_up' | 'on_the_way' | 'delivered' | 'issue';
  estimatedArrival?: string;
}

/**
 * Interface para representar uma mensagem entre estafeta e cliente
 */
export interface CourierMessage {
  id: string;
  courierId: string;
  orderId: string;
  customerId: string;
  message: string;
  imageUrl?: string;
  sender: 'courier' | 'customer';
  timestamp: string;
  read: boolean;
}

/**
 * Classe para gerenciar o rastreamento e comunicação com estafetas
 */
export class DeliveryTrackingService {
  private locationChannels: Map<string, RealtimeChannel> = new Map();
  private messageChannels: Map<string, RealtimeChannel> = new Map();
  private callChannels: Map<string, RealtimeChannel> = new Map();
  private sentLinks: Set<string> = new Set(); // Rastrear links já enviados para evitar duplicação

  /**
   * Gera um link único para rastreamento de entrega
   * @param orderId ID do pedido
   * @param courierId ID do estafeta
   * @returns URL para rastreamento
   */
  generateTrackingLink(orderId: string, courierId: string): string {
    // Gerar um token único para o link (poderia ser um JWT para mais segurança)
    const trackingToken = btoa(`${orderId}-${courierId}-${Date.now()}`);
    
    // Construir a URL de rastreamento (ajuste conforme seu domínio)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vvsistema.com';
    return `${baseUrl}/track/${trackingToken}`;
  }

  /**
   * Envia automaticamente o link de rastreamento para o cliente
   * @param orderId ID do pedido
   * @param courierId ID do estafeta
   * @param customerId ID do cliente
   * @param customerEmail Email do cliente (opcional)
   * @param customerPhone Telefone do cliente (opcional)
   * @returns Objeto com status do envio e o link gerado
   */
  async sendTrackingLinkToCustomer(
    orderId: string,
    courierId: string,
    customerId: string,
    customerEmail?: string,
    customerPhone?: string
  ): Promise<{ success: boolean; link: string; error?: any }> {
    try {
      // Verificar se o link já foi enviado para este pedido
      const trackingKey = `${orderId}-${courierId}`;
      if (this.sentLinks.has(trackingKey)) {
        // Link já foi enviado anteriormente
        return {
          success: false,
          link: '',
          error: 'Link de rastreamento já enviado para este pedido'
        };
      }

      // Gerar o link de rastreamento
      const trackingLink = this.generateTrackingLink(orderId, courierId);
      
      // Salvar o link na tabela de rastreamento para referência futura
      const { error: saveError } = await supabase
        .from('delivery.tracking_links')
        .insert({
          order_id: orderId,
          courier_id: courierId,
          customer_id: customerId,
          tracking_link: trackingLink,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Expira em 24 horas
        });
      
      if (saveError) throw saveError;
      
      // Enviar o link por email se o email estiver disponível
      if (customerEmail) {
        // Implementar o envio de email aqui
        // Pode usar um serviço de email como SendGrid, Mailchimp, etc.
        // Exemplo: await emailService.sendTrackingLink(customerEmail, trackingLink);
      }
      
      // Enviar o link por SMS se o telefone estiver disponível
      if (customerPhone) {
        // Implementar o envio de SMS aqui
        // Pode usar um serviço de SMS como Twilio, MessageBird, etc.
        // Exemplo: await smsService.sendTrackingLink(customerPhone, trackingLink);
      }
      
      // Enviar uma notificação no sistema para o cliente
      await this.sendSystemNotification(
        customerId,
        'Rastreamento de Entrega',
        `Seu pedido #${orderId} está a caminho! Acompanhe em tempo real: ${trackingLink}`,
        trackingLink
      );
      
      // Marcar este link como enviado para evitar duplicação
      this.sentLinks.add(trackingKey);
      
      return { success: true, link: trackingLink };
    } catch (error) {
      console.error('Erro ao enviar link de rastreamento:', error);
      return { success: false, link: '', error };
    }
  }

  /**
   * Inicia o rastreamento da localização do estafeta
   * @param courierId ID do estafeta
   * @param orderId ID do pedido
   * @param onLocationUpdate Callback para atualização de localização
   * @returns O canal criado
   */
  startLocationTracking(
    courierId: string,
    orderId: string,
    onLocationUpdate?: (location: CourierLocation) => void
  ): RealtimeChannel {
    const channelId = `location-${orderId}`;
    
    // Verificar se já existe um canal para este pedido
    if (this.locationChannels.has(channelId)) {
      return this.locationChannels.get(channelId)!;
    }
    
    // Criar um canal para transmitir a localização
    const channel = realtimeService.createBroadcastChannel(
      channelId,
      'location-update',
      (payload) => {
        const location = payload.payload as CourierLocation;
        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
      }
    );
    
    // Armazenar o canal para referência futura
    this.locationChannels.set(channelId, channel);
    
    return channel;
  }

  /**
   * Atualiza a localização do estafeta
   * @param courierId ID do estafeta
   * @param orderId ID do pedido
   * @param latitude Latitude atual
   * @param longitude Longitude atual
   * @param status Status da entrega
   * @param estimatedArrival Estimativa de chegada (opcional)
   * @returns Promise que resolve quando a atualização for enviada
   */
  async updateCourierLocation(
    courierId: string,
    orderId: string,
    latitude: number,
    longitude: number,
    status: CourierLocation['status'],
    estimatedArrival?: string
  ): Promise<any> {
    const channelId = `location-${orderId}`;
    
    // Verificar se o canal existe
    if (!this.locationChannels.has(channelId)) {
      this.startLocationTracking(courierId, orderId);
    }
    
    const channel = this.locationChannels.get(channelId)!;
    
    // Criar objeto de localização
    const locationUpdate: CourierLocation = {
      courierId,
      orderId,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      status,
      estimatedArrival,
    };
    
    // Enviar atualização via broadcast
    return realtimeService.sendBroadcastMessage(
      channelId,
      'location-update',
      locationUpdate
    );
  }

  /**
   * Inicia o canal de mensagens entre estafeta e cliente
   * @param orderId ID do pedido
   * @param courierId ID do estafeta
   * @param customerId ID do cliente
   * @param onNewMessage Callback para novas mensagens
   * @returns O canal criado
   */
  startMessageChannel(
    orderId: string,
    courierId: string,
    customerId: string,
    onNewMessage?: (message: CourierMessage) => void
  ): RealtimeChannel {
    const channelId = `messages-${orderId}`;
    
    // Verificar se já existe um canal para este pedido
    if (this.messageChannels.has(channelId)) {
      return this.messageChannels.get(channelId)!;
    }
    
    // Criar um canal para mensagens
    const channel = realtimeService.createBroadcastChannel(
      channelId,
      'new-message',
      (payload) => {
        const message = payload.payload as CourierMessage;
        if (onNewMessage) {
          onNewMessage(message);
        }
        
        // Também podemos salvar a mensagem no banco de dados para histórico
        this.saveMessageToDatabase(message);
      }
    );
    
    // Armazenar o canal para referência futura
    this.messageChannels.set(channelId, channel);
    
    return channel;
  }

  /**
   * Envia uma mensagem entre estafeta e cliente
   * @param orderId ID do pedido
   * @param courierId ID do estafeta
   * @param customerId ID do cliente
   * @param message Texto da mensagem
   * @param sender Quem está enviando (estafeta ou cliente)
   * @param imageUrl URL da imagem (opcional)
   * @returns Promise que resolve quando a mensagem for enviada
   */
  async sendMessage(
    orderId: string,
    courierId: string,
    customerId: string,
    message: string,
    sender: 'courier' | 'customer',
    imageUrl?: string
  ): Promise<any> {
    const channelId = `messages-${orderId}`;
    
    // Verificar se o canal existe
    if (!this.messageChannels.has(channelId)) {
      this.startMessageChannel(orderId, courierId, customerId);
    }
    
    // Criar objeto de mensagem
    const messageObj: CourierMessage = {
      id: Date.now().toString(),
      courierId,
      orderId,
      customerId,
      message,
      imageUrl,
      sender,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    // Enviar mensagem via broadcast
    return realtimeService.sendBroadcastMessage(
      channelId,
      'new-message',
      messageObj
    );
  }

  /**
   * Salva uma mensagem no banco de dados para histórico
   * @param message Mensagem a ser salva
   * @returns Promise que resolve quando a mensagem for salva
   */
  private async saveMessageToDatabase(message: CourierMessage): Promise<any> {
    try {
      // Salvar a mensagem na tabela de mensagens
      const { data, error } = await supabase
        .from('courier_messages')
        .insert([
          {
            courier_id: message.courierId,
            order_id: message.orderId,
            customer_id: message.customerId,
            message: message.message,
            image_url: message.imageUrl,
            sender: message.sender,
            timestamp: message.timestamp,
            read: message.read,
          },
        ]);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao salvar mensagem no banco de dados:', error);
      return null;
    }
  }

  /**
   * Inicia uma chamada VoIP entre estafeta e cliente
   * @param orderId ID do pedido
   * @param courierId ID do estafeta
   * @param customerId ID do cliente
   * @param initiator Quem está iniciando a chamada
   * @param onCallEvent Callback para eventos da chamada
   * @returns O canal criado
   */
  startVoipCall(
    orderId: string,
    courierId: string,
    customerId: string,
    initiator: 'courier' | 'customer',
    onCallEvent?: (event: any) => void
  ): RealtimeChannel {
    const channelId = `call-${orderId}`;
    
    // Verificar se já existe um canal para este pedido
    if (this.callChannels.has(channelId)) {
      return this.callChannels.get(channelId)!;
    }
    
    // Criar um canal para a chamada
    const channel = realtimeService.createBroadcastChannel(
      channelId,
      'call-event',
      (payload) => {
        if (onCallEvent) {
          onCallEvent(payload.payload);
        }
      }
    );
    
    // Armazenar o canal para referência futura
    this.callChannels.set(channelId, channel);
    
    // Enviar evento de início de chamada
    realtimeService.sendBroadcastMessage(
      channelId,
      'call-event',
      {
        type: 'call-start',
        orderId,
        courierId,
        customerId,
        initiator,
        timestamp: new Date().toISOString(),
      }
    );
    
    return channel;
  }

  /**
   * Encerra uma chamada VoIP
   * @param orderId ID do pedido
   * @param endedBy Quem encerrou a chamada
   * @returns Promise que resolve quando o evento for enviado
   */
  async endVoipCall(
    orderId: string,
    endedBy: 'courier' | 'customer'
  ): Promise<any> {
    const channelId = `call-${orderId}`;
    
    // Verificar se o canal existe
    if (!this.callChannels.has(channelId)) {
      return null;
    }
    
    // Enviar evento de fim de chamada
    return realtimeService.sendBroadcastMessage(
      channelId,
      'call-event',
      {
        type: 'call-end',
        orderId,
        endedBy,
        timestamp: new Date().toISOString(),
      }
    );
  }

  /**
   * Encerra o rastreamento e comunicação para um pedido
   * @param orderId ID do pedido
   */
  endTracking(orderId: string): void {
    // Remover canais de localização
    const locationChannelId = `location-${orderId}`;
    if (this.locationChannels.has(locationChannelId)) {
      realtimeService.removeChannel(locationChannelId);
      this.locationChannels.delete(locationChannelId);
    }
    
    // Remover canais de mensagens
    const messageChannelId = `messages-${orderId}`;
    if (this.messageChannels.has(messageChannelId)) {
      realtimeService.removeChannel(messageChannelId);
      this.messageChannels.delete(messageChannelId);
    }
    
    // Remover canais de chamadas
    const callChannelId = `call-${orderId}`;
    if (this.callChannels.has(callChannelId)) {
      realtimeService.removeChannel(callChannelId);
      this.callChannels.delete(callChannelId);
    }
  }

  /**
   * Obtém o histórico de mensagens para um pedido
   * @param orderId ID do pedido
   * @returns Promise que resolve com o histórico de mensagens
   */
  async getMessageHistory(orderId: string): Promise<CourierMessage[]> {
    try {
      const { data, error } = await supabase
        .from('courier_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: true });
      
      if (error) throw error;
      
      // Converter do formato do banco para o formato da interface
      return (data || []).map((msg) => ({
        id: msg.id,
        courierId: msg.courier_id,
        orderId: msg.order_id,
        customerId: msg.customer_id,
        message: msg.message,
        imageUrl: msg.image_url,
        sender: msg.sender,
        timestamp: msg.timestamp,
        read: msg.read,
      }));
    } catch (error) {
      console.error('Erro ao obter histórico de mensagens:', error);
      return [];
    }
  }
}

  /**
   * Envia uma notificação do sistema para o cliente
   * @param customerId ID do cliente
   * @param title Título da notificação
   * @param message Mensagem da notificação
   * @param link Link opcional para ação
   */
  private async sendSystemNotification(
    customerId: string,
    title: string,
    message: string,
    link?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: customerId,
          title,
          message,
          link,
          type: 'delivery_tracking',
          read: false,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Notificar o cliente em tempo real usando o canal de broadcast
      realtimeService.sendBroadcastMessage(
        'notification',
        customerId,
        {
          type: 'new_notification',
          title,
          message,
          link
        }
      );
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  }

  /**
   * Associa um estafeta a um pedido e envia automaticamente o link de rastreamento
   * @param orderId ID do pedido
   * @param courierId ID do estafeta
   * @param customerId ID do cliente
   * @param customerEmail Email do cliente (opcional)
   * @param customerPhone Telefone do cliente (opcional)
   * @returns Objeto com status da operação e link de rastreamento
   */
  async assignCourierToOrder(
    orderId: string,
    courierId: string,
    customerId: string,
    customerEmail?: string,
    customerPhone?: string
  ): Promise<{ success: boolean; trackingLink?: string; error?: any }> {
    try {
      // 1. Atualizar o pedido com o ID do estafeta
      const { error: updateError } = await supabase
        .from('sales.sales')
        .update({ 
          courier_id: courierId,
          status: 'shipped',
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);
      
      if (updateError) throw updateError;
      
      // 2. Enviar o link de rastreamento para o cliente
      const { success, link, error: sendError } = await this.sendTrackingLinkToCustomer(
        orderId,
        courierId,
        customerId,
        customerEmail,
        customerPhone
      );
      
      if (!success) throw sendError;
      
      return { success: true, trackingLink: link };
    } catch (error) {
      console.error('Erro ao atribuir estafeta ao pedido:', error);
      return { success: false, error };
    }
  }

// Exportar uma instância singleton
export const deliveryTrackingService = new DeliveryTrackingService();
