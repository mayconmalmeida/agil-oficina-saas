
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from '../EnhancedClientForm';
import { formatLicensePlate } from '@/utils/validationUtils';

interface VehicleInfoSectionProps {
  form: UseFormReturn<ClientFormValues>;
  saveSuccess: boolean;
}

const VehicleInfoSection: React.FC<VehicleInfoSectionProps> = ({ form, saveSuccess }) => {
  // Handle license plate formatting on blur to avoid infinite loops
  const handlePlacaBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const formattedPlaca = formatLicensePlate(value);
      if (formattedPlaca !== value) {
        form.setValue('veiculo.placa', formattedPlaca);
      }
    }
  };
  
  // Restrict year field to only numbers and 4 digits
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    form.setValue('veiculo.ano', value);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="veiculo.marca"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marca</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Fiat" 
                  {...field}
                  disabled={saveSuccess}
                  className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="veiculo.modelo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Uno" 
                  {...field}
                  disabled={saveSuccess}
                  className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="veiculo.ano"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ano</FormLabel>
              <FormControl>
                <Input 
                  placeholder="2022" 
                  {...field}
                  maxLength={4}
                  disabled={saveSuccess}
                  className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                  inputMode="numeric"
                  onChange={handleYearChange}
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="veiculo.placa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placa</FormLabel>
              <FormControl>
                <Input 
                  placeholder="ABC1D23 ou ABC-1234"
                  {...field}
                  maxLength={8}
                  disabled={saveSuccess}
                  className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                  onBlur={handlePlacaBlur}
                  style={{ textTransform: 'uppercase' }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="veiculo.cor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor (opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Branco" 
                  {...field}
                  disabled={saveSuccess}
                  className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="veiculo.kilometragem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kilometragem (opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="50000"
                  {...field}
                  disabled={saveSuccess}
                  className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                  inputMode="numeric"
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default VehicleInfoSection;
