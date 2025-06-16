
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useDaysRemaining } from '@/hooks/useDaysRemaining';
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
  const { shouldShowContent, isAdmin } = useAccessControl({ requiredPlan });
  const { diasRestantes, isPremiumTrial, isExpired } = useDaysRemaining();

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

  // LÓGICA SIMPLIFICADA DO TRIAL DE 7 DIAS COM ACESSO PREMIUM
  const authUser = user as any;
  
  console.log('SubscriptionGuard - Validando usuário:', {
    userId: authUser.id,
    email: authUser.email,
    plano: authUser.plano,
    trial_started_at: authUser.trial_started_at,
    role: authUser.role,
    diasRestantes,
    isPremiumTrial,
    requiredPlan
  });

  // Se é usuário comum (role = 'user'), verificar trial
  if (authUser.role === 'user' || !authUser.role) {
    // Se tem trial_started_at, calcular se ainda está dentro do período
    if (authUser.trial_started_at) {
      const trialStarted = new Date(authUser.trial_started_at);
      const now = new Date();
      const trialEnd = new Date(trialStarted.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      console.log('SubscriptionGuard - Verificação de trial:', {
        trialStarted: trialStarted.toISOString(),
        trialEnd: trialEnd.toISOString(),
        now: now.toISOString(),
        isTrialActive: now <= trialEnd,
        hoursRemaining: Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60)),
        requiredPlan,
        isPremiumTrial
      });
      
      // Se trial ainda está ativo
      if (now <= trialEnd) {
        // Durante o trial, usuário tem acesso PREMIUM
        // Se a funcionalidade requer premium e está em trial, permitir acesso
        if (requiredPlan === 'premium' && isPremiumTrial) {
          console.log('SubscriptionGuard - Trial ativo com acesso premium, permitindo acesso');
          return <>{children}</>;
        }
        
        // Se é essencial ou não tem requerimento específico, sempre permitir
        if (!requiredPlan || requiredPlan === 'essencial') {
          console.log('SubscriptionGuard - Trial ativo, permitindo acesso essencial');
          return <>{children}</>;
        }
        
        // Se chegou aqui, trial está ativo mas usuário não tem acesso à funcionalidade específica
        console.log('SubscriptionGuard - Trial ativo mas sem acesso à funcionalidade específica');
        return <>{children}</>;
      } else {
        console.log('SubscriptionGuard - Trial expirado, bloqueando acesso');
        return (
          <SubscriptionExpiredCard 
            hasSubscription={false}
            onLogout={handleLogout} 
          />
        );
      }
    } else {
      // Se não tem trial_started_at, é um usuário sem trial configurado
      console.log('SubscriptionGuard - Usuário sem trial_started_at, bloqueando acesso');
      return (
        <SubscriptionExpiredCard 
          hasSubscription={false}
          onLogout={handleLogout} 
        />
      );
    }
  }

  // Para outros tipos de usuário, permitir acesso por padrão
  console.log('SubscriptionGuard - Usuário especial, permitindo acesso');
  return <>{children}</>;
};

export default SubscriptionGuard;
