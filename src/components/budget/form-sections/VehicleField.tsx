
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
  const hasClientSelected = selectedClient && clienteValue && clienteValue.trim() !== '';

  return (
    <div className="space-y-4">
      {hasClientSelected ? (
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
