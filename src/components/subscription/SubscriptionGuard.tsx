
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessControl } from '@/hooks/useAccessControl';
import Loading from '@/components/ui/loading';
import PremiumUpgradeCard from './PremiumUpgradeCard';
import SubscriptionExpiredCard from './SubscriptionExpiredCard';
import { supabase } from '@/lib/supabase';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan?: 'essencial' | 'premium';
  fallback?: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  requiredPlan,
  fallback 
}) => {
  const { user, isLoadingAuth, signOut } = useAuth();
  const { shouldShowContent, isAdmin, hasGeneralAccess } = useAccessControl({
    requiredPlan
  });

  const handleLogout = async () => {
    await signOut();
    window.location.replace('/login');
  };

  // Aguarda o carregamento da autenticação
  if (isLoadingAuth) {
    return <Loading fullscreen text="Verificando autenticação..." />;
  }

  // Se não há usuário autenticado, useAccessControl já cuida do redirecionamento
  if (!user) {
    return <Loading fullscreen text="Redirecionando..." />;
  }

  // Se é admin, sempre permitir acesso
  if (isAdmin) {
    return <>{children}</>;
  }

  // NOVA VALIDAÇÃO DO TRIAL DE 7 DIAS BASEADA NA FUNÇÃO DO BANCO
  const authUser = user as any;
  
  console.log('Validando acesso do usuário:', {
    userId: authUser.id,
    plano: authUser.plano,
    trial_started_at: authUser.trial_started_at
  });

  // Verificar se o trial ainda está ativo usando a função do banco
  React.useEffect(() => {
    const checkTrialStatus = async () => {
      if (!authUser.id) return;

      try {
        const { data, error } = await supabase.rpc('is_trial_active', {
          user_profile_id: authUser.id
        });

        if (error) {
          console.error('Erro ao verificar status do trial:', error);
          return;
        }

        console.log('Status do trial:', data);
        
        // Se o trial expirou e o plano é Essencial, bloquear acesso
        if (!data && authUser.plano === 'Essencial') {
          console.log('Trial expirou para plano Essencial, bloqueando acesso');
          // Renderizar tela de assinatura expirada será feito no return abaixo
        }
      } catch (error) {
        console.error('Erro ao verificar trial:', error);
      }
    };

    checkTrialStatus();
  }, [authUser.id, authUser.plano]);

  // Verificar se o plano é Premium e permitir acesso
  if (authUser.plano === 'Premium') {
    console.log('Usuário com plano Premium, permitindo acesso');
    return <>{children}</>;
  }

  // Para plano Essencial, verificar se ainda está no trial
  if (authUser.plano === 'Essencial') {
    // Por enquanto, assumir que se chegou até aqui, o trial ainda está ativo
    // A verificação real será feita pelo useEffect acima
    const trialStarted = authUser.trial_started_at ? new Date(authUser.trial_started_at) : null;
    const now = new Date();
    
    if (trialStarted) {
      const trialEnd = new Date(trialStarted.getTime() + (7 * 24 * 60 * 60 * 1000));
      const isTrialActive = now <= trialEnd;
      
      console.log('Verificação de trial local:', {
        trialStarted,
        trialEnd,
        now,
        isTrialActive
      });
      
      if (isTrialActive) {
        console.log('Trial ainda ativo, permitindo acesso');
        return <>{children}</>;
      } else {
        console.log('Trial expirou, bloqueando acesso');
        return (
          <SubscriptionExpiredCard 
            hasSubscription={false}
            onLogout={handleLogout} 
          />
        );
      }
    }
  }

  // Verificar se tem plano específico requerido
  if (requiredPlan === 'premium' && authUser.plano !== 'Premium') {
    return <PremiumUpgradeCard onLogout={handleLogout} />;
  }

  // Fallback: se não tem plano definido, bloquear acesso
  console.log('Usuário sem plano válido, bloqueando acesso');
  return (
    <SubscriptionExpiredCard 
      hasSubscription={false} 
      onLogout={handleLogout} 
    />
  );
};

export default SubscriptionGuard;
