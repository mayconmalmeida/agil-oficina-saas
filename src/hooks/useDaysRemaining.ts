
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface DaysRemainingData {
  diasRestantes: number;
  tipoPlano: 'trial' | 'mensal' | 'anual' | 'ativo' | 'sem_plano';
  isExpiringSoon: boolean;
  isExpired: boolean;
  isPremiumTrial: boolean; // Nova propriedade para indicar se está em trial premium
}

export const useDaysRemaining = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DaysRemainingData>({
    diasRestantes: 0,
    tipoPlano: 'sem_plano',
    isExpiringSoon: false,
    isExpired: false,
    isPremiumTrial: false
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
          .select('trial_started_at, plano, role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('useDaysRemaining - Erro ao buscar perfil:', error);
          setLoading(false);
          return;
        }

        console.log('useDaysRemaining - Dados do perfil:', profileData);

        const hoje = new Date();
        let dias = 0;
        let tipoPlano: DaysRemainingData['tipoPlano'] = 'sem_plano';
        let isPremiumTrial = false;

        // Admin não precisa de validação de trial
        if (profileData?.role === 'admin' || profileData?.role === 'superadmin') {
          setData({
            diasRestantes: 999,
            tipoPlano: 'ativo',
            isExpiringSoon: false,
            isExpired: false,
            isPremiumTrial: false
          });
          setLoading(false);
          return;
        }

        // Calcular dias restantes baseado na trial_started_at
        if (profileData?.trial_started_at) {
          const trialStart = new Date(profileData.trial_started_at);
          const trialEnd = new Date(trialStart.getTime() + (7 * 24 * 60 * 60 * 1000));
          
          // Calcular dias restantes (arredondar para cima para ser generoso)
          const diffTime = trialEnd.getTime() - hoje.getTime();
          dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Se ainda tem dias restantes, é trial ativo COM PLANO PREMIUM
          if (dias > 0) {
            tipoPlano = 'trial';
            isPremiumTrial = true; // Durante o trial, usuário tem acesso premium
          }
          
          console.log('useDaysRemaining - Cálculo de dias restantes:', {
            trialStart: trialStart.toISOString(),
            trialEnd: trialEnd.toISOString(),
            hoje: hoje.toISOString(),
            diasCalculados: dias,
            plano: profileData.plano,
            diffTime: diffTime,
            hoursRemaining: Math.ceil(diffTime / (1000 * 60 * 60)),
            isPremiumTrial
          });
        }

        const diasRestantes = Math.max(0, dias);
        const isExpiringSoon = diasRestantes <= 3 && diasRestantes > 0;
        const isExpired = diasRestantes === 0 && Boolean(profileData?.trial_started_at);

        setData({
          diasRestantes,
          tipoPlano,
          isExpiringSoon,
          isExpired,
          isPremiumTrial
        });
      } catch (error) {
        console.error('useDaysRemaining - Erro ao calcular dias restantes:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateDaysRemaining();
  }, [user?.id]);

  return { ...data, loading };
};
