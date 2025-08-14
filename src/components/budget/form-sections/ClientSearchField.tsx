
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
  onClientSelect?: (client: Client | null) => void;
}

const ClientSearchField: React.FC<ClientSearchFieldProps> = ({ form, onClientSelect }) => {
  const [clientSearchOpen, setClientSearchOpen] = useState(false);

  const { 
    searchTerm, 
    setSearchTerm,
    clients, 
    isLoading: isLoadingClients, 
    selectClient,
    selectedClient,
    clearSelection
  } = useClientSearch();

  // Notify parent component when client changes
  useEffect(() => {
    if (onClientSelect) {
      onClientSelect(selectedClient);
    }
  }, [selectedClient, onClientSelect]);

  // When a client is selected, update the form
  const handleSelectClient = (client: Client) => {
    console.log('📝 ClientSearchField - Selecionando cliente no formulário:', client);
    
    selectClient(client);
    form.setValue('cliente', client.nome);
    setClientSearchOpen(false);
  };

  const handleInputChange = (value: string) => {
    console.log('⌨️ ClientSearchField - Input mudou:', value);
    
    form.setValue('cliente', value);
    setSearchTerm(value);
    
    // Se o campo foi limpo e havia um cliente selecionado, limpar tudo
    if (value === '' && selectedClient) {
     clearSelection();
     form.setValue('veiculo', '');
    }
    
    // Abrir dropdown se há input com pelo menos 2 caracteres
    if (value.length >= 2) {
      setClientSearchOpen(true);
    } else {
      setClientSearchOpen(false);
    }
  };

  const handleClearField = () => {
    console.log('🗑️ ClientSearchField - Limpando campo');
    form.setValue('cliente', '');
    form.setValue('veiculo', '');
    clearSelection();
    setClientSearchOpen(false);
  };

  // Fechar dropdown quando não há termo de busca
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
        <FormItem className="flex flex-col relative">
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
                  console.log('👁️ ClientSearchField - Campo focado com valor:', field.value);
                  if (field.value && field.value.length >= 2) {
                    setClientSearchOpen(true);
                  }
                }}
                autoComplete="off"
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
          
          {/* Dropdown de sugestões */}
          {clientSearchOpen && searchTerm.length >= 2 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
              {isLoadingClients ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Carregando clientes...
                </div>
              ) : clients.length > 0 ? (
                <div className="py-1">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{client.nome}</div>
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>{client.telefone}</span>
                        {client.email && <span>{client.email}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-4 text-center text-gray-500">
                  Nenhum cliente encontrado para "{searchTerm}"
                </div>
              )}
            </div>
          )}
          
          <FormMessage />
          
          {/* Mostrar cliente selecionado */}
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
