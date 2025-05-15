
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UseFormReturn } from 'react-hook-form';
import { BudgetFormValues } from '../budgetSchema';
import { useClientSearch, Client } from '@/hooks/useClientSearch';

interface ClientSearchFieldProps {
  form: UseFormReturn<BudgetFormValues>;
}

const ClientSearchField: React.FC<ClientSearchFieldProps> = ({ form }) => {
  const [clientSearchOpen, setClientSearchOpen] = useState(false);

  // Integração com a busca de clientes
  const { 
    searchTerm, 
    setSearchTerm,
    clients, 
    isLoading: isLoadingClients, 
    selectClient,
    selectedClient,
    clearSelection
  } = useClientSearch();

  // Quando um cliente for selecionado, atualize o formulário
  const handleSelectClient = (client: Client) => {
    selectClient(client);
    form.setValue('cliente', client.nome);
    
    // Format vehicle information
    const vehicleInfo = formatVehicleInfo(client);
    form.setValue('veiculo', vehicleInfo);
    
    setClientSearchOpen(false);
  };
  
  // Formatar informações do veículo
  const formatVehicleInfo = (client: Client) => {
    if (client.marca && client.modelo) {
      let vehicleInfo = `${client.marca} ${client.modelo}`;
      if (client.ano) vehicleInfo += ` (${client.ano})`;
      if (client.placa) vehicleInfo += ` - Placa: ${client.placa}`;
      return vehicleInfo;
    }
    return client.veiculo || '';
  };

  const handlePopoverOpenChange = (open: boolean) => {
    // Only open if there's a search term with at least 2 characters
    if (open && (!searchTerm || searchTerm.length < 2)) {
      return;
    }
    setClientSearchOpen(open);
  };

  return (
    <FormField
      control={form.control}
      name="cliente"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Cliente</FormLabel>
          <Popover open={clientSearchOpen} onOpenChange={handlePopoverOpenChange}>
            <PopoverTrigger asChild>
              <FormControl>
                <div className="relative">
                  <Input 
                    {...field} 
                    placeholder="Buscar cliente..." 
                    className="pr-10"
                    onChange={(e) => {
                      field.onChange(e);
                      setSearchTerm(e.target.value);
                      if (e.target.value === '' && selectedClient) {
                        clearSelection();
                        form.setValue('veiculo', '');
                      }
                      // Open popover only if there's input with at least 2 characters
                      setClientSearchOpen(e.target.value.length >= 2);
                    }}
                  />
                  {field.value && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        field.onChange('');
                        clearSelection();
                        form.setValue('veiculo', '');
                      }}
                      className="absolute right-10 top-2 h-5 w-5 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start" side="bottom" sideOffset={5}>
              <Command>
                <CommandInput 
                  placeholder="Digite o nome do cliente..." 
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                  className="h-9"
                />
                <CommandEmpty>
                  {isLoadingClients ? 'Carregando...' : 'Nenhum cliente encontrado'}
                </CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-48">
                    {clients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={client.id} // Use ID as the value for unique identification
                        onSelect={() => handleSelectClient(client)}
                        className="cursor-pointer"
                      >
                        <div>
                          <div className="font-medium">{client.nome}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatVehicleInfo(client) || client.telefone}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </ScrollArea>
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

export default ClientSearchField;
