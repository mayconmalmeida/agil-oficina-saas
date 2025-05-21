
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { lookupVehiclePlate } from '@/services/vehicleLookupService';
import { Client } from '@/utils/supabaseTypes';

export const useLookupService = () => {
  const { toast } = useToast();

  // Fetch client data when clientId changes
  const fetchClientById = async (clientId: string): Promise<Client | null> => {
    if (!clientId) return null;
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          tipo: (data as any).tipo || 'pf'
        } as Client;
      }
      return null;
    } catch (error) {
      console.error('Error fetching client:', error);
      return null;
    }
  };

  // Vehicle plate lookup service
  const lookupPlate = async (plate: string) => {
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

  return { fetchClientById, lookupPlate };
};
