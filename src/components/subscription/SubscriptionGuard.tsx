
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Aguarda o carregamento da autenticação
  if (isLoadingAuth) {
    return <Loading fullscreen text="Verificando assinatura..." />;
  }

  // Se o usuário não está logado, redirecionar para login (sem usar navigate em loop)
  if (!user) {
    // Usar replace para evitar loops de navegação
    window.location.replace('/login');
    return null;
  }

  // Se o usuário é admin, permitir acesso
  if (user.isAdmin) {
    return <>{children}</>;
  }

  // Se o usuário tem acesso geral às funcionalidades
  if (user.canAccessFeatures) {
    // Se não há requisito específico de plano, permitir acesso
    if (!requiredPlan) {
      return <>{children}</>;
    }
    
    // Se há requisito específico, verificar se o usuário tem o plano adequado
    const isPremium = user.subscription?.plan_type?.includes('premium');
    
    if (requiredPlan === 'premium' && !isPremium) {
      return <PremiumUpgradeCard onLogout={handleLogout} />;
    }
    
    return <>{children}</>;
  }

  // Se não tem acesso, mostrar tela de bloqueio
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <SubscriptionExpiredCard 
      hasSubscription={!!user.subscription} 
      onLogout={handleLogout} 
    />
  );
};

export default SubscriptionGuard;
