
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
        console.log('Searching for term:', term);
        
        // Busca clientes por nome, telefone, placa ou veículo
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .or(`nome.ilike.%${term}%,telefone.ilike.%${term}%,placa.ilike.%${term}%,veiculo.ilike.%${term}%,marca.ilike.%${term}%,modelo.ilike.%${term}%`)
          .limit(20);

        if (error) {
          console.error('Erro ao buscar clientes:', error);
          toast({
            variant: "destructive",
            title: "Erro na busca",
            description: "Não foi possível buscar os clientes.",
          });
          return;
        }

        console.log('Search results:', data);
        setClients(data || []);
      } catch (error) {
        console.error('Erro inesperado:', error);
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
    console.log('Selected client:', client);
    setSelectedClient(client);
    setSearchTerm(client.nome);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedClient(null);
    setSearchTerm('');
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
