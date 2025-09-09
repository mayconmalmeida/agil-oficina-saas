import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, History, Calendar, Settings, Phone, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VehicleData {
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  cor?: string;
  owner: {
    nome: string;
    telefone: string;
  };
}

interface ServiceOrder {
  id: string;
  data_inicio: string;
  data_fim: string;
  valor_total: number;
  observacoes?: string;
  status: string;
  itens: {
    nome_item: string;
    tipo: string;
    quantidade: number;
    valor_unitario: number;
    valor_total: number;
  }[];
}

const VehicleHistoryPublicPage: React.FC = () => {
  const { placa } = useParams<{ placa: string }>();
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (placa) {
      fetchVehicleData();
    }
  }, [placa]);

  const fetchVehicleData = async () => {
    if (!placa) return;

    try {
      console.log('Buscando dados via edge function para placa:', placa);

      // Usar a edge function segura para buscar dados
      const response = await fetch(`https://yjhcozddtbpzvnppcggf.supabase.co/functions/v1/get-vehicle-history?placa=${encodeURIComponent(placa)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || 'Erro ao buscar dados do veículo');
      }

      const data = await response.json();

      if (!data) {
        setError('Veículo não encontrado');
        return;
      }

      console.log('Dados recebidos:', data);
      setVehicle(data.vehicle);
      setServiceOrders(data.serviceOrders || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      if (error.message?.includes('não encontrado')) {
        setError('Veículo não encontrado');
      } else {
        setError('Erro ao carregar informações do veículo');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalServicesValue = () => {
    return serviceOrders.reduce((total, order) => total + order.valor_total, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Veículo não encontrado</h2>
            <p className="text-gray-600 mb-4">
              Não foi possível encontrar informações para a placa {placa?.toUpperCase()}.
            </p>
            <Link to="/">
              <Button>Voltar ao início</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextOilChange = null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Car className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Oficina Go</h1>
                <p className="text-sm text-gray-600">Histórico de Serviços</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline">Agendar Serviço</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Informações do Veículo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Informações do Veículo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  {vehicle.marca} {vehicle.modelo} {vehicle.ano}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Placa:</span>
                    <span className="font-medium">{vehicle.placa}</span>
                  </div>
                  {vehicle.cor && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cor:</span>
                      <span className="font-medium">{vehicle.cor}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3">Proprietário</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome:</span>
                    <span className="font-medium">{vehicle.owner.nome}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Telefone:</span>
                    <a 
                      href={`tel:${vehicle.owner.telefone}`}
                      className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      {vehicle.owner.telefone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo dos Serviços */}
        {serviceOrders.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Serviços Realizados</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {serviceOrders.length} serviço{serviceOrders.length !== 1 ? 's' : ''} concluído{serviceOrders.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Badge variant="default">
                  R$ {getTotalServicesValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ordens de Serviço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Ordens de Serviço Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {serviceOrders.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum serviço concluído</h3>
                <p className="text-gray-600">Este veículo ainda não possui serviços concluídos.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {serviceOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">Ordem de Serviço #{order.id.slice(-8)}</h4>
                        <div className="flex gap-4 text-sm text-gray-600 mt-1">
                          <p className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Início: {format(new Date(order.data_inicio), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                          {order.data_fim && (
                            <p className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Fim: {format(new Date(order.data_fim), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        R$ {order.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Badge>
                    </div>
                    
                    {/* Itens da Ordem */}
                    {order.itens.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium mb-2">Serviços e Produtos:</h5>
                        <div className="space-y-2">
                          {order.itens.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-white p-3 rounded border text-sm">
                              <div>
                                <span className="font-medium">{item.nome_item}</span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {item.tipo}
                                </Badge>
                                {item.quantidade > 1 && (
                                  <span className="ml-2 text-gray-600">
                                    (Qtd: {item.quantidade})
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  R$ {item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                {item.quantidade > 1 && (
                                  <div className="text-xs text-gray-600">
                                    R$ {item.valor_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cada
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Observações */}
                    {order.observacoes && (
                      <div className="pt-3 border-t">
                        <span className="text-gray-600 text-sm font-medium">Observações:</span>
                        <p className="text-sm mt-1">{order.observacoes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-blue-600 text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Precisa de manutenção?</h3>
            <p className="mb-4">Agende seu próximo serviço na Oficina Go</p>
            <Link to="/">
              <Button variant="secondary">Agendar Agora</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleHistoryPublicPage;