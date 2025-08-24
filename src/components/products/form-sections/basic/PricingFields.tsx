
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
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Se está vazio, retorna vazio
    if (!numbers) return '';
    
    // Converte para número e formata
    const numericValue = parseInt(numbers, 10);
    
    // Se for menor que 100, trata como centavos
    if (numericValue < 100) {
      return `0,${numbers.padStart(2, '0')}`;
    }
    
    // Separa reais e centavos
    const reais = Math.floor(numericValue / 100);
    const centavos = numericValue % 100;
    
    // Formata com separador de milhares
    const reaisFormatted = reais.toLocaleString('pt-BR');
    
    return `${reaisFormatted},${centavos.toString().padStart(2, '0')}`;
  };

  const parseCurrencyToNumber = (currencyString: string) => {
    // Remove tudo que não é número
    const numbers = currencyString.replace(/\D/g, '');
    if (!numbers) return 0;
    // Converte para decimal (divide por 100 porque os centavos são os últimos 2 dígitos)
    return parseInt(numbers, 10) / 100;
  };

  const handleCurrencyChange = (value: string, onChange: (value: number) => void) => {
    const formatted = formatCurrency(value);
    const numericValue = parseCurrencyToNumber(value);
    onChange(numericValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Permite apenas números, backspace, delete, tab, escape, enter, setas
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    const isNumber = /^[0-9]$/.test(e.key);
    
    if (!allowedKeys.includes(e.key) && !isNumber) {
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
                value={formatCurrency(field.value?.toString() || '0')}
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
                value={formatCurrency(field.value?.toString() || '0')}
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
