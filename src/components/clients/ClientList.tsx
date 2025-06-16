
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Phone, Mail, Car } from 'lucide-react';
import { Client } from '@/utils/supabaseTypes';

interface ClientListProps {
  searchTerm?: string;
  onViewClient: (clientId: string) => void;
  onEditClient: (clientId: string) => void;
  onDeleteClient: (clientId: string) => void;
  filters?: any;
  onSelectClient?: (clientId: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({
  searchTerm = '',
  onViewClient,
  onEditClient,
  onDeleteClient,
  filters = {},
  onSelectClient
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userChecked, setUserChecked] = useState(false);
  const { toast } = useToast();

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [JSON.stringify(filters)]);

  // Get user authentication only once
  useEffect(() => {
    let mounted = true;
    
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (mounted) {
          setUser(user);
          setUserChecked(true);
        }
      } catch (error) {
        console.error('Erro ao obter usuário:', error);
        if (mounted) {
          setUserChecked(true);
        }
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setUser(session?.user || null);
        setUserChecked(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch clients with proper dependency management
  const fetchClients = useCallback(async () => {
    if (!user || !userChecked) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Buscando clientes para usuário:', user.id);

      let query = supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,telefone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,placa.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar clientes:', error);
        throw error;
      }

      console.log('Clientes encontrados:', data);

      // Ensure all clients have the required fields with defaults
      const clientsWithDefaults = (data || []).map(client => ({
        ...client,
        tipo: client.tipo || 'pf',
        endereco: client.endereco || '',
        cidade: client.cidade || '',
        estado: client.estado || '',
        cep: client.cep || '',
        documento: client.documento || '',
        cor: client.cor || '',
        kilometragem: client.kilometragem || '',
        bairro: client.bairro || '',
        numero: client.numero || ''
      }));

      setClients(clientsWithDefaults as Client[]);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar clientes",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, userChecked, searchTerm, toast]);

  // Effect to fetch clients when dependencies change
  useEffect(() => {
    if (userChecked) {
      fetchClients();
    }
  }, [fetchClients, userChecked]);

  const formatVehicleInfo = (client: Client) => {
    if (!client.marca && !client.modelo && !client.ano && !client.placa) {
      return 'Dados do veículo não informados';
    }

    const parts = [];
    if (client.marca) parts.push(client.marca);
    if (client.modelo) parts.push(client.modelo);
    if (client.ano) parts.push(`(${client.ano})`);
    
    const vehicleInfo = parts.join(' ');
    return vehicleInfo || 'Veículo não informado';
  };

  const formatPlate = (plate?: string) => {
    if (!plate) return null;
    return plate.toUpperCase();
  };

  if (!userChecked || isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Usuário não autenticado
        </h3>
        <p className="text-gray-600">
          Faça login para visualizar seus clientes.
        </p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
        </h3>
        <p className="text-gray-600">
          {searchTerm 
            ? 'Tente ajustar os filtros de pesquisa.' 
            : 'Comece adicionando seu primeiro cliente.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <Card key={client.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {client.nome}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {client.tipo === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="space-y-1">
                    {client.telefone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{client.telefone}</span>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{client.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-start gap-2">
                      <Car className="h-4 w-4 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatVehicleInfo(client)}
                        </div>
                        {formatPlate(client.placa) && (
                          <div className="text-xs text-gray-500">
                            Placa: {formatPlate(client.placa)}
                          </div>
                        )}
                        {client.cor && (
                          <div className="text-xs text-gray-500">
                            Cor: {client.cor}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewClient(client.id)}
                  title="Visualizar detalhes"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditClient(client.id)}
                  title="Editar cliente"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteClient(client.id)}
                  title="Excluir cliente"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientList;
