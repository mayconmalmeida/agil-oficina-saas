
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/schemas/productSchema';

interface DescriptionFieldProps {
  form: UseFormReturn<ProductFormValues>;
}

const DescriptionField: React.FC<DescriptionFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="descricao"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Descrição (opcional)</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Adicione detalhes sobre o produto ou serviço"
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

export default DescriptionField;
