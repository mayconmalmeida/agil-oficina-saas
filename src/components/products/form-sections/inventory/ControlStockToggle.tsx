
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/schemas/productSchema';

interface ControlStockToggleProps {
  form: UseFormReturn<ProductFormValues>;
}

const ControlStockToggle: React.FC<ControlStockToggleProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="controlar_estoque"
      render={({ field }) => (
        <FormItem className="flex items-center space-x-2">
          <FormLabel className="text-sm">Controlar estoque</FormLabel>
          <FormControl>
            <Switch 
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default ControlStockToggle;
