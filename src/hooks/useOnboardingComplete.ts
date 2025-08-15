
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useOnboardingComplete = () => {
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkOnboardingStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('onboarding_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Erro ao verificar onboarding:', error);
          setIsComplete(false);
        } else {
          // Verifica se todas as etapas estão completas
          const allComplete = data?.profile_created && 
                             data?.client_created && 
                             data?.service_created && 
                             data?.budget_created;
          setIsComplete(allComplete);
        }
      } catch (error) {
        console.error('Erro inesperado:', error);
        setIsComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  return { isComplete, loading };
};
