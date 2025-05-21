
import { supabase } from '@/lib/supabase';
import { VehicleInfo } from '../types';

export const fetchVehicleFromDatabase = async (plate: string): Promise<VehicleInfo | null> => {
  try {
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
    
    return null;
  } catch (error) {
    console.error("Error fetching from database:", error);
    return null;
  }
};
