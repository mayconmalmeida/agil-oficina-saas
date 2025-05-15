
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { BudgetFormValues } from '../budgetSchema';
import { useClientSearch } from '@/hooks/useClientSearch';

interface VehicleFieldProps {
  form: UseFormReturn<BudgetFormValues>;
}

const VehicleField: React.FC<VehicleFieldProps> = ({ form }) => {
  const { selectedClient } = useClientSearch();

  return (
    <FormField
      control={form.control}
      name="veiculo"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Veículo</FormLabel>
          <FormControl>
            <Input 
              placeholder="Fiat Uno 2018, Placa ABC-1234" 
              {...field} 
              readOnly={selectedClient !== null}
              className={selectedClient !== null ? "bg-gray-100" : ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VehicleField;
