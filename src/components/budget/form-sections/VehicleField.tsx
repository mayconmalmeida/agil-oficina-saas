
import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { BudgetFormValues } from '../budgetSchema';
import { useClientSearch } from '@/hooks/useClientSearch';
import VehicleSelector from './VehicleSelector';

interface VehicleFieldProps {
  form: UseFormReturn<BudgetFormValues>;
}

const VehicleField: React.FC<VehicleFieldProps> = ({ form }) => {
  const { selectedClient } = useClientSearch();

  // Update vehicle field when client is selected
  useEffect(() => {
    if (selectedClient) {
      // Clear previous vehicle selection when client changes
      form.setValue('veiculo', '');
      console.log('Cliente selecionado para veículos:', selectedClient);
    }
  }, [selectedClient, form]);

  // Watch for client field changes to determine if we should show vehicle selector
  const clienteValue = form.watch('cliente');
  
  // Enable vehicle field if client field has content (either typed or selected)
  const hasClientData = Boolean(clienteValue && clienteValue.trim() !== '');

  console.log('VehicleField - Cliente value:', clienteValue);
  console.log('VehicleField - Selected client:', selectedClient);
  console.log('VehicleField - Has client data:', hasClientData);

  return (
    <div className="space-y-4">
      {hasClientData ? (
        selectedClient ? (
          <VehicleSelector 
            form={form} 
            clientId={selectedClient.id} 
          />
        ) : (
          <FormField
            control={form.control}
            name="veiculo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Informações do Veículo</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Digite as informações do veículo (marca, modelo, ano, placa)" 
                    {...field} 
                    className="bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      ) : (
        <FormField
          control={form.control}
          name="veiculo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Informações do Veículo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Selecione um cliente primeiro" 
                  {...field} 
                  readOnly
                  className="bg-gray-100"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default VehicleField;
