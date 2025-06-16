
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Edit, Trash2, Phone, Mail, Car } from 'lucide-react';

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

  // Função para formatar informações do veículo de forma mais visual
  const formatVehicleInfo = (client: Client) => {
    if (client.marca && client.modelo && client.ano) {
      return {
        vehicle: `${client.marca} ${client.modelo}`,
        year: client.ano,
        plate: client.placa || 'N/A'
      };
    }
    
    // Fallback para o campo veiculo antigo
    if (client.veiculo) {
      const parts = client.veiculo.split(',');
      const vehiclePart = parts[0]?.trim() || '';
      const platePart = parts.find(part => part.includes('Placa:'))?.replace('Placa:', '').trim();
      
      return {
        vehicle: vehiclePart,
        year: '',
        plate: platePart || client.placa || 'N/A'
      };
    }
    
    return {
      vehicle: 'Não informado',
      year: '',
      plate: 'N/A'
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
            <div key={client.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{client.nome}</h3>
                    <Badge variant={client.tipo === 'pj' ? 'default' : 'secondary'}>
                      {client.tipo === 'pj' ? 'PJ' : 'PF'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{client.telefone}</span>
                    </div>
                    
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{client.email}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{vehicleInfo.vehicle}</span>
                        {vehicleInfo.year && (
                          <Badge variant="outline" className="text-xs">
                            {vehicleInfo.year}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs font-mono">
                          {vehicleInfo.plate}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewClient(client.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditClient(client.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteClient(client.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
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
