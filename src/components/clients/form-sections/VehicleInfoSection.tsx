
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ClientFormValues } from '@/hooks/useClientForm';
import { CheckCircle2, Car } from 'lucide-react';

interface VehicleInfoSectionProps {
  form: UseFormReturn<ClientFormValues>;
  saveSuccess?: boolean;
}

const VehicleInfoSection: React.FC<VehicleInfoSectionProps> = ({ 
  form, 
  saveSuccess = false 
}) => {
  // Handle license plate formatting
  const handlePlacaChange = (value: string) => {
    // Remove non-alphanumeric characters and convert to uppercase
    let formattedValue = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Apply formatting based on Brazilian license plate patterns
    if (formattedValue.length <= 7) {
      // Old format: ABC1234
      if (formattedValue.length > 3) {
        formattedValue = formattedValue.slice(0, 3) + '-' + formattedValue.slice(3);
      }
    } else {
      // New format: ABC1D23
      if (formattedValue.length > 3) {
        formattedValue = formattedValue.slice(0, 3) + formattedValue.slice(3, 4) + formattedValue.slice(4);
      }
    }
    
    return formattedValue;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Car className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Informações do Veículo</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="veiculo.marca"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Marca *
                {saveSuccess && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Ford, Volkswagen" 
                  {...field}
                  className={saveSuccess ? "border-green-500" : ""}
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
              <FormLabel className="flex items-center gap-2">
                Modelo *
                {saveSuccess && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Focus, Gol" 
                  {...field}
                  className={saveSuccess ? "border-green-500" : ""}
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
              <FormLabel className="flex items-center gap-2">
                Ano *
                {saveSuccess && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: 2020" 
                  maxLength={4}
                  {...field}
                  className={saveSuccess ? "border-green-500" : ""}
                  inputMode="numeric"
                  onKeyDown={(e) => {
                    // Allow only numbers and control keys
                    if (
                      !/^\d$/.test(e.key) && 
                      !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)
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
              <FormLabel className="flex items-center gap-2">
                Placa *
                {saveSuccess && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: ABC-1234 ou ABC1D23" 
                  {...field}
                  className={saveSuccess ? "border-green-500" : ""}
                  style={{ textTransform: 'uppercase' }}
                  maxLength={8}
                  onChange={(e) => {
                    const formattedValue = handlePlacaChange(e.target.value);
                    field.onChange(formattedValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="veiculo.cor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Cor
                {saveSuccess && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Branco, Preto" 
                  {...field}
                  className={saveSuccess ? "border-green-500" : ""}
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
              <FormLabel className="flex items-center gap-2">
                Kilometragem
                {saveSuccess && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: 50000" 
                  {...field}
                  className={saveSuccess ? "border-green-500" : ""}
                  inputMode="numeric"
                  onKeyDown={(e) => {
                    // Allow only numbers and control keys
                    if (
                      !/^\d$/.test(e.key) && 
                      !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)
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
