
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  cor?: string;
}

export const useClientVehicles = (clientId?: string) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (clientId) {
      fetchVehicles();
    } else {
      setVehicles([]);
    }
  }, [clientId]);

  const fetchVehicles = async () => {
    if (!clientId) return;

    setIsLoading(true);
    try {
      console.log('Buscando veículos para cliente:', clientId);

      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('cliente_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar veículos:', error);
        throw error;
      }

      console.log('Veículos encontrados:', data);
      setVehicles(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar veículos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar veículos",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatVehicleDisplay = (vehicle: Vehicle): string => {
    const parts = [vehicle.marca, vehicle.modelo, vehicle.ano];
    if (vehicle.placa) {
      parts.push(`(${vehicle.placa})`);
    }
    return parts.filter(Boolean).join(' ');
  };

  return {
    vehicles,
    isLoading,
    formatVehicleDisplay,
    refetch: fetchVehicles
  };
};
