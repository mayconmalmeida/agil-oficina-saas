
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/schemas/productSchema';

interface ProductCodeFieldProps {
  form: UseFormReturn<ProductFormValues>;
}

const ProductCodeField: React.FC<ProductCodeFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="codigo"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Código/Referência (opcional)</FormLabel>
          <FormControl>
            <Input placeholder="Ex: OL-5W30-1L" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProductCodeField;
