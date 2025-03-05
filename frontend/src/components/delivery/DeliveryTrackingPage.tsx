import React, { useState, useEffect } from 'react';
import CourierTrackingMap from './CourierTrackingMap';
import CourierChat from './CourierChat';
import CourierInfo from './CourierInfo';
import { deliveryTrackingService } from '../../utils/realtime/delivery-tracking';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface DeliveryTrackingPageProps {
  trackingToken?: string; // Token do link de rastreamento
  orderId?: string; // ID do pedido (alternativa ao token)
  courierId?: string; // ID do estafeta (alternativa ao token)
  customerId?: string; // ID do cliente (alternativa ao token)
  userType: 'courier' | 'customer'; // Tipo de usuário que está visualizando
  userName: string; // Nome do usuário
  courierName?: string; // Nome do estafeta (se conhecido)
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
  orderDetails?: {
    orderNumber: string;
    items: string[];
    restaurant?: string;
  };
}

const DeliveryTrackingPage: React.FC<DeliveryTrackingPageProps> = ({
  trackingToken,
  orderId: propOrderId,
  courierId: propCourierId,
  customerId: propCustomerId,
  userType,
  userName,
  courierName = 'Estafeta',
  initialLocation,
  orderDetails,
}) => {
  const [orderId, setOrderId] = useState<string>(propOrderId || '');
  const [courierId, setCourierId] = useState<string>(propCourierId || '');
  const [customerId, setCustomerId] = useState<string>(propCustomerId || '');
  const [isLoading, setIsLoading] = useState<boolean>(!!trackingToken);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'map' | 'chat'>('map');

  // Decodificar o token de rastreamento, se fornecido
  useEffect(() => {
    if (!trackingToken) return;

    setIsLoading(true);
    try {
      // Simulação de decodificação de token - substitua por sua lógica real
      // Em um caso real, você faria uma chamada de API para validar o token
      // e obter os IDs associados
      setTimeout(() => {
        try {
          const decodedData = atob(trackingToken).split('-');
          if (decodedData.length >= 2) {
            setOrderId(decodedData[0]);
            setCourierId(decodedData[1]);
            // O customerId pode vir do token ou ser definido de outra forma
            setCustomerId(propCustomerId || 'customer-123');
            setIsLoading(false);
          } else {
            throw new Error('Token de rastreamento inválido');
          }
        } catch (e) {
          setError('O link de rastreamento é inválido ou expirou.');
          setIsLoading(false);
        }
      }, 1000);
    } catch (error) {
      setError('O link de rastreamento é inválido ou expirou.');
      setIsLoading(false);
    }
  }, [trackingToken, propCustomerId]);

  // Limpar recursos ao desmontar
  useEffect(() => {
    return () => {
      if (orderId) {
        deliveryTrackingService.endTracking(orderId);
      }
    };
  }, [orderId]);

  // Renderizar estado de carregamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-4">
              <svg
                className="animate-spin h-10 w-10 text-primary"
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
            </div>
            <p className="text-muted-foreground">Carregando informações da entrega...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderizar mensagem de erro
  if (error || !orderId || !courierId || !customerId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-4">
              <svg
                className="h-16 w-16 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Erro de Rastreamento</AlertTitle>
              <AlertDescription>
                {error || 'Não foi possível carregar as informações da entrega. Verifique o link e tente novamente.'}
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={() => window.location.reload()}
              variant="default"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Versão para desktop (tela grande)
  const DesktopLayout = () => (
    <div className="grid grid-cols-3 gap-6 p-6 bg-background">
      <div className="col-span-2">
        <Card className="shadow-md h-full overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              Rastreamento em Tempo Real
              <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                Ao vivo
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <CourierTrackingMap
              orderId={orderId}
              courierId={courierId}
              customerId={customerId}
              initialLocation={initialLocation}
            />
          </CardContent>
        </Card>
      </div>
      <div className="col-span-1 space-y-6">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Informações da Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <CourierInfo
              orderId={orderId}
              courierId={courierId}
              courierName={courierName}
              orderDetails={orderDetails}
            />
          </CardContent>
        </Card>
        
        <Card className="shadow-md h-[500px] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Chat com {userType === 'courier' ? 'Cliente' : courierName}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden p-0">
            <CourierChat
              orderId={orderId}
              courierId={courierId}
              customerId={customerId}
              userType={userType}
              userName={userName}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Versão para dispositivos móveis (tela pequena)
  const MobileLayout = () => (
    <div className="flex flex-col p-4 space-y-4 bg-background">
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Informações da Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <CourierInfo
            orderId={orderId}
            courierId={courierId}
            courierName={courierName}
            orderDetails={orderDetails}
          />
        </CardContent>
      </Card>
      
      <Tabs defaultValue="map" onValueChange={(value) => setActiveTab(value as 'map' | 'chat')} className="mt-2">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" x2="9" y1="3" y2="18" />
              <line x1="15" x2="15" y1="6" y2="21" />
            </svg>
            Mapa
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Chat
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="mt-4">
          <Card className="shadow-md overflow-hidden">
            <CardContent className="p-0">
              <CourierTrackingMap
                orderId={orderId}
                courierId={courierId}
                customerId={customerId}
                initialLocation={initialLocation}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chat" className="mt-4">
          <Card className="shadow-md h-[500px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Chat com {userType === 'courier' ? 'Cliente' : courierName}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden p-0">
              <CourierChat
                orderId={orderId}
                courierId={courierId}
                customerId={customerId}
                userType={userType}
                userName={userName}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  // Renderizar layout apropriado com base no tamanho da tela
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <DesktopLayout />
      </div>
      <div className="block md:hidden">
        <MobileLayout />
      </div>
    </div>
  );
};

export default DeliveryTrackingPage;
