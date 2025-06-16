
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { formatLicensePlate } from '@/utils/formatUtils';

interface ClientVehicleFieldsProps {
  form: UseFormReturn<any>;
  saveSuccess: boolean;
}

const ClientVehicleFields: React.FC<ClientVehicleFieldsProps> = ({ form, saveSuccess }) => {
  // Handle license plate formatting on blur to avoid infinite loops
  const handlePlacaBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      const formattedPlate = formatLicensePlate(value);
      if (formattedPlate !== value) {
        form.setValue('veiculo.placa', formattedPlate);
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="veiculo.placa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placa *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="ABC-1234 ou ABC1D23"
                  {...field}
                  maxLength={8}
                  disabled={saveSuccess}
                  className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                  style={{ textTransform: 'uppercase' }}
                  onBlur={handlePlacaBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="veiculo.ano"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ano *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="2022" 
                  {...field}
                  maxLength={4}
                  disabled={saveSuccess}
                  className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                  inputMode="numeric"
                  onKeyDown={(e) => {
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <FormField
          control={form.control}
          name="veiculo.marca"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marca *</FormLabel>
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
              <FormLabel>Modelo *</FormLabel>
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

      <div className="mt-3">
        <FormField
          control={form.control}
          name="veiculo.cor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor</FormLabel>
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
      </div>
    </>
  );
};

export default ClientVehicleFields;
