
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Client {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  veiculo?: string;
}

export const useClientSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Search for clients based on search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchClients(searchTerm);
      }, 300);
    } else {
      setClients([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const searchClients = async (term: string) => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Você precisa estar logado para buscar clientes."
        });
        return;
      }

      console.log('🔍 Buscando clientes com termo:', term);

      const { data, error } = await supabase
        .from('clients')
        .select('id, nome, telefone, email, veiculo')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .or(`nome.ilike.%${term}%,telefone.ilike.%${term}%,email.ilike.%${term}%`)
        .order('nome')
        .limit(10);

      if (error) {
        console.error('Erro ao buscar clientes:', error);
        toast({
          variant: "destructive",
          title: "Erro ao buscar clientes",
          description: error.message
        });
        return;
      }

      console.log('✅ Clientes encontrados:', data?.length || 0, data);
      setClients(data || []);
    } catch (error) {
      console.error('Erro inesperado na busca:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao buscar clientes."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectClient = (client: Client) => {
    console.log('Cliente selecionado:', client);
    setSelectedClient(client);
    setSearchTerm(client.nome);
  };

  const clearSelection = () => {
    console.log('Limpando seleção de cliente');
    setSelectedClient(null);
    setSearchTerm('');
    setClients([]);
  };

  return {
    searchTerm,
    setSearchTerm,
    clients,
    isLoading,
    selectedClient,
    selectClient,
    clearSelection
  };
};
