
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Edit, Trash2, Phone, Mail, Car, Calendar } from 'lucide-react';

interface Client {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  veiculo?: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  tipo?: string;
  created_at: string;
}

interface ClientListProps {
  searchTerm: string;
  onViewClient: (clientId: string) => void;
  onEditClient: (clientId: string) => void;
  onDeleteClient: (clientId: string) => void;
  onSelectClient?: (clientId: string) => void;
  filters?: any;
}

const ClientList: React.FC<ClientListProps> = ({
  searchTerm,
  onViewClient,
  onEditClient,
  onDeleteClient,
  onSelectClient,
  filters = {}
}) => {
  const { user } = useAuth();

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Buscando clientes para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar clientes:', error);
        throw error;
      }

      console.log('Clientes encontrados:', data);
      return data as Client[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false
  });

  // Filtrar clientes baseado no termo de busca
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    
    const term = searchTerm.toLowerCase();
    return clients.filter(client => 
      client.nome.toLowerCase().includes(term) ||
      client.telefone.includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.placa?.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  // Função para formatar informações do veículo
  const formatVehicleInfo = (client: Client) => {
    // Verificar se há dados estruturados do veículo
    if (client.marca && client.modelo) {
      return {
        brand: client.marca,
        model: client.modelo,
        year: client.ano || '',
        plate: client.placa || 'Não informado',
        hasStructuredData: true,
        displayName: `${client.marca} ${client.modelo}`
      };
    }
    
    // Fallback para o campo veiculo antigo
    if (client.veiculo) {
      const vehicleText = client.veiculo.trim();
      const plateMatch = vehicleText.match(/Placa:\s*([A-Z0-9-]+)/i);
      const plate = plateMatch ? plateMatch[1] : client.placa || 'Não informado';
      const vehiclePart = vehicleText.replace(/,?\s*Placa:.*$/i, '').trim();
      
      return {
        brand: '',
        model: '',
        year: '',
        plate: plate,
        hasStructuredData: false,
        displayName: vehiclePart || 'Veículo não especificado'
      };
    }
    
    return {
      brand: '',
      model: '',
      year: '',
      plate: 'Não informado',
      hasStructuredData: false,
      displayName: 'Não informado'
    };
  };

  if (isLoading) {
    return (
      <CardContent className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[160px]" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    );
  }

  if (error) {
    return (
      <CardContent className="p-6">
        <div className="text-center text-red-500">
          Erro ao carregar clientes. Tente novamente.
        </div>
      </CardContent>
    );
  }

  if (filteredClients.length === 0) {
    return (
      <CardContent className="p-6">
        <div className="text-center text-gray-500">
          {searchTerm ? 'Nenhum cliente encontrado com esse termo.' : 'Nenhum cliente cadastrado ainda.'}
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent className="p-0">
      <div className="divide-y">
        {filteredClients.map((client) => {
          const vehicleInfo = formatVehicleInfo(client);
          
          return (
            <div key={client.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  {/* Header do cliente */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{client.nome}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={client.tipo === 'pj' ? 'default' : 'secondary'} className="text-xs">
                          {client.tipo === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(client.created_at).toLocaleDateString('pt-BR')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Informações de contato */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="font-medium">{client.telefone}</span>
                    </div>
                    
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Informações do veículo */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Car className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {vehicleInfo.displayName}
                          </h4>
                          {!vehicleInfo.hasStructuredData && vehicleInfo.displayName !== 'Não informado' && (
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                              Legado
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {vehicleInfo.hasStructuredData && (
                            <>
                              {vehicleInfo.brand && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-500">Marca:</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {vehicleInfo.brand}
                                  </Badge>
                                </div>
                              )}
                              
                              {vehicleInfo.year && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-500">Ano:</span>
                                  <Badge variant="outline" className="text-xs">
                                    {vehicleInfo.year}
                                  </Badge>
                                </div>
                              )}
                            </>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Placa:</span>
                            <Badge 
                              variant={vehicleInfo.plate === 'Não informado' ? 'destructive' : 'default'} 
                              className="text-xs font-mono"
                            >
                              {vehicleInfo.plate}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Botões de ação */}
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewClient(client.id)}
                    className="h-9 px-3"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditClient(client.id)}
                    className="h-9 px-3"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteClient(client.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 px-3"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  );
};

export default ClientList;
