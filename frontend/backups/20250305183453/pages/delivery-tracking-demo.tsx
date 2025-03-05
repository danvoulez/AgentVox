import React, { useState, useEffect } from 'react';
import DeliveryTrackingPage from '../components/delivery/DeliveryTrackingPage';
import { deliveryTrackingService } from '../utils/realtime/delivery-tracking';
import { assignCourierToSale } from '../services/sales.service';

const DeliveryTrackingDemo: React.FC = () => {
  const [activeView, setActiveView] = useState<'customer' | 'courier'>('customer');
  const [orderId] = useState<string>('order-123');
  const [courierId] = useState<string>('courier-456');
  const [customerId] = useState<string>('customer-789');
  const [trackingLink, setTrackingLink] = useState<string>('');
  const [courierLocation, setCourierLocation] = useState({
    latitude: 38.7223,
    longitude: -9.1393,
    status: 'preparing' as const,
  });

  // Estado para controlar se o estafeta já foi atribuído
  const [courierAssigned, setCourierAssigned] = useState<boolean>(false);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [assignmentError, setAssignmentError] = useState<string>('');

  // Gerar link de rastreamento ao montar o componente
  useEffect(() => {
    const link = deliveryTrackingService.generateTrackingLink(orderId, courierId);
    setTrackingLink(link);
  }, [orderId, courierId]);
  
  // Função para atribuir o estafeta ao pedido
  const handleAssignCourier = async () => {
    setIsAssigning(true);
    setAssignmentError('');
    
    try {
      const { success, trackingLink, error } = await assignCourierToSale(orderId, courierId);
      
      if (success && trackingLink) {
        setTrackingLink(trackingLink);
        setCourierAssigned(true);
      } else {
        setAssignmentError(error?.message || 'Erro ao atribuir estafeta');
      }
    } catch (error: any) {
      setAssignmentError(error?.message || 'Erro ao atribuir estafeta');
    } finally {
      setIsAssigning(false);
    }
  };

  // Simular atualizações de localização do estafeta
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Só iniciar a simulação se estiver na visão do estafeta
    if (activeView === 'courier') {
      let step = 0;
      
      // Definir rota simulada
      const route = [
        { lat: 38.7223, lng: -9.1393, status: 'preparing' as const },
        { lat: 38.7225, lng: -9.1395, status: 'preparing' as const },
        { lat: 38.7230, lng: -9.1400, status: 'picked_up' as const },
        { lat: 38.7235, lng: -9.1405, status: 'on_the_way' as const },
        { lat: 38.7240, lng: -9.1410, status: 'on_the_way' as const },
        { lat: 38.7245, lng: -9.1415, status: 'on_the_way' as const },
        { lat: 38.7250, lng: -9.1420, status: 'delivered' as const },
      ];
      
      // Atualizar localização a cada 5 segundos
      interval = setInterval(() => {
        if (step < route.length) {
          const location = route[step];
          setCourierLocation({
            latitude: location.lat,
            longitude: location.lng,
            status: location.status,
          });
          
          // Enviar atualização para o cliente
          deliveryTrackingService.updateCourierLocation(
            courierId,
            orderId,
            location.lat,
            location.lng,
            location.status,
            // Adicionar estimativa de chegada para status "on_the_way"
            location.status === 'on_the_way'
              ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
              : undefined
          );
          
          step++;
        } else {
          clearInterval(interval);
        }
      }, 5000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeView, courierId, orderId]);

  // Exemplo de detalhes do pedido
  const orderDetails = {
    orderNumber: 'VV-12345',
    items: [
      'Pizza Margherita',
      'Coca-Cola 500ml',
      'Batatas fritas',
    ],
    restaurant: 'Pizzaria Bella Napoli',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cabeçalho da demo */}
      <div className="bg-white shadow-md p-4 mb-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">Demo de Rastreamento de Estafetas</h1>
          <p className="text-gray-600">
            Esta página demonstra o sistema de rastreamento e comunicação em tempo real entre estafetas e clientes.
          </p>
          
          {/* Seletor de visualização */}
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => setActiveView('customer')}
              className={`px-4 py-2 rounded-md ${
                activeView === 'customer'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Ver como Cliente
            </button>
            <button
              onClick={() => setActiveView('courier')}
              className={`px-4 py-2 rounded-md ${
                activeView === 'courier'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Ver como Estafeta
            </button>
          </div>
          
          {/* Atribuição de estafeta e link de rastreamento (apenas na visão do estafeta) */}
          {activeView === 'courier' && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <h2 className="text-lg font-medium text-blue-800 mb-2">Atribuição e Link de Rastreamento</h2>
              
              {!courierAssigned ? (
                <div className="mb-4">
                  <p className="text-sm text-blue-600 mb-2">
                    Atribua este estafeta ao pedido para enviar automaticamente o link de rastreamento para o cliente.
                  </p>
                  <button
                    onClick={handleAssignCourier}
                    disabled={isAssigning}
                    className={`w-full py-2 rounded-md ${isAssigning ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white`}
                  >
                    {isAssigning ? 'Atribuindo...' : 'Atribuir Estafeta ao Pedido'}
                  </button>
                  {assignmentError && (
                    <p className="text-sm text-red-600 mt-2">{assignmentError}</p>
                  )}
                </div>
              ) : (
                <div className="mb-4">
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
                    <p className="font-medium">✓ Estafeta atribuído com sucesso!</p>
                    <p className="text-sm">O link de rastreamento foi enviado automaticamente para o cliente.</p>
                  </div>
                </div>
              )}
              
              <h3 className="text-md font-medium text-blue-800 mb-2">Link de Rastreamento para o Cliente</h3>
              <div className="flex items-center">
                <input
                  type="text"
                  value={trackingLink}
                  readOnly
                  className="flex-1 p-2 border rounded-l-md bg-white"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(trackingLink);
                    alert('Link copiado para a área de transferência!');
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
                >
                  Copiar
                </button>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                {courierAssigned 
                  ? 'Este link foi enviado automaticamente para o cliente quando você foi atribuído ao pedido.'
                  : 'Este link será enviado automaticamente para o cliente quando você for atribuído ao pedido.'}
              </p>
            </div>
          )}
          
          {/* Simulador de localização (apenas na visão do estafeta) */}
          {activeView === 'courier' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-medium text-gray-800 mb-2">Simulador de Localização</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Atual</label>
                  <select
                    value={courierLocation.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as any;
                      setCourierLocation({
                        ...courierLocation,
                        status: newStatus,
                      });
                      
                      // Enviar atualização para o cliente
                      deliveryTrackingService.updateCourierLocation(
                        courierId,
                        orderId,
                        courierLocation.latitude,
                        courierLocation.longitude,
                        newStatus,
                        newStatus === 'on_the_way'
                          ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
                          : undefined
                      );
                    }}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="preparing">Em preparação</option>
                    <option value="picked_up">Pedido coletado</option>
                    <option value="on_the_way">A caminho</option>
                    <option value="delivered">Entregue</option>
                    <option value="issue">Problema na entrega</option>
                  </select>
                </div>
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-1">Localização Atual</p>
                  <p className="p-2 bg-white border rounded-md">
                    Lat: {courierLocation.latitude.toFixed(4)}, Lng: {courierLocation.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                A simulação está enviando atualizações automáticas a cada 5 segundos. Você também pode alterar o status manualmente.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Componente de rastreamento */}
      <div className="max-w-7xl mx-auto">
        <DeliveryTrackingPage
          orderId={orderId}
          courierId={courierId}
          customerId={customerId}
          userType={activeView}
          userName={activeView === 'customer' ? 'Cliente Demo' : 'Estafeta Demo'}
          courierName="João Silva"
          initialLocation={{
            latitude: courierLocation.latitude,
            longitude: courierLocation.longitude,
          }}
          orderDetails={orderDetails}
        />
      </div>
    </div>
  );
};

export default DeliveryTrackingDemo;
