import React, { useState, useEffect, useRef } from 'react';
import { deliveryTrackingService, CourierLocation } from '../../utils/realtime/delivery-tracking';

interface CourierTrackingMapProps {
  orderId: string;
  courierId: string;
  customerId: string;
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
  googleMapsApiKey?: string;
}

const CourierTrackingMap: React.FC<CourierTrackingMapProps> = ({
  orderId,
  courierId,
  customerId,
  initialLocation,
  googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
}) => {
  const [courierLocation, setCourierLocation] = useState<CourierLocation | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<string>('');
  const [estimatedArrival, setEstimatedArrival] = useState<string>('');
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  
  // Carregar o script do Google Maps
  useEffect(() => {
    if (!googleMapsApiKey) {
      console.error('Google Maps API key is missing');
      return;
    }

    // Verificar se o script já foi carregado
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Carregar o script do Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    document.head.appendChild(script);

    return () => {
      // Remover o script ao desmontar o componente
      document.head.removeChild(script);
    };
  }, [googleMapsApiKey]);

  // Inicializar o mapa
  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Definir a localização inicial (padrão: Lisboa, Portugal)
    const defaultLocation = { lat: 38.7223, lng: -9.1393 };
    const initialPos = initialLocation
      ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
      : defaultLocation;

    // Criar o mapa
    const mapOptions: google.maps.MapOptions = {
      center: initialPos,
      zoom: 15,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: true,
    };

    googleMapRef.current = new google.maps.Map(mapRef.current, mapOptions);

    // Criar o marcador para o estafeta
    markerRef.current = new google.maps.Marker({
      position: initialPos,
      map: googleMapRef.current,
      title: 'Estafeta',
      icon: {
        url: '/images/delivery-bike.png', // Substitua por um ícone personalizado
        scaledSize: new google.maps.Size(40, 40),
      },
      animation: google.maps.Animation.DROP,
    });
  };

  // Atualizar a posição do marcador quando a localização do estafeta mudar
  useEffect(() => {
    if (!courierLocation || !markerRef.current || !googleMapRef.current) return;

    const newPosition = {
      lat: courierLocation.latitude,
      lng: courierLocation.longitude,
    };

    // Atualizar a posição do marcador com animação
    markerRef.current.setPosition(newPosition);
    googleMapRef.current.panTo(newPosition);

    // Atualizar o status e a estimativa de chegada
    setDeliveryStatus(getStatusText(courierLocation.status));
    if (courierLocation.estimatedArrival) {
      setEstimatedArrival(courierLocation.estimatedArrival);
    }
  }, [courierLocation]);

  // Inscrever-se para atualizações de localização do estafeta
  useEffect(() => {
    // Callback para atualização de localização
    const handleLocationUpdate = (location: CourierLocation) => {
      setCourierLocation(location);
    };

    // Iniciar o rastreamento
    const channel = deliveryTrackingService.startLocationTracking(
      courierId,
      orderId,
      handleLocationUpdate
    );

    // Limpar ao desmontar
    return () => {
      deliveryTrackingService.endTracking(orderId);
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
    if (!isoDate) return '';
    
    try {
      const date = new Date(isoDate);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Informações do status */}
      <div className="bg-white p-4 shadow-md rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Rastreamento de Entrega</h2>
            <p className="text-gray-600">Pedido #{orderId}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium text-blue-600">{deliveryStatus}</div>
            {estimatedArrival && (
              <div className="text-sm text-gray-600">
                Chegada estimada: {formatEstimatedArrival(estimatedArrival)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div 
        ref={mapRef} 
        className="flex-1 w-full h-96 rounded-lg overflow-hidden shadow-md"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
};

export default CourierTrackingMap;
