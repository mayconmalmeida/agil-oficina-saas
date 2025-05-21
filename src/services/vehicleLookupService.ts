
import { supabase } from '@/lib/supabase';
import { VehicleInfo } from './types';
import { fetchVehicleFromDatabase } from './vehicleLookupService/databaseFetcher';
import { queryExternalApi } from './vehicleLookupService/externalApiFetcher';

export const lookupVehiclePlate = async (plate: string): Promise<VehicleInfo | null> => {
  try {
    // First check if we already have this plate in our database
    const vehicleInfo = await fetchVehicleFromDatabase(plate);
    
    if (vehicleInfo) {
      return vehicleInfo;
    }
    
    // If not found in our database, attempt to query external API
    return await queryExternalApi(plate);
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
