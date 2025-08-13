
import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { BudgetFormValues } from '../budgetSchema';
import { useClientSearch } from '@/hooks/useClientSearch';
import { useClientVehicles } from '@/hooks/useClientVehicles';
import { Car } from 'lucide-react';

interface VehicleFieldProps {
  form: UseFormReturn<BudgetFormValues>;
}

const VehicleField: React.FC<VehicleFieldProps> = ({ form }) => {
  const { selectedClient } = useClientSearch();
  const { vehicles, isLoading: isLoadingVehicles, formatVehicleDisplay } = useClientVehicles(selectedClient?.id);

  // Clear vehicle field when client changes
  useEffect(() => {
    console.log('🚗 VehicleField - Cliente mudou:', selectedClient);
    if (selectedClient) {
      form.setValue('veiculo', '');
      console.log('🚗 VehicleField - Limpando campo veículo para novo cliente');
    } else {
      form.setValue('veiculo', '');
      console.log('🚗 VehicleField - Limpando campo veículo (sem cliente)');
    }
  }, [selectedClient, form]);

  const handleVehicleSelect = (vehicleId: string) => {
    console.log('🚗 VehicleField - Veículo selecionado ID:', vehicleId);
    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    if (selectedVehicle) {
      const vehicleInfo = formatVehicleDisplay(selectedVehicle);
      form.setValue('veiculo', vehicleInfo);
      console.log('✅ VehicleField - Veículo formatado:', vehicleInfo);
    }
  };

  // Debug logs
  console.log('🔧 VehicleField - Debug:', {
    selectedClient: selectedClient ? { id: selectedClient.id, nome: selectedClient.nome } : null,
    vehiclesCount: vehicles.length,
    isLoadingVehicles,
    vehicles
  });

  if (!selectedClient) {
    return (
      <FormField
        control={form.control}
        name="veiculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Informações do Veículo</FormLabel>
            <FormControl>
              <Input 
                placeholder="Selecione um cliente primeiro" 
                {...field} 
                readOnly
                className="bg-gray-100"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="veiculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Selecionar Veículo</FormLabel>
            <Select 
              onValueChange={handleVehicleSelect} 
              disabled={isLoadingVehicles}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={
                    isLoadingVehicles ? "Carregando veículos..." : 
                    vehicles.length === 0 ? "Nenhum veículo cadastrado para este cliente" : 
                    "Selecione um veículo"
                  } />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {vehicles.length === 0 ? (
                  <SelectItem value="no-vehicles" disabled>
                    {isLoadingVehicles ? "Carregando..." : "Nenhum veículo cadastrado"}
                  </SelectItem>
                ) : (
                  vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4" />
                        <span>{formatVehicleDisplay(vehicle)}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
            
            {/* Manual input fallback if no vehicles */}
            {vehicles.length === 0 && !isLoadingVehicles && (
              <div className="mt-2">
                <FormLabel>Ou digite as informações do veículo:</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: Honda Civic 2020 - ABC-1234" 
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  );
};

export default VehicleField;
