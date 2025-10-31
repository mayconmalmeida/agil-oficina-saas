import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Car, Calendar, Settings, History, Phone, FileText } from 'lucide-react';
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

interface PendingBudget {
  id: string;
  cliente: string;
  veiculo: string;
  descricao: string;
  valor_total: number;
  status: string;
  created_at: string;
  itens?: {
    nome: string;
    tipo: string;
    quantidade: number;
    valor_unitario: number;
    valor_total: number;
  }[];
}
interface ApprovedBudget extends PendingBudget {}

const VehicleHistoryPublicPage = () => {
  const { placa } = useParams<{ placa: string }>();
  const [vehicle, setVehicle] = useState<any>(null);
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);
  const [pendingBudgets, setPendingBudgets] = useState<PendingBudget[]>([]);
  const [approvedBudgets, setApprovedBudgets] = useState<ApprovedBudget[]>([]);
  const [workshopPhone, setWorkshopPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPending, setExpandedPending] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (placa) {
      fetchVehicleData();
    }
  }, [placa]);

  const fetchVehicleData = async () => {
    if (!placa) return;

    try {
      console.log('Buscando dados via edge function para placa:', placa);

      const response = await fetch(`https://yjhcozddtbpzvnppcggf.supabase.co/functions/v1/get-vehicle-history?placa=${encodeURIComponent(placa.toUpperCase())}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaGNvemRkdGJwenZucHBjZ2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjY0NTAsImV4cCI6MjA2Mjg0MjQ1MH0.oO2SwcWl3BPrLqmPE5FVJh3ISmAXhr8KyMJ9jwTkAO0`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        let errorMsg = 'Erro ao buscar dados do veículo';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (_) {
          // Ignora falha ao parsear JSON de erro
        }
        setError(errorMsg);
        return;
      }

      const data = await response.json();

      if (!data || !data.vehicle) {
        setError('Veículo não encontrado');
        return;
      }

      console.log('Dados recebidos:', data);
      setVehicle(data.vehicle);
      setServiceOrders(data.serviceOrders || []);
      setPendingBudgets(data.pendingBudgets || []);
      setApprovedBudgets(data.approvedBudgets || []);
      setWorkshopPhone(data.workshop?.telefone || null);
    } catch (error: any) {
      console.error('Falha ao carregar dados do veículo:', error);
      setError('Erro ao carregar informações do veículo');
    } finally {
      setLoading(false);
    }
  };

  const getTotalServicesValue = () => {
    return serviceOrders.reduce((total, order) => total + order.valor_total, 0);
  };

  if (loading) {
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
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Veículo não encontrado</h2>
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

  const togglePending = (id: string) => {
    setExpandedPending(prev => ({ ...prev, [id]: !prev[id] }));
  };

      const getWhatsAppUrl = () => {
    if (!workshopPhone) return '/';
    const digits = workshopPhone.replace(/\D/g, '');
    const phoneWithCountry = digits.length <= 11 ? `55${digits}` : digits;
    const plate = vehicle?.placa ? vehicle.placa.toUpperCase() : '';
    const text = encodeURIComponent(`Olá! Gostaria de agendar um serviço para o veículo placa ${plate}.`);
    return `https://wa.me/${phoneWithCountry}?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/oficinago-logo-backup.png" alt="OficinaGo" className="h-8" />
              <div>
                <p className="text-sm text-gray-600">Histórico de Serviços</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer"><Button variant="outline">Agendar Serviço</Button></a>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">

        {pendingBudgets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Orçamentos Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingBudgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="border border-orange-200 rounded-lg p-4 bg-orange-50 cursor-pointer"
                    onClick={() => togglePending(budget.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900">Orçamento #{budget.id.slice(-8)}</h4>
                        <div className="flex gap-4 text-sm text-gray-600 mt-1">
                          <p className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Criado em: {format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Clique para ver o que está incluso</p>
                      </div>
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                        R$ {budget.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <h5 className="font-medium mb-1 text-gray-900">Veículo:</h5>
                      <p className="text-sm text-gray-700">{budget.veiculo}</p>
                    </div>

                    {budget.descricao && (
                      <div className="pt-3 border-t border-orange-200">
                        <span className="text-gray-600 text-sm font-medium">Descrição:</span>
                        <p className="text-sm mt-1 text-gray-900">{budget.descricao}</p>
                      </div>
                    )}

                    {expandedPending[budget.id] && budget.itens && budget.itens.length > 0 && (
                      <div className="pt-3 border-t border-orange-200">
                        <h5 className="font-medium mb-2 text-gray-900">Itens do Orçamento:</h5>
                        <div className="space-y-2">
                          {budget.itens.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded border border-orange-200 text-sm">
                              <div>
                                <span className="font-medium text-gray-900">{item.nome}</span>
                                <Badge variant="outline" className="ml-2 text-xs">{item.tipo}</Badge>
                                {item.quantidade > 1 && (
                                  <span className="ml-2 text-gray-600">(Qtd: {item.quantidade})</span>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">R$ {item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                {item.quantidade > 1 && (
                                  <div className="text-xs text-gray-600">R$ {item.valor_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cada</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                    <span className="font-medium text-gray-900">{vehicle.placa}</span>
                  </div>
                  {vehicle.cor && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cor:</span>
                      <span className="font-medium text-gray-900">{vehicle.cor}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-900">Proprietário</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome:</span>
                    <span className="font-medium text-gray-900">{vehicle.owner.nome}</span>
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

        
        {approvedBudgets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Orçamentos Aprovados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvedBudgets.map((budget) => (
                  <div key={budget.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900">Orçamento #{budget.id.slice(-8)}</h4>
                        <div className="flex gap-4 text-sm text-gray-600 mt-1">
                          <p className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Data: {format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        R$ {budget.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Badge>
                    </div>

                    {budget.itens && budget.itens.length > 0 && (
                      <div className="pt-3 border-t border-green-200">
                        <h5 className="font-medium mb-2 text-gray-900">Itens do Orçamento:</h5>
                        <div className="space-y-2">
                          {budget.itens.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded border border-green-200 text-sm">
                              <div>
                                <span className="font-medium text-gray-900">{item.nome}</span>
                                <Badge variant="outline" className="ml-2 text-xs">{item.tipo}</Badge>
                                {item.quantidade > 1 && (
                                  <span className="ml-2 text-gray-600">(Qtd: {item.quantidade})</span>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">R$ {item.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                {item.quantidade > 1 && (
                                  <div className="text-xs text-gray-600">R$ {item.valor_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cada</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}


        {serviceOrders.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">Serviços Realizados</h3>
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
                <h3 className="text-lg font-medium mb-2 text-gray-900">Nenhum serviço concluído</h3>
                <p className="text-gray-600">Este veículo ainda não possui serviços concluídos.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {serviceOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900">Ordem de Serviço #{order.id.slice(-8)}</h4>
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
                    
                    {order.itens.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium mb-2 text-gray-900">Serviços e Produtos:</h5>
                        <div className="space-y-2">
                          {order.itens.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-white p-3 rounded border border-gray-200 text-sm">
                              <div>
                                <span className="font-medium text-gray-900">{item.nome_item}</span>
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
                                <div className="font-medium text-gray-900">
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
                    
                    {order.observacoes && (
                      <div className="pt-3 border-t border-gray-200">
                        <span className="text-gray-600 text-sm font-medium">Observações:</span>
                        <p className="text-sm mt-1 text-gray-900">{order.observacoes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-600 text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Precisa de manutenção?</h3>
            <p className="mb-4">Agende seu próximo serviço</p>
            <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer"><Button variant="secondary">Agendar Agora</Button></a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleHistoryPublicPage;



