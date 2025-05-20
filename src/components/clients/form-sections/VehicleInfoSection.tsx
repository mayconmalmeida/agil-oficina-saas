
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { ClientFormValues } from '../EnhancedClientForm';
import { formatLicensePlate } from '@/utils/validationUtils';
import { useVehicleLookup } from '@/services/vehicleLookupService';

interface VehicleInfoSectionProps {
  form: UseFormReturn<ClientFormValues>;
  saveSuccess: boolean;
}

const VehicleInfoSection: React.FC<VehicleInfoSectionProps> = ({ form, saveSuccess }) => {
  const { watch, setValue } = form;
  const placaValue = watch('veiculo.placa');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const { lookupPlate } = useVehicleLookup();
  
  // Format license plate
  React.useEffect(() => {
    if (placaValue) {
      const formattedPlaca = formatLicensePlate(placaValue);
      if (formattedPlaca !== placaValue) {
        setValue('veiculo.placa', formattedPlaca);
      }
    }
  }, [placaValue, setValue]);
  
  // Auto-lookup when a full plate is entered
  useEffect(() => {
    // Check if we have a properly formatted plate
    if (placaValue && (placaValue.length === 7 || placaValue.length === 8)) {
      const lookupVehicle = async () => {
        setIsLookingUp(true);
        try {
          const vehicle = await lookupPlate(placaValue);
          if (vehicle) {
            // Populate form with vehicle data
            if (vehicle.marca) setValue('veiculo.marca', vehicle.marca);
            if (vehicle.modelo) setValue('veiculo.modelo', vehicle.modelo);
            if (vehicle.ano) setValue('veiculo.ano', vehicle.ano);
            if (vehicle.cor) setValue('veiculo.cor', vehicle.cor);
          }
        } finally {
          setIsLookingUp(false);
        }
      };
      
      lookupVehicle();
    }
  }, [placaValue, lookupPlate, setValue]);
  
  // Restrict year field to only numbers and 4 digits
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setValue('veiculo.ano', value);
  };
  
  // Manual lookup function
  const handleManualLookup = async () => {
    if (placaValue) {
      setIsLookingUp(true);
      try {
        await lookupPlate(placaValue);
      } finally {
        setIsLookingUp(false);
      }
    }
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
              <div className="flex space-x-2">
                <FormControl>
                  <Input 
                    placeholder="ABC1D23 ou ABC-1234"
                    {...field}
                    maxLength={8}
                    disabled={saveSuccess}
                    className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                  />
                </FormControl>
                <Button 
                  type="button"
                  size="icon" 
                  variant="outline" 
                  onClick={handleManualLookup}
                  disabled={isLookingUp || !placaValue || saveSuccess}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
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
