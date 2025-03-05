import React, { useState, useEffect, useRef } from 'react';
import { deliveryTrackingService, CourierMessage } from '../../utils/realtime/delivery-tracking';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface CourierChatProps {
  orderId: string;
  courierId: string;
  customerId: string;
  userType: 'courier' | 'customer';
  userName: string;
}

const CourierChat: React.FC<CourierChatProps> = ({
  orderId,
  courierId,
  customerId,
  userType,
  userName,
}) => {
  const [messages, setMessages] = useState<CourierMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Carregar histórico de mensagens e configurar o canal de mensagens
  useEffect(() => {
    loadMessageHistory();

    // Configurar o canal de mensagens
    const handleNewMessage = (message: CourierMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    // Iniciar o canal de mensagens
    deliveryTrackingService.startMessageChannel(
      orderId,
      courierId,
      customerId,
      handleNewMessage
    );

    // Limpar ao desmontar
    return () => {
      // O canal será removido pelo deliveryTrackingService.endTracking
    };
  }, [orderId, courierId, customerId]);

  // Rolar para a última mensagem quando novas mensagens chegarem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carregar o histórico de mensagens
  const loadMessageHistory = async () => {
    setIsLoading(true);
    try {
      const history = await deliveryTrackingService.getMessageHistory(orderId);
      setMessages(history);
    } catch (error) {
      console.error('Erro ao carregar histórico de mensagens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Rolar para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Enviar uma nova mensagem
  const sendMessage = async () => {
    if ((!newMessage.trim() && !imageFile) || isLoading) return;

    setIsLoading(true);
    try {
      let imageUrl = '';

      // Se houver uma imagem, fazer upload primeiro
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Enviar a mensagem
      await deliveryTrackingService.sendMessage(
        orderId,
        courierId,
        customerId,
        newMessage,
        userType,
        imageUrl
      );

      // Limpar o campo de mensagem e a imagem
      setNewMessage('');
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Não foi possível enviar a mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload de imagem (simulado - substitua por sua lógica real de upload)
  const uploadImage = async (file: File): Promise<string> => {
    // Simulação de upload - substitua por sua lógica real
    return new Promise((resolve) => {
      setTimeout(() => {
        // Retornar uma URL fictícia - substitua por sua lógica real
        resolve(`https://example.com/images/${Date.now()}-${file.name}`);
      }, 1000);
    });
  };

  // Manipular seleção de imagem
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remover a imagem selecionada
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Iniciar uma chamada VoIP
  const startCall = () => {
    deliveryTrackingService.startVoipCall(
      orderId,
      courierId,
      customerId,
      userType,
      (event) => {
        console.log('Evento de chamada:', event);
        // Implementar lógica de chamada VoIP aqui
        // Pode usar WebRTC ou integrar com alguma solução de chamadas
      }
    );
  };

  // Formatar a data da mensagem
  const formatMessageTime = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      {/* Cabeçalho */}
      <CardHeader className="bg-primary text-primary-foreground py-4 flex flex-row justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Chat da Entrega</h2>
          <p className="text-sm opacity-80">Pedido #{orderId}</p>
        </div>
        <Button
          onClick={startCall}
          variant="secondary"
          size="icon"
          className="rounded-full"
          title="Iniciar chamada"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        </Button>
      </CardHeader>

      {/* Lista de mensagens */}
      <CardContent className="flex-1 p-4 overflow-y-auto bg-muted/20">
        {isLoading && messages.length === 0 ? (
          <div className="flex flex-col space-y-2 justify-center items-center h-full">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">Nenhuma mensagem ainda. Inicie a conversa!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === userType ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                    msg.sender === userType
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-secondary text-secondary-foreground rounded-bl-none'
                  }`}
                >
                  {msg.imageUrl && (
                    <div className="mb-2">
                      <img
                        src={msg.imageUrl}
                        alt="Imagem enviada"
                        className="rounded-md max-w-full h-auto"
                      />
                    </div>
                  )}
                  <p>{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === userType ? 'text-primary-foreground/70' : 'text-secondary-foreground/70'
                    }`}
                  >
                    {formatMessageTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      {/* Preview da imagem */}
      {imagePreview && (
        <div className="p-2 bg-muted/30 border-t border-border">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-auto rounded-md"
            />
            <Button
              onClick={removeImage}
              variant="destructive"
              size="icon"
              className="h-6 w-6 absolute -top-2 -right-2 rounded-full p-0"
              title="Remover imagem"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* Campo de entrada de mensagem */}
      <CardFooter className="p-3 bg-muted/30 border-t border-border">
        <div className="flex items-center w-full">
          <Button
            variant="ghost"
            size="icon"
            className="mr-1"
            asChild
          >
            <label
              htmlFor="image-upload"
              className="cursor-pointer"
              title="Enviar imagem"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
                disabled={isLoading}
              />
            </label>
          </Button>
          <div className="flex-1 flex">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="rounded-r-none"
              disabled={isLoading}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button
              onClick={sendMessage}
              disabled={(!newMessage.trim() && !imageFile) || isLoading}
              className="rounded-l-none"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Enviando...
                </span>
              ) : (
                'Enviar'
              )}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1 w-full">
          Comunicação direta com {userType === 'courier' ? 'o cliente' : 'o estafeta'}
        </p>
      </CardFooter>
    </Card>
  );
};

export default CourierChat;
