
import React, { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VehicleFormValues } from '@/hooks/useVehicleForm';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { formatLicensePlate, validateLicensePlate } from '@/utils/formatUtils';
import { useVehicleLookup } from '@/hooks/useVehicleLookup';
import { Search, Loader2 } from 'lucide-react';

interface VehicleBasicInfoFieldsProps {
  form: UseFormReturn<VehicleFormValues>;
}

const VehicleBasicInfoFields: React.FC<VehicleBasicInfoFieldsProps> = ({ form }) => {
  const { isSearching, searchVehicleData } = useVehicleLookup(form);
  const lastSearchedPlate = useRef<string>('');
  
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

  // Auto search when plate is complete and valid
  useEffect(() => {
    if (placa && !isSearching) {
      const cleanPlaca = placa.replace(/[^A-Za-z0-9]/g, '');
      
      // Check if plate is complete (7 characters), valid, and not already searched
      if (cleanPlaca.length === 7 && 
          validateLicensePlate(placa) && 
          lastSearchedPlate.current !== placa) {
        
        console.log('🚗 Placa completa detectada:', placa);
        lastSearchedPlate.current = placa;
        
        // Add delay to avoid too many requests while typing
        const timeoutId = setTimeout(() => {
          console.log('⏰ Executando busca automática para placa:', placa);
          searchVehicleData(placa);
        }, 1000);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [placa, searchVehicleData, isSearching]);

  // Handle manual search button click
  const handleManualSearch = () => {
    if (placa && validateLicensePlate(placa)) {
      console.log('🔎 Busca manual iniciada para placa:', placa);
      lastSearchedPlate.current = placa;
      searchVehicleData(placa);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Placa */}
      <FormField
        control={form.control}
        name="placa"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              Placa *
              {isSearching && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
              {!isSearching && placa && validateLicensePlate(placa) && (
                <button
                  type="button"
                  onClick={handleManualSearch}
                  className="text-blue-500 hover:text-blue-700"
                  disabled={isSearching}
                  title="Buscar dados do veículo"
                >
                  <Search className="h-4 w-4" />
                </button>
              )}
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="ABC-1234 ou ABC1D23" 
                {...field} 
                maxLength={8}
                disabled={isSearching}
                style={{ textTransform: 'uppercase' }}
              />
            </FormControl>
            <FormMessage />
            {isSearching && (
              <p className="text-xs text-blue-600">Buscando dados do veículo...</p>
            )}
            {placa && !validateLicensePlate(placa) && placa.replace(/[^A-Za-z0-9]/g, '').length >= 7 && (
              <p className="text-xs text-red-600">Formato de placa inválido. Use ABC-1234 ou ABC1D23</p>
            )}
          </FormItem>
        )}
      />
      
      {/* Ano */}
      <FormField
        control={form.control}
        name="ano"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ano *</FormLabel>
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
            <FormLabel>Marca *</FormLabel>
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
            <FormLabel>Modelo *</FormLabel>
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
