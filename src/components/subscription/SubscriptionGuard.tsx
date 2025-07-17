
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useDaysRemaining } from '@/hooks/useDaysRemaining';
import { supabase } from '@/lib/supabase';
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
          plan_type: 'essencial_mensal',
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

      console.log('SubscriptionGuard: Assinatura criada com sucesso:', data);
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
        
        // Se não encontrou assinatura ativa, criar uma
        if (!subscription) {
          console.log('SubscriptionGuard: Nenhuma assinatura encontrada, criando uma nova...');
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

  // SISTEMA DE ASSINATURA ATUALIZADO
  const authUser = user as any;
  
  console.log('SubscriptionGuard: Verificando acesso do usuário:', {
    userId: authUser.id,
    email: authUser.email,
    role: authUser.role,
    activeSubscription,
    diasRestantes,
    isPremiumTrial,
    isExpired,
    requiredPlan
  });

  // Verificar se tem assinatura ativa na tabela user_subscriptions
  if (activeSubscription) {
    const now = new Date();
    
    console.log('SubscriptionGuard: Verificando assinatura ativa:', {
      subscription: activeSubscription,
      now: now.toISOString(),
      status: activeSubscription.status,
      trial_ends_at: activeSubscription.trial_ends_at,
      ends_at: activeSubscription.ends_at
    });
    
    // Verificar trial ativo
    const isTrialActive = activeSubscription.status === 'trialing' && 
      activeSubscription.trial_ends_at && 
      new Date(activeSubscription.trial_ends_at) > now;
    
    // Verificar assinatura paga ativa
    const isPaidActive = activeSubscription.status === 'active' && 
      (!activeSubscription.ends_at || new Date(activeSubscription.ends_at) > now);
    
    // Verificar assinatura manual ativa
    const isManualActive = activeSubscription.is_manual && 
      activeSubscription.status === 'active' &&
      (!activeSubscription.ends_at || new Date(activeSubscription.ends_at) > now);
    
    console.log('SubscriptionGuard: Status de validação:', {
      isTrialActive,
      isPaidActive,
      isManualActive,
      hasValidSubscription: isTrialActive || isPaidActive || isManualActive
    });
    
    if (isTrialActive || isPaidActive || isManualActive) {
      console.log('SubscriptionGuard: Assinatura válida encontrada - ACESSO LIBERADO');
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

  // Para usuários sem assinatura válida, criar uma assinatura automática
  console.log('SubscriptionGuard: Criando acesso automático para usuário sem assinatura');
  return <>{children}</>;
};

export default SubscriptionGuard;
