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

interface HistoricoVeiculo {
  id: string;
  data_troca: string;
  km_atual: number;
  km_proxima?: number;
  tipo_oleo: string;
  observacoes?: string;
  service?: {
    nome: string;
  } | null;
}

const VehicleHistoryPublicPage: React.FC = () => {
  const { placa } = useParams<{ placa: string }>();
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [historicos, setHistoricos] = useState<HistoricoVeiculo[]>([]);
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
      setHistoricos(data.history || []);
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

  const getNextOilChange = () => {
    if (historicos.length === 0) return null;
    const latest = historicos[0];
    if (!latest.km_proxima) return null;
    
    const kmLeft = latest.km_proxima - latest.km_atual;
    const isOverdue = kmLeft <= 0;
    
    return {
      km: latest.km_proxima,
      kmLeft: Math.abs(kmLeft),
      isOverdue
    };
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

  const nextOilChange = getNextOilChange();

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
                <p className="text-sm text-gray-600">Histórico do Veículo</p>
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

        {/* Próxima Troca de Óleo */}
        {nextOilChange && (
          <Card className={nextOilChange.isOverdue ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {nextOilChange.isOverdue ? 'Troca de Óleo Atrasada!' : 'Próxima Troca de Óleo'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {nextOilChange.isOverdue ? 
                      `Atrasada em ${nextOilChange.kmLeft.toLocaleString('pt-BR')} km` :
                      `Faltam ${nextOilChange.kmLeft.toLocaleString('pt-BR')} km`
                    }
                  </p>
                </div>
                <Badge variant={nextOilChange.isOverdue ? 'destructive' : 'default'}>
                  {nextOilChange.km.toLocaleString('pt-BR')} km
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico de Serviços */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historicos.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum serviço realizado</h3>
                <p className="text-gray-600">Este veículo ainda não possui histórico de serviços.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historicos.map((historico) => (
                  <div key={historico.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">Troca de Óleo - {historico.tipo_oleo}</h4>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(historico.data_troca), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">KM na troca:</span>
                        <p className="font-medium">{historico.km_atual.toLocaleString('pt-BR')}</p>
                      </div>
                      {historico.km_proxima && (
                        <div>
                          <span className="text-gray-600">Próxima troca:</span>
                          <p className="font-medium">{historico.km_proxima.toLocaleString('pt-BR')} km</p>
                        </div>
                      )}
                      {historico.service && (
                        <div>
                          <span className="text-gray-600">Serviço:</span>
                          <p className="font-medium">{historico.service.nome}</p>
                        </div>
                      )}
                    </div>
                    
                    {historico.observacoes && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-gray-600 text-sm">Observações:</span>
                        <p className="text-sm mt-1">{historico.observacoes}</p>
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