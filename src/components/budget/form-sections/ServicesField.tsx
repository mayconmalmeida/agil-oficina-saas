
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { BudgetFormValues } from '../budgetSchema';

interface ServicesFieldProps {
  form: UseFormReturn<BudgetFormValues>;
}

const ServicesField: React.FC<ServicesFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="descricao"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Serviços/Produtos</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Descreva os serviços e produtos incluídos no orçamento..." 
              className="min-h-20"
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ServicesField;
