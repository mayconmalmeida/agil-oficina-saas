
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface DaysRemainingData {
  diasRestantes: number;
  tipoPlano: 'trial' | 'mensal' | 'anual' | 'ativo' | 'sem_plano';
  isExpiringSoon: boolean;
  isExpired: boolean;
}

export const useDaysRemaining = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DaysRemainingData>({
    diasRestantes: 0,
    tipoPlano: 'sem_plano',
    isExpiringSoon: false,
    isExpired: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateDaysRemaining = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Buscar dados do perfil para obter trial_started_at e plano
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('trial_started_at, plano')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar perfil:', error);
          setLoading(false);
          return;
        }

        const hoje = new Date();
        let dias = 0;
        let tipoPlano: DaysRemainingData['tipoPlano'] = 'sem_plano';

        // Calcular dias restantes baseado na trial_started_at
        if (profileData?.trial_started_at) {
          const trialStart = new Date(profileData.trial_started_at);
          const trialEnd = new Date(trialStart.getTime() + (7 * 24 * 60 * 60 * 1000));
          
          // Calcular dias restantes
          const diffTime = trialEnd.getTime() - hoje.getTime();
          dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Determinar tipo de plano
          if (profileData.plano === 'Premium') {
            tipoPlano = 'trial';
          } else if (profileData.plano === 'Essencial') {
            tipoPlano = 'trial';
          }
          
          console.log('Cálculo de dias restantes:', {
            trialStart: trialStart.toISOString(),
            trialEnd: trialEnd.toISOString(),
            hoje: hoje.toISOString(),
            diasCalculados: dias,
            plano: profileData.plano
          });
        }

        const diasRestantes = Math.max(0, dias);
        const isExpiringSoon = diasRestantes <= 3 && diasRestantes > 0;
        const isExpired = diasRestantes === 0 && tipoPlano !== 'sem_plano';

        setData({
          diasRestantes,
          tipoPlano,
          isExpiringSoon,
          isExpired
        });
      } catch (error) {
        console.error('Erro ao calcular dias restantes:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateDaysRemaining();
  }, [user?.id]);

  return { ...data, loading };
};
