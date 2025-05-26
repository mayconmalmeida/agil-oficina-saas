
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

interface ClientSelectorProps {
  clients: any[];
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ clients }) => {
  const { control, watch, setValue } = useFormContext();
  const [selectedClientVehicles, setSelectedClientVehicles] = useState<any[]>([]);
  
  const selectedClientId = watch('cliente_id');

  const handleClientChange = (clientId: string) => {
    setValue('cliente_id', clientId);
    setValue('veiculo_id', ''); // Reset vehicle selection
    
    // Find client vehicles (assuming vehicle data is in the client object)
    const selectedClient = clients.find(client => client.id === clientId);
    if (selectedClient) {
      // For now, create a mock vehicle entry based on client data
      const vehicles = [{
        id: `${clientId}-vehicle`,
        nome: `${selectedClient.marca || ''} ${selectedClient.modelo || ''} ${selectedClient.ano || ''}`.trim() || selectedClient.veiculo,
        placa: selectedClient.placa || ''
      }];
      setSelectedClientVehicles(vehicles);
    } else {
      setSelectedClientVehicles([]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5" />
          1. Selecionar Cliente e Veículo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="cliente_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select 
                onValueChange={handleClientChange} 
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
                      {client.nome} - {client.telefone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedClientId && (
          <FormField
            control={control}
            name="veiculo_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Veículo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um veículo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedClientVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.nome} {vehicle.placa && `- ${vehicle.placa}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ClientSelector;
