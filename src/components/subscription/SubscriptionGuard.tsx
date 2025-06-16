
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

  // VALIDAÇÃO DO TRIAL DE 7 DIAS BASEADA NA DATA DE CRIAÇÃO DA OFICINA
  const authUser = user as any;
  
  console.log('Validando acesso do usuário:', {
    userId: authUser.id,
    createdAt: authUser.created_at,
    subscription: authUser.subscription,
    trial_ends_at: authUser.trial_ends_at
  });

  // Calcular se está dentro dos 7 dias grátis baseado na data de criação
  const userCreatedAt = new Date(authUser.created_at);
  const now = new Date();
  const sevenDaysAfterCreation = new Date(userCreatedAt.getTime() + (7 * 24 * 60 * 60 * 1000));
  const isWithinFreeTrialPeriod = now <= sevenDaysAfterCreation;
  
  console.log('Validação de trial gratuito:', {
    userCreatedAt,
    now,
    sevenDaysAfterCreation,
    isWithinFreeTrialPeriod,
    daysSinceCreation: Math.floor((now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24))
  });

  // Se está dentro do período de 7 dias grátis, permitir acesso
  if (isWithinFreeTrialPeriod) {
    console.log('Usuário dentro do período de 7 dias grátis, permitindo acesso');
    return <>{children}</>;
  }

  // Verificar se tem trial_ends_at definido (sistema antigo)
  if (authUser.trial_ends_at) {
    const trialEndDate = new Date(authUser.trial_ends_at);
    const isTrialActive = trialEndDate > now;
    
    console.log('Trial info (sistema antigo):', {
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

  // Se passou dos 7 dias grátis e não tem assinatura ativa, bloquear acesso
  console.log('Bloqueando acesso: passou dos 7 dias grátis e não tem assinatura ativa');
  return (
    <SubscriptionExpiredCard 
      hasSubscription={!!authUser.subscription} 
      onLogout={handleLogout} 
    />
  );
};

export default SubscriptionGuard;
