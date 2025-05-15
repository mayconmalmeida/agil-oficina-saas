
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { ProductFormValues } from '@/schemas/productSchema';
import { Input } from '@/components/ui/input';

interface CategoriesFieldProps {
  form: UseFormReturn<ProductFormValues>;
}

const CategoriesField: React.FC<CategoriesFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="categorias"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categorias</FormLabel>
          <FormControl>
            <Input 
              placeholder="Ex: Manutenção, Peças, Acessórios" 
              {...field} 
              value={field.value || ''}
            />
          </FormControl>
          <FormDescription>
            Separar categorias por vírgulas
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CategoriesField;
