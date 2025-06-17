
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { BudgetFormValues } from '../budgetSchema';
import { supabase } from '@/lib/supabase';
import { Car } from 'lucide-react';

interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  cor?: string;
  kilometragem?: string;
}

interface VehicleSelectorProps {
  form: UseFormReturn<BudgetFormValues>;
  clientId?: string;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({ form, clientId }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clientId) {
      loadClientVehicles();
    }
  }, [clientId]);

  const loadClientVehicles = async () => {
    if (!clientId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('cliente_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setVehicles(data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const formatVehicleDisplay = (vehicle: Vehicle) => {
    return `${vehicle.marca} ${vehicle.modelo} (${vehicle.ano}) - ${vehicle.placa}`;
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    if (selectedVehicle) {
      const vehicleInfo = formatVehicleDisplay(selectedVehicle);
      form.setValue('veiculo', vehicleInfo);
    }
  };

  if (!clientId) {
    return (
      <FormField
        control={form.control}
        name="veiculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Informações do Veículo</FormLabel>
            <FormControl>
              <input 
                {...field}
                placeholder="Selecione um cliente primeiro"
                className="w-full p-2 border rounded-md bg-gray-100"
                readOnly
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
            <Select onValueChange={handleVehicleSelect} disabled={loading}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Carregando veículos..." : "Selecione um veículo"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {vehicles.length === 0 ? (
                  <SelectItem value="no-vehicles" disabled>
                    Nenhum veículo cadastrado
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
            
            {field.value && (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium">Veículo Selecionado:</p>
                <p className="text-sm text-gray-600">{field.value}</p>
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  );
};

export default VehicleSelector;
