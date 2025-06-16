
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessControl } from '@/hooks/useAccessControl';
import Loading from '@/components/ui/loading';
import PremiumUpgradeCard from './PremiumUpgradeCard';
import SubscriptionExpiredCard from './SubscriptionExpiredCard';

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

  // VALIDAÇÃO DO TRIAL DE 7 DIAS
  const authUser = user as any;
  
  // Verificar se tem trial_ends_at definido
  if (authUser.trial_ends_at) {
    const trialEndDate = new Date(authUser.trial_ends_at);
    const now = new Date();
    const isTrialActive = trialEndDate > now;
    
    console.log('Trial info:', {
      trial_ends_at: authUser.trial_ends_at,
      trialEndDate,
      now,
      isTrialActive,
      subscription: authUser.subscription
    });
    
    // Se o trial ainda está ativo, permitir acesso
    if (isTrialActive) {
      return <>{children}</>;
    }
    
    // Se o trial expirou e não tem assinatura ativa, bloquear
    if (!isTrialActive && !authUser.subscription) {
      return (
        <SubscriptionExpiredCard 
          hasSubscription={false}
          onLogout={handleLogout} 
        />
      );
    }
  }

  // Verificar assinatura ativa
  if (authUser.subscription) {
    const subscription = authUser.subscription;
    const now = new Date();
    
    // Verificar se a assinatura está ativa
    const isSubscriptionActive = 
      subscription.status === 'active' && 
      (!subscription.ends_at || new Date(subscription.ends_at) > now);
    
    // Verificar se está em trial
    const isInTrial = 
      subscription.status === 'trialing' && 
      subscription.trial_ends_at && 
      new Date(subscription.trial_ends_at) > now;
    
    if (isSubscriptionActive || isInTrial) {
      // Se tem plano específico requerido, verificar
      if (requiredPlan === 'premium') {
        const isPremium = subscription.plan_type?.includes('premium') || false;
        if (!isPremium) {
          return <PremiumUpgradeCard onLogout={handleLogout} />;
        }
      }
      
      return <>{children}</>;
    }
  }

  // Se não tem acesso geral às funcionalidades
  if (!hasGeneralAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <SubscriptionExpiredCard 
        hasSubscription={!!authUser.subscription} 
        onLogout={handleLogout} 
      />
    );
  }

  // Usuário tem acesso permitido
  return <>{children}</>;
};

export default SubscriptionGuard;
