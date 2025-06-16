
import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { useVehicleLookup } from '@/hooks/useVehicleLookup';

interface ClientVehicleFieldsProps {
  form: UseFormReturn<any>;
  saveSuccess: boolean;
}

const ClientVehicleFields: React.FC<ClientVehicleFieldsProps> = ({ form, saveSuccess }) => {
  const { isSearching, searchVehicleData } = useVehicleLookup(form);
  const placa = form.watch('veiculo.placa');

  // Busca automática quando a placa é preenchida
  useEffect(() => {
    if (placa && placa.length >= 8) { // Formato ABC-1234 ou ABC1D23
      const timeoutId = setTimeout(() => {
        searchVehicleData(placa);
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [placa]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="veiculo.placa"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Placa
                {isSearching && <Loader2 className="h-4 w-4 animate-spin" />}
                {!isSearching && <Search className="h-4 w-4 text-gray-400" />}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="ABC1D23"
                  {...field}
                  maxLength={8}
                  disabled={saveSuccess || isSearching}
                  className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                />
              </FormControl>
              <FormMessage />
              {isSearching && (
                <p className="text-xs text-blue-600">Buscando dados do veículo...</p>
              )}
            </FormItem>
          )}
        />
        
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
    </>
  );
};

export default ClientVehicleFields;
