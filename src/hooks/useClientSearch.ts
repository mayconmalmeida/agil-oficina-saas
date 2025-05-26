
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { debounce } from '@/utils/debounce';

export interface Client {
  id: string;
  nome: string;
  telefone: string;
  veiculo: string;
  marca?: string;
  modelo?: string;
  ano?: string;
  placa?: string;
  email?: string;
  tipo?: 'pf' | 'pj';
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  documento?: string;
  cor?: string;
  kilometragem?: string;
  bairro?: string;
  numero?: string;
}

export function useClientSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Debounce search function
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!term || term.length < 2) {
        setClients([]);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Searching for clients with term:', term);
        
        // Search clients by name, phone, plate, vehicle, brand, or model
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .or(`nome.ilike.%${term}%,telefone.ilike.%${term}%,placa.ilike.%${term}%,veiculo.ilike.%${term}%,marca.ilike.%${term}%,modelo.ilike.%${term}%`)
          .eq('is_active', true)
          .order('nome')
          .limit(20);

        if (error) {
          console.error('Error searching clients:', error);
          toast({
            variant: "destructive",
            title: "Erro na busca",
            description: "Não foi possível buscar os clientes.",
          });
          setClients([]);
          return;
        }

        console.log('Search results found:', data?.length || 0, 'clients');
        
        // Format clients data with proper null checks and error handling
        const formattedClients = (data || [])
          .filter(client => client && typeof client === 'object') // Filter out any null/undefined entries
          .map(client => {
            try {
              return {
                id: client.id || '',
                nome: client.nome || '',
                telefone: client.telefone || '',
                veiculo: client.veiculo || '',
                marca: client.marca || '',
                modelo: client.modelo || '',
                ano: client.ano || '',
                placa: client.placa || '',
                email: client.email || '',
                tipo: (client.tipo || 'pf') as 'pf' | 'pj',
                endereco: client.endereco || '',
                cidade: client.cidade || '',
                estado: client.estado || '',
                cep: client.cep || '',
                documento: client.documento || '',
                cor: client.cor || '',
                kilometragem: client.kilometragem || '',
                bairro: client.bairro || '',
                numero: client.numero || ''
              } as Client;
            } catch (error) {
              console.error('Error formatting client data:', error, client);
              return null;
            }
          })
          .filter((client): client is Client => client !== null); // Remove any failed formatting attempts
        
        setClients(formattedClients);
      } catch (error) {
        console.error('Unexpected error during client search:', error);
        toast({
          variant: "destructive",
          title: "Erro na busca",
          description: "Ocorreu um erro inesperado ao buscar clientes.",
        });
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [toast]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const selectClient = useCallback((client: Client) => {
    if (!client || !client.id) {
      console.error('Invalid client selected:', client);
      return;
    }
    
    console.log('Selected client:', client);
    setSelectedClient(client);
    setSearchTerm(client.nome || '');
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedClient(null);
    setSearchTerm('');
    setClients([]);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    clients,
    isLoading,
    selectedClient,
    selectClient,
    clearSelection
  };
}
