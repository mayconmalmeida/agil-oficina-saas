
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';
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

  // Integration with client search
  const { 
    searchTerm, 
    setSearchTerm,
    clients, 
    isLoading: isLoadingClients, 
    selectClient,
    selectedClient,
    clearSelection
  } = useClientSearch();

  // When a client is selected, update the form
  const handleSelectClient = (client: Client) => {
    selectClient(client);
    form.setValue('cliente', client.nome);
    
    // Format vehicle information
    const vehicleInfo = formatVehicleInfo(client);
    form.setValue('veiculo', vehicleInfo);
    
    setClientSearchOpen(false);
  };
  
  // Format vehicle information
  const formatVehicleInfo = (client: Client) => {
    if (client.marca && client.modelo) {
      let vehicleInfo = `${client.marca} ${client.modelo}`;
      if (client.ano) vehicleInfo += ` (${client.ano})`;
      if (client.placa) vehicleInfo += ` - Placa: ${client.placa}`;
      return vehicleInfo;
    }
    return client.veiculo || '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('cliente', value);
    setSearchTerm(value);
    
    if (value === '' && selectedClient) {
      clearSelection();
      form.setValue('veiculo', '');
    }
    
    // Open popover if there's input with at least 2 characters
    if (value.length >= 2) {
      setClientSearchOpen(true);
    } else {
      setClientSearchOpen(false);
    }
  };

  const handleClearField = () => {
    form.setValue('cliente', '');
    form.setValue('veiculo', '');
    clearSelection();
    setClientSearchOpen(false);
  };

  // Close popover when clicking outside or when no search term
  useEffect(() => {
    if (searchTerm.length < 2) {
      setClientSearchOpen(false);
    }
  }, [searchTerm]);

  return (
    <FormField
      control={form.control}
      name="cliente"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Cliente</FormLabel>
          <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <div className="relative">
                  <Input 
                    {...field} 
                    placeholder="Digite o nome do cliente..." 
                    className="pr-20"
                    onChange={handleInputChange}
                    onFocus={() => {
                      if (field.value && field.value.length >= 2) {
                        setClientSearchOpen(true);
                      }
                    }}
                  />
                  {field.value && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleClearField}
                      className="absolute right-10 top-0 h-full w-8 p-0 hover:bg-transparent"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </Button>
                  )}
                  {isLoadingClients ? (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-full" align="start" side="bottom" sideOffset={5}>
              <Command shouldFilter={false}>
                <CommandInput 
                  placeholder="Digite o nome do cliente..." 
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                  className="h-9"
                />
                <CommandEmpty>
                  {isLoadingClients ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Carregando...
                    </div>
                  ) : (
                    'Nenhum cliente encontrado'
                  )}
                </CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-48">
                    {clients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={client.nome}
                        onSelect={() => handleSelectClient(client)}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        <div className="w-full">
                          <div className="font-medium">{client.nome}</div>
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>{client.telefone}</span>
                            <span>{formatVehicleInfo(client)}</span>
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
