
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useDaysRemaining } from '@/hooks/useDaysRemaining';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/lib/supabase';
import Loading from '@/components/ui/loading';
import SubscriptionExpiredCard from './SubscriptionExpiredCard';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan?: 'essencial' | 'premium';
  requiredFeature?: string;
  fallback?: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  requiredPlan,
  requiredFeature,
  fallback 
}) => {
  const { user, isLoadingAuth, signOut, plan, planActive } = useAuth();
  const { shouldShowContent, isAdmin } = useAccessControl({ requiredPlan });
  const { hasPermission, canAccessPremiumFeatures } = usePermissions();
  const { diasRestantes, isPremiumTrial, isExpired, loading: daysLoading } = useDaysRemaining();
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const handleLogout = async () => {
    await signOut();
    window.location.replace('/login');
  };

  // Buscar assinatura ativa do usuário
  useEffect(() => {
    const fetchActiveSubscription = async () => {
      if (!user?.id) {
        setSubscriptionLoading(false);
        return;
      }

      try {
        console.log('SubscriptionGuard: Buscando assinatura ativa para usuário:', user.id);
        
        const { data: subscription, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('SubscriptionGuard: Erro ao buscar assinatura:', error);
        }

        console.log('SubscriptionGuard: Assinatura encontrada:', subscription);
        setActiveSubscription(subscription);
      } catch (error) {
        console.error('SubscriptionGuard: Erro ao verificar assinatura:', error);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchActiveSubscription();
  }, [user?.id]);

  // Aguarda o carregamento da autenticação e assinatura
  if (isLoadingAuth || daysLoading || subscriptionLoading) {
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

  // Verificação específica de feature se foi especificada
  if (requiredFeature && !hasPermission(requiredFeature)) {
    console.log('SubscriptionGuard: Usuário não tem permissão para feature:', requiredFeature);
    return fallback || (
      <SubscriptionExpiredCard 
        hasSubscription={!!activeSubscription}
        onLogout={handleLogout} 
      />
    );
  }

  // Verificação específica de plano se foi especificada
  if (requiredPlan === 'premium' && !canAccessPremiumFeatures()) {
    console.log('SubscriptionGuard: Usuário não tem acesso premium');
    return fallback || (
      <SubscriptionExpiredCard 
        hasSubscription={!!activeSubscription}
        onLogout={handleLogout} 
      />
    );
  }

  // Verificar se o plano está ativo (nova lógica)
  if (!planActive) {
    console.log('SubscriptionGuard: Plano não está ativo:', { plan, planActive });
    
    // Se não requer um plano específico e não tem feature específica, bloquear acesso
    if (requiredPlan || requiredFeature) {
      return (
        <SubscriptionExpiredCard 
          hasSubscription={!!activeSubscription}
          onLogout={handleLogout} 
        />
      );
    }
  }

  console.log('SubscriptionGuard: Acesso liberado para usuário com plano ativo:', {
    plan,
    planActive,
    requiredPlan,
    requiredFeature
  });

  return <>{children}</>;
};

export default SubscriptionGuard;
