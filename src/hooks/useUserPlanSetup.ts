
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useUserPlanSetup = () => {
  const { user } = useAuth();

  useEffect(() => {
    const setupUserPlan = async () => {
      if (!user?.id) return;

      try {
        console.log('Verificando configuração do plano para usuário:', user.id);
        
        // Verificar se o usuário já tem um plano configurado
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plano, trial_started_at')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
          return;
        }

        // Se não tem plano ou trial_started_at, configurar plano Essencial com trial
        if (!profile.plano || !profile.trial_started_at) {
          console.log('Configurando plano Essencial para novo usuário');
          
          const { error: updateError } = await supabase.rpc('update_user_plan', {
            user_profile_id: user.id,
            new_plan: 'Essencial'
          });

          if (updateError) {
            console.error('Erro ao configurar plano:', updateError);
          } else {
            console.log('Plano Essencial configurado com sucesso');
          }
        }
      } catch (error) {
        console.error('Erro ao configurar plano do usuário:', error);
      }
    };

    setupUserPlan();
  }, [user?.id]);
};
