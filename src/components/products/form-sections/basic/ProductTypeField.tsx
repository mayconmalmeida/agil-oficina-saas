
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/schemas/productSchema';

interface ProductTypeFieldProps {
  form: UseFormReturn<ProductFormValues>;
}

const ProductTypeField: React.FC<ProductTypeFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="tipo"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="produto">Produto/Peça</SelectItem>
              <SelectItem value="servico">Serviço</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProductTypeField;
