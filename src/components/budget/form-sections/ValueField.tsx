
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { BudgetFormValues } from '../budgetSchema';

interface ValueFieldProps {
  form: UseFormReturn<BudgetFormValues>;
}

const ValueField: React.FC<ValueFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="valor_total"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Valor Total (R$)</FormLabel>
          <FormControl>
            <Input 
              type="number"
              step="0.01"
              placeholder="0.00" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ValueField;
