
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/schemas/productSchema';

interface ProductNameFieldProps {
  form: UseFormReturn<ProductFormValues>;
}

const ProductNameField: React.FC<ProductNameFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="nome"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome do Produto/Serviço</FormLabel>
          <FormControl>
            <Input placeholder="Ex: Óleo 5W30 Sintético 1L" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProductNameField;
