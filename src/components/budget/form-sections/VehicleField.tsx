
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
    }
  }, [selectedClient, form]);

  return (
    <div className="space-y-4">
      {selectedClient ? (
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

      {selectedClient && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Cliente Selecionado</h4>
          <p className="text-sm text-blue-700">{selectedClient.nome}</p>
          <p className="text-xs text-blue-600">{selectedClient.telefone}</p>
        </div>
      )}
    </div>
  );
};

export default VehicleField;
