
import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { useVehicleLookup } from '@/hooks/useVehicleLookup';
import { formatLicensePlate, validateLicensePlate } from '@/utils/formatUtils';

interface ClientVehicleFieldsProps {
  form: UseFormReturn<any>;
  saveSuccess: boolean;
}

const ClientVehicleFields: React.FC<ClientVehicleFieldsProps> = ({ form, saveSuccess }) => {
  const { isSearching, searchVehicleData } = useVehicleLookup(form);
  const placa = form.watch('veiculo.placa');

  // Format license plate as user types
  useEffect(() => {
    if (placa) {
      const formattedPlate = formatLicensePlate(placa);
      if (formattedPlate !== placa) {
        form.setValue('veiculo.placa', formattedPlate);
      }
    }
  }, [placa, form]);

  // Auto search when plate is complete (7 characters without spaces/hyphens)
  useEffect(() => {
    if (placa) {
      const cleanPlaca = placa.replace(/[^A-Za-z0-9]/g, '');
      
      // Check if plate is complete (7 characters) and valid
      if (cleanPlaca.length === 7 && validateLicensePlate(placa)) {
        // Add delay to avoid too many requests while typing
        const timeoutId = setTimeout(() => {
          console.log('Iniciando busca automática para placa:', placa);
          searchVehicleData(placa);
        }, 500);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [placa, searchVehicleData]);

  // Handle plate field blur as fallback
  const handlePlateBlur = () => {
    if (placa) {
      const cleanPlaca = placa.replace(/[^A-Za-z0-9]/g, '');
      
      if (cleanPlaca.length === 7 && validateLicensePlate(placa)) {
        console.log('Busca por blur do campo placa:', placa);
        searchVehicleData(placa);
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
              <FormLabel className="flex items-center gap-2">
                Placa *
                {isSearching && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                {!isSearching && <Search className="h-4 w-4 text-gray-400" />}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="ABC-1234 ou ABC1D23"
                  {...field}
                  maxLength={8}
                  disabled={saveSuccess || isSearching}
                  className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                  style={{ textTransform: 'uppercase' }}
                  onBlur={handlePlateBlur}
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
