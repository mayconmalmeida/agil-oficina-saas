
import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SchedulingFormValues } from '../SchedulingForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Search } from 'lucide-react';
import { useClientSearch } from '@/hooks/useClientSearch';

interface ClientSelectorProps {
  clients: {
    id: string;
    nome: string;
    veiculo: string;
    placa?: string;
    marca?: string;
    modelo?: string;
    ano?: string;
  }[];
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ clients }) => {
  const { control, setValue, watch, resetField } = useFormContext<SchedulingFormValues>();
  const [showSearch, setShowSearch] = useState(false);
  const { 
    searchTerm, 
    setSearchTerm, 
    clients: searchResults, 
    isLoading, 
    selectedClient, 
    selectClient, 
    clearSelection 
  } = useClientSearch();
  
  const selectedClientId = watch('cliente_id');
  const selectedVehicleId = watch('veiculo_id');
  
  // Reset vehicle when client changes
  useEffect(() => {
    if (selectedClientId && selectedClientId !== selectedClient?.id) {
      resetField('veiculo_id');
    }
  }, [selectedClientId, selectedClient, resetField]);

  // Formatar o texto do veículo para exibição
  const formatVehicleText = (client: any) => {
    if (client.marca && client.modelo) {
      let text = `${client.marca} ${client.modelo}`;
      if (client.ano) text += ` (${client.ano})`;
      if (client.placa) text += ` - Placa: ${client.placa}`;
      return text;
    }
    return client.veiculo || 'Veículo não especificado';
  };
  
  // Handle client selection from search results
  const handleClientSelect = (client: any) => {
    selectClient(client);
    setValue('cliente_id', client.id);
    setShowSearch(false);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {showSearch ? (
        <div className="md:col-span-2">
          <FormLabel>Buscar Cliente</FormLabel>
          <div className="relative">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Buscar por nome, telefone ou placa..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={() => {
                clearSelection();
                setShowSearch(false);
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {searchTerm.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-sm text-gray-500">Carregando...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">Nenhum cliente encontrado</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {searchResults.map((client) => (
                      <li 
                        key={client.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleClientSelect(client)}
                      >
                        <div className="font-medium">{client.nome}</div>
                        <div className="text-sm text-gray-600">{formatVehicleText(client)}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <FormField
            control={control}
            name="cliente_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const client = clients.find(c => c.id === value);
                        if (client) {
                          selectClient(client);
                        }
                      }}
                      value={field.value}
                    >
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
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowSearch(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="veiculo_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Veículo</FormLabel>
                <Select
                  disabled={!selectedClientId}
                  onValueChange={field.onChange}
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedClientId && 
                      clients
                        .filter(c => c.id === selectedClientId)
                        .map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {formatVehicleText(client)}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
};

export default ClientSelector;
