
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductFormValues } from '@/schemas/productSchema';
import { useCategoriesAndSuppliers } from '@/hooks/useCategoriesAndSuppliers';
import { Loader2 } from 'lucide-react';

interface CategoriesSelectFieldProps {
  form: UseFormReturn<ProductFormValues>;
}

const CategoriesSelectField: React.FC<CategoriesSelectFieldProps> = ({ form }) => {
  const { categories, isLoading } = useCategoriesAndSuppliers();

  return (
    <FormField
      control={form.control}
      name="categorias"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categoria</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <FormControl>
              <SelectTrigger>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </div>
                ) : (
                  <SelectValue placeholder="Selecione uma categoria" />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
              {categories.length === 0 && !isLoading && (
                <SelectItem value="no-categories" disabled>
                  Nenhuma categoria encontrada
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormDescription>
            Selecione a categoria do produto
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CategoriesSelectField;
