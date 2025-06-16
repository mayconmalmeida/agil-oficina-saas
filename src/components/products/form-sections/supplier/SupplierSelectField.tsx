
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductFormValues } from '@/schemas/productSchema';
import { useCategoriesAndSuppliers } from '@/hooks/useCategoriesAndSuppliers';
import { Loader2 } from 'lucide-react';

interface SupplierSelectFieldProps {
  form: UseFormReturn<ProductFormValues>;
}

const SupplierSelectField: React.FC<SupplierSelectFieldProps> = ({ form }) => {
  const { suppliers, isLoading } = useCategoriesAndSuppliers();

  return (
    <FormField
      control={form.control}
      name="fornecedor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Fornecedor (opcional)</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <FormControl>
              <SelectTrigger>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </div>
                ) : (
                  <SelectValue placeholder="Selecione um fornecedor" />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.name}>
                  {supplier.name}
                </SelectItem>
              ))}
              {suppliers.length === 0 && !isLoading && (
                <SelectItem value="" disabled>
                  Nenhum fornecedor encontrado
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SupplierSelectField;
