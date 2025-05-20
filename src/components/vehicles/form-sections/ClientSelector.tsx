
import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Client } from '@/utils/supabaseTypes';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from '@/lib/utils';
import { VehicleFormValues } from '@/hooks/useVehicleForm';

interface ClientSelectorProps {
  form: UseFormReturn<VehicleFormValues>;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ form }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('nome');
          
        if (error) throw error;
        
        // Ensure all client records have the needed properties
        const formattedClients = (data || []).map(client => ({
          ...client,
          tipo: client.tipo || 'pf',
          cor: client.cor || '',
          kilometragem: client.kilometragem || ''
        })) as Client[];
        
        setClients(formattedClients);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, []);

  const selectedClientId = form.watch('clienteId');
  const selectedClient = clients.find(client => client.id === selectedClientId);
  
  return (
    <FormField
      control={form.control}
      name="clienteId"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Cliente</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {isLoading ? (
                    "Carregando clientes..."
                  ) : field.value ? (
                    selectedClient?.nome || "Selecione um cliente"
                  ) : (
                    "Selecione um cliente"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar cliente..." />
                <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                <CommandGroup>
                  {clients.map((client) => (
                    <CommandItem
                      key={client.id}
                      value={client.id}
                      onSelect={() => {
                        form.setValue('clienteId', client.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          client.id === field.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {client.nome} - {client.telefone}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ClientSelector;
