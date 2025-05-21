
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface VehicleInfo {
  marca?: string;
  modelo?: string;
  ano?: string;
  cor?: string;
  placa: string;
}

export const lookupVehiclePlate = async (plate: string): Promise<VehicleInfo | null> => {
  try {
    // First check if we already have this plate in our database
    const { data, error } = await supabase
      .from('clients')
      .select('marca, modelo, ano, placa, cor')
      .eq('placa', plate)
      .maybeSingle();
    
    if (error) {
      console.error("Error querying database:", error);
      return null;
    }
    
    if (data) {
      return {
        marca: data.marca || undefined,
        modelo: data.modelo || undefined,
        ano: data.ano || undefined,
        cor: data.cor || undefined,
        placa: data.placa || plate,
      };
    }
    
    // If not found in our database, we could implement an external API call
    // Note: This is just a placeholder and would need to be implemented
    // with an actual API integration with buscaplacas.com.br
    console.log(`Vehicle with plate ${plate} not found in database. External lookup would be needed.`);
    
    return null;
  } catch (error) {
    console.error("Error looking up vehicle plate:", error);
    return null;
  }
};

// Hook for vehicle lookup with toast notifications
export const useVehicleLookup = () => {
  const { toast } = useToast();
  
  const lookupPlate = async (plate: string): Promise<VehicleInfo | null> => {
    if (!plate || plate.length < 7) {
      return null;
    }
    
    try {
      const vehicleInfo = await lookupVehiclePlate(plate);
      
      if (vehicleInfo) {
        toast({
          title: "Veículo encontrado",
          description: `${vehicleInfo.marca || ''} ${vehicleInfo.modelo || ''} ${vehicleInfo.ano || ''}`.trim() || 'Dados básicos encontrados',
        });
        return vehicleInfo;
      } else {
        toast({
          title: "Veículo não encontrado",
          description: "Não encontramos informações para esta placa",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar informações do veículo",
        variant: "destructive",
      });
      return null;
    }
  };
  
  return { lookupPlate };
};
