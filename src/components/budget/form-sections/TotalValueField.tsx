
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { BudgetFormValues } from '../budgetSchema';

interface TotalValueFieldProps {
  form: UseFormReturn<BudgetFormValues>;
}

const TotalValueField: React.FC<TotalValueFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="valor_total"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Valor Total (R$)</FormLabel>
          <FormControl>
            <Input 
              placeholder="0,00" 
              {...field} 
              readOnly
              className="bg-gray-50 font-medium text-right text-lg"
              value={field.value ? `R$ ${field.value}` : 'R$ 0,00'}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TotalValueField;
