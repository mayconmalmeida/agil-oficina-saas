
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/schemas/productSchema';

interface StockFieldsProps {
  form: UseFormReturn<ProductFormValues>;
}

const StockFields: React.FC<StockFieldsProps> = ({ form }) => {
  const handleNumberChange = (value: string, onChange: (value: string) => void) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    onChange(numbers);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="quantidade"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantidade em Estoque</FormLabel>
            <FormControl>
              <Input 
                type="text"
                placeholder="0"
                {...field}
                onChange={(e) => handleNumberChange(e.target.value, field.onChange)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="estoque_minimo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estoque Mínimo</FormLabel>
            <FormControl>
              <Input 
                type="text"
                placeholder="0"
                {...field}
                onChange={(e) => handleNumberChange(e.target.value, field.onChange)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default StockFields;
