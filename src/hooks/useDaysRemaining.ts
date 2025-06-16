
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
        // Buscar dados da assinatura
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('ends_at, trial_ends_at, status, plan_type')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subscriptionError) {
          console.warn('Erro ao buscar assinatura:', subscriptionError);
        }

        // Buscar dados do perfil como fallback
        const { data: profileData } = await supabase
          .from('profiles')
          .select('trial_ends_at, plano')
          .eq('id', user.id)
          .single();

        const hoje = new Date();
        let dias = 0;
        let tipoPlano: DaysRemainingData['tipoPlano'] = 'sem_plano';

        // Determinar tipo de plano e dias restantes
        if (subscriptionData) {
          if (subscriptionData.status === 'trialing' && subscriptionData.trial_ends_at) {
            const trialEnd = new Date(subscriptionData.trial_ends_at);
            dias = Math.ceil((trialEnd.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            tipoPlano = 'trial';
          } else if (subscriptionData.status === 'active' && subscriptionData.ends_at) {
            const subscriptionEnd = new Date(subscriptionData.ends_at);
            dias = Math.ceil((subscriptionEnd.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            
            if (subscriptionData.plan_type?.includes('anual')) {
              tipoPlano = 'anual';
            } else if (subscriptionData.plan_type?.includes('mensal')) {
              tipoPlano = 'mensal';
            } else {
              tipoPlano = 'ativo';
            }
          }
        } else if (profileData?.trial_ends_at) {
          const trialEnd = new Date(profileData.trial_ends_at);
          if (trialEnd > hoje) {
            dias = Math.ceil((trialEnd.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            tipoPlano = 'trial';
          }
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
