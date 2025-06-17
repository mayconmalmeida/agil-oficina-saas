
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/schemas/productSchema';

interface PricingFieldsProps {
  form: UseFormReturn<ProductFormValues>;
}

const PricingFields: React.FC<PricingFieldsProps> = ({ form }) => {
  const formatCurrency = (value: string) => {
    // Remove tudo que não é número ou vírgula
    const numbers = value.replace(/[^\d,]/g, '');
    
    // Se está vazio, retorna vazio
    if (!numbers) return '';
    
    // Se tem vírgula, processa decimal
    if (numbers.includes(',')) {
      const parts = numbers.split(',');
      const integerPart = parts[0].replace(/\D/g, '');
      const decimalPart = parts[1] ? parts[1].slice(0, 2).replace(/\D/g, '') : '';
      return decimalPart ? `${integerPart},${decimalPart}` : `${integerPart},`;
    }
    
    // Se não tem vírgula, formata como inteiro
    const cleanNumbers = numbers.replace(/\D/g, '');
    if (cleanNumbers.length <= 2) {
      return cleanNumbers;
    }
    
    // Adiciona vírgula para decimais automaticamente
    const integerPart = cleanNumbers.slice(0, -2) || '0';
    const decimalPart = cleanNumbers.slice(-2);
    return `${integerPart},${decimalPart}`;
  };

  const handleCurrencyChange = (value: string, onChange: (value: string) => void) => {
    const formatted = formatCurrency(value);
    onChange(formatted);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Permite apenas números, vírgula, backspace, delete, tab, escape, enter, setas
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    const isNumberOrComma = /^[0-9,]$/.test(e.key);
    
    if (!allowedKeys.includes(e.key) && !isNumberOrComma) {
      e.preventDefault();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="preco_custo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preço de Custo (R$)</FormLabel>
            <FormControl>
              <Input 
                placeholder="0,00" 
                {...field}
                onChange={(e) => handleCurrencyChange(e.target.value, field.onChange)}
                onKeyDown={handleKeyPress}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="preco_venda"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preço de Venda (R$)</FormLabel>
            <FormControl>
              <Input 
                placeholder="0,00" 
                {...field}
                onChange={(e) => handleCurrencyChange(e.target.value, field.onChange)}
                onKeyDown={handleKeyPress}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PricingFields;
