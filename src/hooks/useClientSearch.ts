
import React, { useState, useEffect, useRef } from 'react';
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
    console.log('🔍 useClientSearch - searchTerm mudou:', searchTerm);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length >= 2) {
      console.log('🔍 useClientSearch - Iniciando busca com delay para:', searchTerm);
      searchTimeoutRef.current = setTimeout(() => {
        searchClients(searchTerm);
      }, 300);
    } else {
      console.log('🔍 useClientSearch - Limpando resultados (termo muito curto)');
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
      console.log('🔍 useClientSearch - Executando busca para:', term);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ useClientSearch - Usuário não autenticado');
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Você precisa estar logado para buscar clientes."
        });
        return;
      }

      console.log('🔍 useClientSearch - Fazendo query no Supabase para:', term);
      console.log('👤 useClientSearch - User ID:', session.user.id);

      const { data, error } = await supabase
        .from('clients')
        .select('id, nome, telefone, email, veiculo')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .or(`nome.ilike.%${term}%,telefone.ilike.%${term}%,email.ilike.%${term}%`)
        .order('nome')
        .limit(10);

      if (error) {
        console.error('❌ useClientSearch - Erro na query:', error);
        toast({
          variant: "destructive",
          title: "Erro ao buscar clientes",
          description: error.message
        });
        return;
      }

      console.log('✅ useClientSearch - Resultados encontrados:', data?.length || 0, data);
      setClients(data || []);
    } catch (error) {
      console.error('💥 useClientSearch - Erro inesperado:', error);
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
    console.log('✅ useClientSearch - Cliente selecionado:', client);
    setSelectedClient(client);
    setSearchTerm(client.nome);
    setClients([]); // Clear the dropdown after selection
  };

  const clearSelection = () => {
    console.log('🗑️ useClientSearch - Limpando seleção de cliente');
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
