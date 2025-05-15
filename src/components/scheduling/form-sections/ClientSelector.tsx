
import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SchedulingFormValues } from '../SchedulingForm';

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
  const { control, setValue, watch } = useFormContext<SchedulingFormValues>();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  
  const selectedClientId = watch('cliente_id');
  
  // Reset vehicle when client changes
  useEffect(() => {
    if (selectedClientId && selectedClientId !== selectedClient) {
      setSelectedClient(selectedClientId);
      
      // Limpe o veículo anterior primeiro
      setValue('veiculo_id', '');
      
      // Find the client to get its vehicle
      const client = clients.find(c => c.id === selectedClientId);
      if (client) {
        setValue('veiculo_id', client.id);
      }
    }
  }, [selectedClientId, setValue, clients, selectedClient]);

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
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={control}
        name="cliente_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cliente</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
              }}
              defaultValue={field.value}
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
              value={field.value}
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
    </div>
  );
};

export default ClientSelector;
