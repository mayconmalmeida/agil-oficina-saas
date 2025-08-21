
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface ProductPricingProps {
  form: UseFormReturn<any>;
}

const ProductPricing: React.FC<ProductPricingProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="valor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preço de Venda*</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: 25,00" 
                {...field}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d,]/g, '');
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="preco_custo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preço de Custo</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: 15,00" 
                {...field}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d,]/g, '');
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ProductPricing;
