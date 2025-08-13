
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';
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
      
      // Open dropdown if there's input with at least 2 characters
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

  // Close dropdown when clicking outside or when no search term
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
          <div className="relative">
            <FormControl>
              <Input 
                {...field} 
                placeholder="Digite o nome do cliente..." 
                className="pr-20"
                onChange={(e) => {
                  field.onChange(e);
                  handleInputChange(e.target.value);
                }}
                onFocus={() => {
                  if (field.value && field.value.length >= 2) {
                    setClientSearchOpen(true);
                  }
                }}
              />
            </FormControl>
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
          
          {/* Dropdown de sugestões - apenas quando há resultados */}
          {clientSearchOpen && searchTerm.length >= 2 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
              {isLoadingClients ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Carregando...
                </div>
              ) : clients.length > 0 ? (
                <div className="py-1">
                  {clients.map((client) => {
                    if (!client || !client.id) return null;
                    
                    return (
                      <div
                        key={client.id}
                        onClick={() => handleSelectClient(client)}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{client.nome || 'Nome não informado'}</div>
                        <div className="text-xs text-gray-500 flex justify-between">
                          <span>{client.telefone || 'Telefone não informado'}</span>
                          <span>{client.email || 'Email não informado'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-3 py-4 text-center text-gray-500">
                  Nenhum cliente encontrado para "{searchTerm}"
                </div>
              )}
            </div>
          )}
          
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
