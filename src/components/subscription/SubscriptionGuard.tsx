
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

  // SISTEMA DE TRIAL PREMIUM DE 7 DIAS
  const authUser = user as any;
  
  console.log('SubscriptionGuard: Verificando acesso do usuário:', {
    userId: authUser.id,
    email: authUser.email,
    role: authUser.role,
    diasRestantes,
    isPremiumTrial,
    isExpired,
    requiredPlan,
    trial_started_at: authUser.trial_started_at
  });

  // Se é usuário comum
  if (authUser.role === 'user' || !authUser.role) {
    // Verificar se tem trial_started_at
    if (authUser.trial_started_at) {
      const trialStarted = new Date(authUser.trial_started_at);
      const now = new Date();
      const trialEnd = new Date(trialStarted.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      console.log('SubscriptionGuard: Verificação detalhada do trial:', {
        trialStarted: trialStarted.toISOString(),
        trialEnd: trialEnd.toISOString(),
        now: now.toISOString(),
        isTrialActive: now <= trialEnd,
        diasRestantes,
        isPremiumTrial
      });
      
      // Se trial ainda está ativo (dentro dos 7 dias)
      if (now <= trialEnd && diasRestantes > 0) {
        console.log('SubscriptionGuard: Trial ativo - ACESSO PREMIUM LIBERADO');
        
        // Durante o trial de 7 dias, o usuário tem acesso total premium
        if (requiredPlan === 'premium') {
          console.log('SubscriptionGuard: Funcionalidade premium solicitada - PERMITINDO (trial ativo)');
          return <>{children}</>;
        }
        
        // Para funcionalidades essenciais ou sem requerimento específico
        console.log('SubscriptionGuard: Acesso geral permitido (trial ativo)');
        return <>{children}</>;
      } else {
        console.log('SubscriptionGuard: Trial expirado, bloqueando acesso');
        return (
          <SubscriptionExpiredCard 
            hasSubscription={false}
            onLogout={handleLogout} 
          />
        );
      }
    } else {
      // Se não tem trial_started_at, bloquear
      console.log('SubscriptionGuard: Usuário sem trial configurado, bloqueando acesso');
      return (
        <SubscriptionExpiredCard 
          hasSubscription={false}
          onLogout={handleLogout} 
        />
      );
    }
  }

  // Para outros tipos de usuário, permitir acesso
  console.log('SubscriptionGuard: Usuário especial, permitindo acesso');
  return <>{children}</>;
};

export default SubscriptionGuard;
