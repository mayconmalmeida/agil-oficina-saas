
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { searchVehicleByPlate } from '@/services/vehicleDataService';
import { useToast } from '@/hooks/use-toast';

export const useVehicleLookup = (form: UseFormReturn<any>) => {
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const searchVehicleData = async (plate: string) => {
    if (!plate || plate.length < 7) return;

    setIsSearching(true);
    try {
      const vehicleData = await searchVehicleByPlate(plate);
      
      if (vehicleData) {
        // Atualiza os campos do formulário
        form.setValue('veiculo.marca', vehicleData.marca);
        form.setValue('veiculo.modelo', vehicleData.modelo);
        form.setValue('veiculo.ano', vehicleData.ano);
        
        toast({
          title: "Dados encontrados",
          description: `Veículo: ${vehicleData.marca} ${vehicleData.modelo} ${vehicleData.ano}`,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do veículo:', error);
      toast({
        variant: "destructive",
        title: "Erro na busca",
        description: "Não foi possível buscar os dados do veículo.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return {
    isSearching,
    searchVehicleData
  };
};
