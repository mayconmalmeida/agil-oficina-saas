
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
              placeholder="299,90" 
              {...field} 
              onChange={(e) => {
                // Permitir apenas números e vírgula
                const value = e.target.value.replace(/[^\d,]/g, '');
                field.onChange(value);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TotalValueField;
