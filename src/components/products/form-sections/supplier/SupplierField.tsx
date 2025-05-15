
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/schemas/productSchema';

interface SupplierFieldProps {
  form: UseFormReturn<ProductFormValues>;
}

const SupplierField: React.FC<SupplierFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="fornecedor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Fornecedor (opcional)</FormLabel>
          <FormControl>
            <Input placeholder="Nome do fornecedor" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SupplierField;
