import React, { useState, useEffect } from 'react';
import { deliveryTrackingService, CourierLocation } from '../../utils/realtime/delivery-tracking';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CourierInfoProps {
  orderId: string;
  courierId: string;
  courierName: string;
  orderDetails?: {
    orderNumber: string;
    items: string[];
    restaurant?: string;
  };
}

const CourierInfo: React.FC<CourierInfoProps> = ({
  orderId,
  courierId,
  courierName,
  orderDetails,
}) => {
  const [deliveryStatus, setDeliveryStatus] = useState<string>('preparing');
  const [estimatedArrival, setEstimatedArrival] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Inscrever-se para atualizações de localização e status
  useEffect(() => {
    const handleLocationUpdate = (location: CourierLocation) => {
      setDeliveryStatus(location.status);
      if (location.estimatedArrival) {
        setEstimatedArrival(location.estimatedArrival);
      }
      setLastUpdate(location.timestamp);
    };

    // Iniciar o rastreamento
    deliveryTrackingService.startLocationTracking(
      courierId,
      orderId,
      handleLocationUpdate
    );

    // Limpar ao desmontar
    return () => {
      // Não precisamos chamar endTracking aqui, pois isso será feito no componente principal
    };
  }, [orderId, courierId]);

  // Converter o status para texto amigável
  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      preparing: 'Em preparação',
      picked_up: 'Pedido coletado',
      on_the_way: 'A caminho',
      delivered: 'Entregue',
      issue: 'Problema na entrega',
    };

    return statusMap[status] || 'Status desconhecido';
  };

  // Formatar a estimativa de chegada
  const formatEstimatedArrival = (isoDate: string): string => {
    if (!isoDate) return 'Calculando...';
    
    try {
      const date = new Date(isoDate);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Indisponível';
    }
  };

  // Formatar a última atualização
  const formatLastUpdate = (isoDate: string): string => {
    if (!isoDate) return '';
    
    try {
      const date = new Date(isoDate);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  // Obter o ícone do status
  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case 'preparing':
        return (
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      case 'picked_up':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'on_the_way':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'issue':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Obter a variante do badge para o status
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      preparing: "secondary",
      picked_up: "default",
      on_the_way: "default",
      delivered: "outline",
      issue: "destructive",
    };

    return variantMap[status] || "outline";
  };

  return (
    <Card className="overflow-hidden">
      {/* Cabeçalho com informações do estafeta */}
      <CardHeader className="bg-primary text-primary-foreground pb-4">
        <div className="flex items-center">
          <div className="bg-background rounded-full p-2 mr-3">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Estafeta: {courierName}</h2>
            <p className="text-sm opacity-80">Pedido #{orderDetails?.orderNumber || orderId}</p>
          </div>
        </div>
      </CardHeader>

      {/* Status da entrega */}
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {getStatusIcon(deliveryStatus)}
            <Badge variant={getStatusVariant(deliveryStatus)} className="ml-2">
              {getStatusText(deliveryStatus)}
            </Badge>
          </div>
          {lastUpdate && (
            <div className="text-xs text-muted-foreground">
              Última atualização: {formatLastUpdate(lastUpdate)}
            </div>
          )}
        </div>

        {/* Estimativa de chegada */}
        {(deliveryStatus === 'picked_up' || deliveryStatus === 'on_the_way') && (
          <div className="bg-primary/10 p-3 rounded-md mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium">Chegada estimada</p>
                <p className="text-lg font-bold">
                  {formatEstimatedArrival(estimatedArrival)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Detalhes do pedido */}
        {orderDetails && (
          <div className="border-t border-border pt-3 mt-3">
            <h3 className="text-sm font-medium mb-2">Detalhes do Pedido:</h3>
            {orderDetails.restaurant && (
              <p className="text-sm text-muted-foreground mb-1">
                <span className="font-medium">Restaurante:</span> {orderDetails.restaurant}
              </p>
            )}
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Itens:</span>
              <ul className="list-disc list-inside ml-2 mt-1">
                {orderDetails.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourierInfo;
