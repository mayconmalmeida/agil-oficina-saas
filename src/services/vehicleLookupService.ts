import { supabase } from '@/lib/supabase';

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

export const useVehicleLookup = () => {
  const lookupPlate = async (plate: string): Promise<VehicleInfo | null> => {
    if (!plate || plate.length < 7) {
      return null;
    }
    
    try {
      return await lookupVehiclePlate(plate);
    } catch (error) {
      console.error("Error in vehicle lookup:", error);
      return null;
    }
  };
  
  return { lookupPlate };
};
