
import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VehicleFormValues } from '@/hooks/useVehicleForm';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { formatLicensePlate } from '@/utils/formatUtils';

interface VehicleBasicInfoFieldsProps {
  form: UseFormReturn<VehicleFormValues>;
}

const VehicleBasicInfoFields: React.FC<VehicleBasicInfoFieldsProps> = ({ form }) => {
  // Format license plate
  const placa = form.watch('placa');
  
  useEffect(() => {
    if (placa) {
      const formattedPlate = formatLicensePlate(placa);
      if (formattedPlate !== placa) {
        form.setValue('placa', formattedPlate);
      }
    }
  }, [placa, form]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Placa */}
      <FormField
        control={form.control}
        name="placa"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Placa</FormLabel>
            <FormControl>
              <Input placeholder="ABC-1234 ou ABC1D23" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Ano */}
      <FormField
        control={form.control}
        name="ano"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ano</FormLabel>
            <FormControl>
              <Input 
                placeholder="2023" 
                {...field} 
                maxLength={4}
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

      {/* Marca */}
      <FormField
        control={form.control}
        name="marca"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marca</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Ford" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Modelo */}
      <FormField
        control={form.control}
        name="modelo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modelo</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Focus" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default VehicleBasicInfoFields;
