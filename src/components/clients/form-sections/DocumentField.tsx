
import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CNPJInput } from '@/components/ui/cnpj-input';
import { UseFormReturn } from 'react-hook-form';
import { formatCPF } from '@/utils/validationUtils';

interface DocumentFieldProps {
  form: UseFormReturn<any>;
  saveSuccess?: boolean;
}

const DocumentField: React.FC<DocumentFieldProps> = ({ form, saveSuccess = false }) => {
  const tipoValue = form.watch('tipo');
  const documentValue = form.watch('documento');
  
  // Format CPF when tipo is 'pf'
  useEffect(() => {
    if (documentValue && tipoValue === 'pf') {
      const formattedCPF = formatCPF(documentValue);
      if (formattedCPF !== documentValue) {
        form.setValue('documento', formattedCPF);
      }
    }
  }, [documentValue, tipoValue, form]);

  // Clear document field when tipo changes
  useEffect(() => {
    form.setValue('documento', '');
  }, [tipoValue, form]);

  return (
    <FormField
      control={form.control}
      name="documento"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{tipoValue === 'pj' ? "CNPJ" : "CPF"}</FormLabel>
          <FormControl>
            {tipoValue === 'pj' ? (
              <CNPJInput
                value={field.value}
                onChange={field.onChange}
                disabled={saveSuccess}
                className={saveSuccess ? "bg-green-50 border-green-200" : ""}
              />
            ) : (
              <Input 
                placeholder="000.000.000-00" 
                {...field}
                disabled={saveSuccess}
                className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                inputMode="numeric"
                maxLength={14}
                onKeyDown={(e) => {
                  // Allow only digits, backspace, tab, delete, and arrow keys
                  if (
                    !/^\d$/.test(e.key) && 
                    !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DocumentField;
