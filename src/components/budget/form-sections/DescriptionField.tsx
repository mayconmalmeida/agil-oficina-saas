
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { BudgetFormValues } from '../budgetSchema';

interface DescriptionFieldProps {
  form: UseFormReturn<BudgetFormValues>;
}

const DescriptionField: React.FC<DescriptionFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="descricao"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Descrição do Serviço</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Revisão completa com troca de óleo e filtros" 
              className="min-h-32"
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DescriptionField;
