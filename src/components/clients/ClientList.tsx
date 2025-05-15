
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatPhoneNumber } from '@/utils/formatUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, User, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ClientListProps {
  onSelectClient: (clientId: string) => void;
  searchQuery?: string;
  filters?: any;
}

interface Client {
  id: string;
  user_id: string;
  nome: string;
  telefone: string;
  email?: string;
  veiculo: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  created_at: string;
}

const ClientList: React.FC<ClientListProps> = ({ onSelectClient, searchQuery, filters }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Função para carregar clientes do banco de dados
  useEffect(() => {
    const loadClients = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('clients')
          .select('*')
          .order('nome', { ascending: true });
        
        // Aplicar filtros se existirem
        if (filters) {
          if (filters.searchTerm) {
            query = query.or(`nome.ilike.%${filters.searchTerm}%,telefone.ilike.%${filters.searchTerm}%,veiculo.ilike.%${filters.searchTerm}%,placa.ilike.%${filters.searchTerm}%`);
          }
          
          if (filters.nome) query = query.ilike('nome', `%${filters.nome}%`);
          if (filters.telefone) query = query.ilike('telefone', `%${filters.telefone}%`);
          if (filters.veiculo) query = query.ilike('veiculo', `%${filters.veiculo}%`);
          if (filters.placa) query = query.ilike('placa', `%${filters.placa}%`);
        } else if (searchQuery) {
          query = query.or(`nome.ilike.%${searchQuery}%,telefone.ilike.%${searchQuery}%,veiculo.ilike.%${searchQuery}%,placa.ilike.%${searchQuery}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Erro ao carregar clientes:', error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar clientes",
            description: "Não foi possível carregar a lista de clientes.",
          });
          return;
        }
        
        setClients(data || []);
      } catch (error) {
        console.error('Erro inesperado:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadClients();
  }, [searchQuery, filters, toast]);

  // Função para formatar as informações do veículo
  const formatVehicleInfo = (client: Client) => {
    if (client.marca && client.modelo) {
      let vehicleInfo = `${client.marca} ${client.modelo}`;
      if (client.ano) vehicleInfo += ` (${client.ano})`;
      if (client.placa) vehicleInfo += ` - Placa: ${client.placa}`;
      return vehicleInfo;
    }
    return client.veiculo || "Sem veículo registrado";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-4 w-full mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum cliente encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchQuery || filters ? 'Tente outra pesquisa ou filtro.' : 'Comece adicionando seu primeiro cliente.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clients.map(client => (
        <Card key={client.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelectClient(client.id)}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">{client.nome}</h3>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="mr-1 h-4 w-4" />
                <p className="text-sm">{formatPhoneNumber(client.telefone)}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center text-gray-500">
              <Car className="mr-1 h-4 w-4 text-gray-500" />
              <p className="text-sm">{formatVehicleInfo(client)}</p>
            </div>
            {client.email && (
              <p className="mt-1 text-sm text-gray-500">{client.email}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientList;
