
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

  // VALIDAÇÃO CORRIGIDA DO TRIAL DE 7 DIAS BASEADA NA trial_started_at
  const authUser = user as any;
  
  console.log('Validando acesso do usuário:', {
    userId: authUser.id,
    plano: authUser.plano,
    trial_started_at: authUser.trial_started_at
  });

  // Verificar se o plano é Premium e permitir acesso
  if (authUser.plano === 'Premium') {
    // Para plano Premium, verificar se ainda está no trial de 7 dias
    if (authUser.trial_started_at) {
      const trialStarted = new Date(authUser.trial_started_at);
      const now = new Date();
      const trialEnd = new Date(trialStarted.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      console.log('Verificação de trial Premium:', {
        trialStarted: trialStarted.toISOString(),
        trialEnd: trialEnd.toISOString(),
        now: now.toISOString(),
        isTrialActive: now <= trialEnd
      });
      
      if (now <= trialEnd) {
        console.log('Trial Premium ainda ativo, permitindo acesso');
        return <>{children}</>;
      } else {
        console.log('Trial Premium expirou, bloqueando acesso');
        return (
          <SubscriptionExpiredCard 
            hasSubscription={false}
            onLogout={handleLogout} 
          />
        );
      }
    } else {
      // Se não tem trial_started_at, é um erro - não deveria acontecer
      console.log('Plano Premium sem trial_started_at, bloqueando acesso');
      return (
        <SubscriptionExpiredCard 
          hasSubscription={false}
          onLogout={handleLogout} 
        />
      );
    }
  }

  // Para plano Essencial, verificar se ainda está no trial
  if (authUser.plano === 'Essencial') {
    if (authUser.trial_started_at) {
      const trialStarted = new Date(authUser.trial_started_at);
      const now = new Date();
      const trialEnd = new Date(trialStarted.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      console.log('Verificação de trial Essencial:', {
        trialStarted: trialStarted.toISOString(),
        trialEnd: trialEnd.toISOString(),
        now: now.toISOString(),
        isTrialActive: now <= trialEnd
      });
      
      if (now <= trialEnd) {
        console.log('Trial Essencial ainda ativo, permitindo acesso');
        return <>{children}</>;
      } else {
        console.log('Trial Essencial expirou, bloqueando acesso');
        return (
          <SubscriptionExpiredCard 
            hasSubscription={false}
            onLogout={handleLogout} 
          />
        );
      }
    } else {
      console.log('Plano Essencial sem trial_started_at, bloqueando acesso');
      return (
        <SubscriptionExpiredCard 
          hasSubscription={false}
          onLogout={handleLogout} 
        />
      );
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
