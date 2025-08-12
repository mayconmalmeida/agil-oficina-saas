
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { debounce } from '@/utils/debounce';
import { useOficinaFilters, getOficinaFilter } from '@/hooks/useOficinaFilters';

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
  const { oficina_id, user_id, isReady } = useOficinaFilters();

  const searchClients = useCallback(async (term: string) => {
    console.log('[useClientSearch] 🔍 Iniciando busca por clientes com termo:', term);
    
    if (!term || term.length < 2 || !isReady) {
      setClients([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const filter = getOficinaFilter(oficina_id, user_id);
      if (!filter) {
        console.log('[useClientSearch] ❌ Filtros não disponíveis');
        setIsLoading(false);
        return;
      }

      console.log('[useClientSearch] 🏢 Buscando clientes com filtro:', filter);

      // Search clients by name, phone, plate, vehicle, brand, or model
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .or(`nome.ilike.%${term}%,telefone.ilike.%${term}%,placa.ilike.%${term}%,veiculo.ilike.%${term}%,marca.ilike.%${term}%,modelo.ilike.%${term}%`)
        .eq('is_active', true)
        .order('nome')
        .limit(20);

      if (error) {
        console.error('Erro ao buscar clientes:', error);
        toast({
          variant: "destructive",
          title: "Erro na busca",
          description: "Não foi possível buscar os clientes.",
        });
        setClients([]);
        return;
      }
      
      console.log('[useClientSearch] ✅ Clientes encontrados:', data?.length || 0);
      
      // Format clients data with proper null checks
      const formattedClients = (data || [])
        .filter(client => client && typeof client === 'object')
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
            console.error('Erro ao formatar dados do cliente:', error, client);
            return null;
          }
        })
        .filter((client): client is Client => client !== null);
      
      console.log('[useClientSearch] ✅ Clientes formatados:', formattedClients.length);
      setClients(formattedClients);
    } catch (error) {
      console.error('Erro inesperado durante busca de clientes:', error);
      toast({
        variant: "destructive",
        title: "Erro na busca",
        description: "Ocorreu um erro inesperado ao buscar clientes.",
      });
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, oficina_id, user_id, isReady]);

  // Debounce search function
  const debouncedSearch = useCallback(
    debounce(searchClients, 300),
    [searchClients]
  );

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      setClients([]);
    }
  }, [searchTerm, debouncedSearch]);

  const selectClient = useCallback((client: Client) => {
    console.log('Cliente selecionado:', client);
    if (!client || !client.id) {
      console.error('Cliente inválido selecionado:', client);
      return;
    }
    
    setSelectedClient(client);
    setSearchTerm(client.nome || '');
    setClients([]); // Limpar lista após seleção
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
