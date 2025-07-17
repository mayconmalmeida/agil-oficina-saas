
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
  const [creatingSubscription, setCreatingSubscription] = useState(false);

  const handleLogout = async () => {
    await signOut();
    window.location.replace('/login');
  };

  // Criar assinatura ativa para usuários sem assinatura
  const createActiveSubscription = async (userId: string) => {
    if (creatingSubscription) return null;
    
    setCreatingSubscription(true);
    console.log('SubscriptionGuard: Criando assinatura ativa para usuário sem assinatura:', userId);
    
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_type: 'premium_mensal',
          status: 'active',
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(), // 30 dias
          is_manual: true
        })
        .select()
        .single();

      if (error) {
        console.error('SubscriptionGuard: Erro ao criar assinatura:', error);
        return null;
      }

      console.log('SubscriptionGuard: Assinatura Premium criada com sucesso:', data);
      return data;
    } catch (error) {
      console.error('SubscriptionGuard: Erro ao criar assinatura:', error);
      return null;
    } finally {
      setCreatingSubscription(false);
    }
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
        
        // Se não encontrou assinatura ativa, criar uma premium
        if (!subscription) {
          console.log('SubscriptionGuard: Nenhuma assinatura encontrada, criando uma Premium...');
          const newSubscription = await createActiveSubscription(user.id);
          setActiveSubscription(newSubscription);
        } else {
          setActiveSubscription(subscription);
        }
      } catch (error) {
        console.error('SubscriptionGuard: Erro ao verificar assinatura:', error);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchActiveSubscription();
  }, [user?.id]);

  // Aguarda o carregamento da autenticação e assinatura
  if (isLoadingAuth || daysLoading || subscriptionLoading || creatingSubscription) {
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

  // Verificar se o plano está ativo
  if (!planActive && plan !== 'Premium') {
    console.log('SubscriptionGuard: Plano não está ativo:', { plan, planActive });
    
    // Permitir acesso básico mesmo sem plano ativo
    if (!requiredPlan && !requiredFeature) {
      console.log('SubscriptionGuard: Permitindo acesso básico');
      return <>{children}</>;
    }

    return (
      <SubscriptionExpiredCard 
        hasSubscription={!!activeSubscription}
        onLogout={handleLogout} 
      />
    );
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
