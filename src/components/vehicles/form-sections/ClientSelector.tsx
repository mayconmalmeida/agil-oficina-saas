
import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VehicleFormValues } from '@/hooks/useVehicleForm';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ClientSelectorProps {
  form: UseFormReturn<VehicleFormValues>;
}

interface Client {
  id: string;
  nome: string;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ form }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const { toast } = useToast();
  
  // Fetch clients for dropdown
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, nome')
          .order('nome');
          
        if (error) throw error;
        
        setClients(data || []);
      } catch (error: any) {
        console.error('Error fetching clients:', error.message);
        toast({
          variant: "destructive",
          title: "Erro ao carregar clientes",
          description: "Não foi possível carregar a lista de clientes.",
        });
      } finally {
        setLoadingClients(false);
      }
    };
    
    fetchClients();
  }, [toast]);
  
  if (loadingClients) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin text-oficina" />
        <span>Carregando clientes...</span>
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name="cliente_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Cliente</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ClientSelector;
