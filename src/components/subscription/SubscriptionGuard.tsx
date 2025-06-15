import React from 'react';
import { useAuth } from '@/hooks/useAuth';
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
    user,
    isLoadingAuth,
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

  // BLOQUEIO DE TRIAL PREMIUM
  const isTrialExpired =
    user.trial_ends_at &&
    new Date(user.trial_ends_at) < new Date() &&
    user.plano === "Premium";

  // Comportamento: se expired e não tem plano pago, bloqueia.
  if (isTrialExpired && !user.subscription) {
    window.location.replace('/plano-expirado');
    return null;
  }

  // Se não tem acesso geral às funcionalidades
  if (!hasGeneralAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <SubscriptionExpiredCard 
        hasSubscription={!!user.subscription} 
        onLogout={handleLogout} 
      />
    );
  }

  // Se tem acesso geral mas precisa de plano específico
  if (requiredPlan) {
    const isPremium = user.subscription?.plan_type?.includes('premium') || false;
    
    if (requiredPlan === 'premium' && !isPremium) {
      return <PremiumUpgradeCard onLogout={handleLogout} />;
    }
  }

  // Usuário tem acesso permitido
  return <>{children}</>;
};

export default SubscriptionGuard;
