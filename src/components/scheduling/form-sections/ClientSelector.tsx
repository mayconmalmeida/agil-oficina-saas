import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useOficinaFilters, getOficinaFilter } from '@/hooks/useOficinaFilters';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  veiculo: string;
}

interface ClientSelectorProps {
  clients: any[];
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ clients: propClients }) => {
  const { control, setValue, watch } = useFormContext();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const { oficina_id, user_id, isReady } = useOficinaFilters();
  const { toast } = useToast();

  const selectedClientId = watch('cliente_id');

  useEffect(() => {
    if (isReady) {
      loadClients();
    }
  }, [isReady]);

  const loadClients = async () => {
    if (!isReady) return;
    
    setLoading(true);
    try {
      const filter = getOficinaFilter(oficina_id, user_id);
      if (!filter) {
        console.log('[ClientSelector] ❌ Filtros não disponíveis');
        setLoading(false);
        return;
      }

      // Simple query without complex conditional typing
      const { data, error } = await supabase
        .from('clients')
        .select('id, nome, telefone, email, veiculo')
        .eq('is_active', true)
        .order('nome');

      if (error) throw error;

      setClients(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear vehicle when client changes
  useEffect(() => {
    if (selectedClientId) {
      setValue('veiculo_id', '');
    }
  }, [selectedClientId, setValue]);

  return (
    <FormField
      control={control}
      name="cliente_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Cliente</FormLabel>
          <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Carregando clientes..." : "Selecione um cliente"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {clients.length === 0 ? (
                <SelectItem value="no-clients" disabled>
                  {loading ? "Carregando..." : "Nenhum cliente cadastrado"}
                </SelectItem>
              ) : (
                clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{client.nome}</span>
                      <span className="text-sm text-muted-foreground">
                        {client.telefone} {client.email && `• ${client.email}`}
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ClientSelector;
