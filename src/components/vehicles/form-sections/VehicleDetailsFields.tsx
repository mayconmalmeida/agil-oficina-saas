
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VehicleFormValues } from '@/hooks/useVehicleForm';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface VehicleDetailsFieldsProps {
  form: UseFormReturn<VehicleFormValues>;
}

const VehicleDetailsFields: React.FC<VehicleDetailsFieldsProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Cor */}
      <FormField
        control={form.control}
        name="cor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cor (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Preto" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Kilometragem */}
      <FormField
        control={form.control}
        name="kilometragem"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kilometragem (opcional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: 45000" 
                {...field} 
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
  );
};

export default VehicleDetailsFields;
