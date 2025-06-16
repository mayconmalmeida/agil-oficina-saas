
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { searchVehicleByPlateReal } from '@/services/realVehicleDataService';
import { useToast } from '@/hooks/use-toast';

export const useVehicleLookup = (form: UseFormReturn<any>) => {
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const searchVehicleData = async (plate: string) => {
    if (!plate || plate.length < 7) return;

    setIsSearching(true);
    try {
      const vehicleData = await searchVehicleByPlateReal(plate);
      
      if (vehicleData) {
        // Atualiza os campos do formulário
        form.setValue('veiculo.marca', vehicleData.marca);
        form.setValue('veiculo.modelo', vehicleData.modelo);
        form.setValue('veiculo.ano', vehicleData.ano);
        if (vehicleData.cor) {
          form.setValue('veiculo.cor', vehicleData.cor);
        }
        
        toast({
          title: "Dados encontrados",
          description: `Veículo: ${vehicleData.marca} ${vehicleData.modelo} ${vehicleData.ano}`,
        });
      } else {
        toast({
          title: "Dados não encontrados",
          description: "Não foi possível encontrar dados para esta placa. Preencha manualmente.",
          variant: "default"
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
