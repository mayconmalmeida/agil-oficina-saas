
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useDaysRemaining } from '@/hooks/useDaysRemaining';
import Loading from '@/components/ui/loading';
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
  const { shouldShowContent, isAdmin } = useAccessControl({ requiredPlan });
  const { diasRestantes, isPremiumTrial, isExpired, loading: daysLoading } = useDaysRemaining();

  const handleLogout = async () => {
    await signOut();
    window.location.replace('/login');
  };

  // Aguarda o carregamento da autenticação
  if (isLoadingAuth || daysLoading) {
    return <Loading fullscreen text="Verificando autenticação..." />;
  }

  // Se não há usuário autenticado
  if (!user) {
    return <Loading fullscreen text="Redirecionando..." />;
  }

  // Se é admin, sempre permitir acesso
  if (isAdmin) {
    console.log('SubscriptionGuard: Admin detectado, permitindo acesso total');
    return <>{children}</>;
  }

  // SISTEMA DE ASSINATURA
  const authUser = user as any;
  
  console.log('SubscriptionGuard: Verificando acesso do usuário:', {
    userId: authUser.id,
    email: authUser.email,
    role: authUser.role,
    diasRestantes,
    isPremiumTrial,
    isExpired,
    requiredPlan,
    subscription: authUser.subscription
  });

  // Verificar se tem assinatura ativa via user_subscriptions
  if (authUser.subscription) {
    const subscription = authUser.subscription;
    const now = new Date();
    
    console.log('SubscriptionGuard: Verificando assinatura:', {
      subscription,
      now: now.toISOString(),
      status: subscription.status,
      trial_ends_at: subscription.trial_ends_at,
      ends_at: subscription.ends_at
    });
    
    // Verificar trial ativo
    const isTrialActive = subscription.status === 'trialing' && 
      subscription.trial_ends_at && 
      new Date(subscription.trial_ends_at) > now;
    
    // Verificar assinatura paga ativa
    const isPaidActive = subscription.status === 'active' && 
      (!subscription.ends_at || new Date(subscription.ends_at) > now);
    
    // Verificar assinatura manual ativa
    const isManualActive = subscription.is_manual && 
      subscription.status === 'active' &&
      (!subscription.ends_at || new Date(subscription.ends_at) > now);
    
    console.log('SubscriptionGuard: Status de validação:', {
      isTrialActive,
      isPaidActive,
      isManualActive,
      hasValidSubscription: isTrialActive || isPaidActive || isManualActive
    });
    
    if (isTrialActive || isPaidActive || isManualActive) {
      console.log('SubscriptionGuard: Assinatura válida - ACESSO LIBERADO');
      return <>{children}</>;
    }
  }
  
  // Fallback: verificar trial_started_at para compatibilidade (sistema antigo)
  if ((authUser.role === 'user' || !authUser.role) && authUser.trial_started_at) {
    const trialStarted = new Date(authUser.trial_started_at);
    const now = new Date();
    const trialEnd = new Date(trialStarted.getTime() + (7 * 24 * 60 * 60 * 1000));
      
    console.log('SubscriptionGuard: Verificação detalhada do trial (sistema antigo):', {
      trialStarted: trialStarted.toISOString(),
      trialEnd: trialEnd.toISOString(),
      now: now.toISOString(),
      isTrialActive: now <= trialEnd,
      diasRestantes,
      isPremiumTrial
    });
      
    // Se trial ainda está ativo (dentro dos 7 dias)
    if (now <= trialEnd) {
      console.log('SubscriptionGuard: Trial ativo (sistema antigo) - ACESSO PREMIUM LIBERADO');
      
      // Durante o trial de 7 dias, o usuário tem acesso total premium
      if (requiredPlan === 'premium') {
        console.log('SubscriptionGuard: Funcionalidade premium solicitada - PERMITINDO (trial ativo)');
        return <>{children}</>;
      }
      
      // Para funcionalidades essenciais ou sem requerimento específico
      console.log('SubscriptionGuard: Acesso geral permitido (trial ativo)');
      return <>{children}</>;
    }
  }

  // Se chegou até aqui, não tem assinatura válida
  console.log('SubscriptionGuard: Usuário sem assinatura válida, bloqueando acesso');
  return (
    <SubscriptionExpiredCard 
      hasSubscription={!!authUser.subscription}
      onLogout={handleLogout} 
    />
  );
};

export default SubscriptionGuard;
