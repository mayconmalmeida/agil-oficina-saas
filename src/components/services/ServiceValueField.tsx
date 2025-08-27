import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface ServiceValueFieldProps {
  form: UseFormReturn<any>;
}

const ServiceValueField: React.FC<ServiceValueFieldProps> = ({ form }) => {
  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const numericValue = parseInt(numbers, 10);
    if (numericValue < 100) {
      return `0,${numbers.padStart(2, '0')}`;
    }
    const reais = Math.floor(numericValue / 100);
    const centavos = numericValue % 100;
    const reaisFormatted = reais.toLocaleString('pt-BR');
    return `${reaisFormatted},${centavos.toString().padStart(2, '0')}`;
  };

  const parseCurrencyToNumber = (currencyString: string) => {
    const numbers = currencyString.replace(/\D/g, '');
    if (!numbers) return 0;
    return parseInt(numbers, 10) / 100;
  };

  const handleCurrencyChange = (value: string, onChange: (value: number) => void) => {
    const numericValue = parseCurrencyToNumber(value);
    onChange(numericValue);
  };

  return (
    <FormField
      control={form.control}
      name="valor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Valor (R$)</FormLabel>
          <FormControl>
            <Input 
              placeholder="0,00" 
              value={formatCurrency(((field.value || 0) * 100).toString())}
              onChange={(e) => handleCurrencyChange(e.target.value, field.onChange)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ServiceValueField;