
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/schemas/productSchema';

interface ProductCodeFieldProps {
  form: UseFormReturn<ProductFormValues>;
  isEditing?: boolean;
}

const ProductCodeField: React.FC<ProductCodeFieldProps> = ({ form, isEditing = false }) => {
  const codigoValue = form.watch('codigo');
  const isReadonly = isEditing && codigoValue; // Readonly se está editando e já tem código

  return (
    <FormField
      control={form.control}
      name="codigo"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Código/Referência</FormLabel>
          <FormControl>
            <Input 
              placeholder={isReadonly ? "Código importado (não editável)" : "Gerado automaticamente"} 
              {...field} 
              readOnly={isReadonly}
              className={isReadonly ? "bg-gray-100 cursor-not-allowed" : ""}
            />
          </FormControl>
          {isReadonly && (
            <p className="text-xs text-gray-500 mt-1">
              Código importado via XML não pode ser alterado
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProductCodeField;
