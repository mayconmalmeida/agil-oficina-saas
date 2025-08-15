
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
  kilometragem?: string;
}

export const useClientVehicles = (clientId?: string) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (clientId) {
      loadVehicles();
    } else {
      setVehicles([]);
    }
  }, [clientId]);

  const loadVehicles = async () => {
    if (!clientId) return;
    
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('cliente_id', clientId)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar veículos:', error);
        throw error;
      }
      
      console.log('Veículos carregados:', data?.length || 0);
      setVehicles(data || []);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar veículos",
        description: "Não foi possível carregar os veículos do cliente.",
      });
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatVehicleDisplay = (vehicle: Vehicle) => {
    const baseInfo = `${vehicle.marca} ${vehicle.modelo} (${vehicle.ano}) - ${vehicle.placa}`;
    const additionalInfo = [];
    
    if (vehicle.cor) additionalInfo.push(vehicle.cor);
    if (vehicle.kilometragem) additionalInfo.push(`${vehicle.kilometragem} km`);
    
    return additionalInfo.length > 0 
      ? `${baseInfo} - ${additionalInfo.join(', ')}`
      : baseInfo;
  };

  return {
    vehicles,
    isLoading,
    formatVehicleDisplay,
    reloadVehicles: loadVehicles
  };
};
