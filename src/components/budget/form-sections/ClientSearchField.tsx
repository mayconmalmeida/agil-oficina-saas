
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
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
    console.log('Selecionando cliente no formulário:', client);
    if (!client || !client.nome) {
      console.error('Cliente inválido selecionado:', client);
      return;
    }

    try {
      selectClient(client);
      form.setValue('cliente', client.nome);
      setClientSearchOpen(false);
    } catch (error) {
      console.error('Erro ao selecionar cliente:', error);
    }
  };

  const handleInputChange = (value: string) => {
    console.log('Mudança no input de cliente:', value);
    try {
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
    } catch (error) {
      console.error('Erro ao alterar input:', error);
    }
  };

  const handleClearField = () => {
    try {
      form.setValue('cliente', '');
      form.setValue('veiculo', '');
      clearSelection();
      setClientSearchOpen(false);
    } catch (error) {
      console.error('Erro ao limpar campo:', error);
    }
  };

  // Auto-trigger search when component mounts with existing value
  useEffect(() => {
    const currentValue = form.getValues('cliente');
    if (currentValue && currentValue.length >= 2 && !selectedClient) {
      setSearchTerm(currentValue);
    }
  }, [form, selectedClient, setSearchTerm]);

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
                    onChange={(e) => handleInputChange(e.target.value)}
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
                <CommandList>
                  <CommandEmpty>
                    {isLoadingClients ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Carregando...
                      </div>
                    ) : searchTerm.length >= 2 ? (
                      'Nenhum cliente encontrado'
                    ) : (
                      'Digite pelo menos 2 caracteres para buscar'
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="h-48">
                      {Array.isArray(clients) && clients.map((client) => {
                        if (!client || !client.id) return null;
                        
                        return (
                          <CommandItem
                            key={client.id}
                            value={client.id}
                            onSelect={() => handleSelectClient(client)}
                            className="cursor-pointer hover:bg-gray-50"
                          >
                            <div className="w-full">
                              <div className="font-medium">{client.nome || 'Nome não informado'}</div>
                              <div className="text-xs text-muted-foreground flex justify-between">
                                <span>{client.telefone || 'Telefone não informado'}</span>
                                <span>{client.veiculo || 'Veículo não informado'}</span>
                              </div>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </ScrollArea>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
          
          {selectedClient && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900">Cliente Selecionado</h4>
              <p className="text-sm text-blue-700">{selectedClient.nome}</p>
              <p className="text-xs text-blue-600">{selectedClient.telefone}</p>
              {selectedClient.email && (
                <p className="text-xs text-blue-600">{selectedClient.email}</p>
              )}
            </div>
          )}
        </FormItem>
      )}
    />
  );
};

export default ClientSearchField;
