
import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { BudgetFormValues } from '../budgetSchema';
import { useClientSearch } from '@/hooks/useClientSearch';

interface VehicleFieldProps {
  form: UseFormReturn<BudgetFormValues>;
}

const VehicleField: React.FC<VehicleFieldProps> = ({ form }) => {
  const { selectedClient } = useClientSearch();

  // Update vehicle field when client is selected
  useEffect(() => {
    if (selectedClient) {
      // Format vehicle information as separate readable fields
      const vehicleParts = [];
      
      if (selectedClient.marca) vehicleParts.push(selectedClient.marca);
      if (selectedClient.modelo) vehicleParts.push(selectedClient.modelo);
      if (selectedClient.ano) vehicleParts.push(`(${selectedClient.ano})`);
      
      const vehicleInfo = vehicleParts.join(' ');
      const fullVehicleInfo = vehicleInfo + (selectedClient.placa ? ` - Placa: ${selectedClient.placa}` : '');
      
      form.setValue('veiculo', fullVehicleInfo || selectedClient.veiculo || '');
    }
  }, [selectedClient, form]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="veiculo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Informações do Veículo</FormLabel>
            <FormControl>
              <Input 
                placeholder="Informações do veículo aparecerão aqui quando selecionar um cliente" 
                {...field} 
                readOnly={selectedClient !== null}
                className={selectedClient !== null ? "bg-gray-100" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedClient && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
          <div>
            <label className="text-sm font-medium text-gray-700">Marca</label>
            <Input 
              value={selectedClient.marca || 'Não informado'} 
              readOnly 
              className="bg-white mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Modelo</label>
            <Input 
              value={selectedClient.modelo || 'Não informado'} 
              readOnly 
              className="bg-white mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Ano</label>
            <Input 
              value={selectedClient.ano || 'Não informado'} 
              readOnly 
              className="bg-white mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Placa</label>
            <Input 
              value={selectedClient.placa || 'Não informado'} 
              readOnly 
              className="bg-white mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Cor</label>
            <Input 
              value={selectedClient.cor || 'Não informado'} 
              readOnly 
              className="bg-white mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Kilometragem</label>
            <Input 
              value={selectedClient.kilometragem || 'Não informado'} 
              readOnly 
              className="bg-white mt-1"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleField;
