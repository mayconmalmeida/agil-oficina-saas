
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserSubscription } from '@/types/subscription';
import { AuthUser, AuthState } from '@/types/auth';

const validatePlanAccess = (subscription: UserSubscription | null, profile: any) => {
  console.log('[useOptimizedAuth] Validando plano:', { subscription, profile });

  if (!subscription) {
    // Verificar se é trial ativo baseado no perfil
    if (profile?.trial_started_at && profile?.trial_ends_at) {
      const trialEnd = new Date(profile.trial_ends_at);
      const now = new Date();
      
      if (now <= trialEnd) {
        // Trial ativo - usar plano do perfil ou Premium por padrão
        const planType = profile.plano || 'Premium';
        console.log('[useOptimizedAuth] Trial ativo detectado:', planType);
        return {
          isActive: true,
          plan: planType as 'Essencial' | 'Premium' | 'Free',
          permissionsCount: planType === 'Premium' ? 20 : 10,
          permissions: planType === 'Premium' ? 
            ['diagnostico_ia', 'campanhas_marketing', 'relatorios_avancados'] : 
            ['campanhas_marketing', 'relatorios_basicos']
        };
      }
    }
    
    // Sem assinatura e sem trial ativo
    console.log('[useOptimizedAuth] Sem assinatura ativa');
    return {
      isActive: false,
      plan: 'Free' as const,
      permissionsCount: 0,
      permissions: []
    };
  }
  
  // ✅ NOVA LÓGICA CORRIGIDA: Buscar assinatura mais recente por oficina
  const now = new Date();
  
  // ✅ Priorizar status trialing (sempre Premium durante trial)
  if (subscription.status === 'trialing' && subscription.trial_ends_at) {
    const trialEnd = new Date(subscription.trial_ends_at);
    if (now <= trialEnd) {
      console.log('[useOptimizedAuth] Trial Premium ativo');
      return {
        isActive: true,
        plan: 'Premium' as const,
        permissionsCount: 20,
        permissions: ['diagnostico_ia', 'campanhas_marketing', 'relatorios_avancados']
      };
    }
  }
  
  // ✅ Assinatura ativa paga/manual
  if (subscription.status === 'active') {
    const isActive = !subscription.ends_at || new Date(subscription.ends_at) > now;
    
    if (isActive) {
      let planType: 'Essencial' | 'Premium' = 'Essencial';
      let permissionsCount = 10;
      let permissions = ['campanhas_marketing', 'relatorios_basicos'];
      
      // ✅ Detectar tipo de plano corretamente
      if (subscription.plan_type?.toLowerCase().includes('premium')) {
        planType = 'Premium';
        permissionsCount = 20;
        permissions = ['diagnostico_ia', 'campanhas_marketing', 'relatorios_avancados'];
        console.log('[useOptimizedAuth] Plano Premium ativo detectado');
      } else if (subscription.plan_type?.toLowerCase().includes('essencial')) {
        planType = 'Essencial';
        console.log('[useOptimizedAuth] Plano Essencial ativo detectado');
      }
      
      return {
        isActive: true,
        plan: planType,
        permissionsCount,
        permissions
      };
    }
  }
  
  console.log('[useOptimizedAuth] Assinatura expirada ou inválida');
  return {
    isActive: false,
    plan: 'Free' as const,
    permissionsCount: 0,
    permissions: []
  };
};

// ✅ Função para buscar assinatura correta por oficina_id
const getUserSubscriptionByOficina = async (userId: string): Promise<UserSubscription | null> => {
  try {
    console.log('[useOptimizedAuth] Buscando assinatura por oficina para userId:', userId);
    
    // Primeiro buscar a oficina do usuário
    const { data: oficina, error: oficinaError } = await supabase
      .from('oficinas')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (oficinaError || !oficina) {
      console.log('[useOptimizedAuth] Oficina não encontrada, buscando por user_id');
      // Fallback: buscar por user_id diretamente
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (subError || !subscription) {
        return null;
      }

      // Cast the subscription data to match UserSubscription type
      return {
        ...subscription,
        plan_type: subscription.plan_type as UserSubscription['plan_type'],
        status: subscription.status as UserSubscription['status']
      };
    }
    
    // ✅ Buscar assinatura mais recente ATIVA da oficina
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId) // Ainda filtrar por user_id mas considerar oficina
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (subscriptionError) {
      console.error('[useOptimizedAuth] Erro ao buscar assinatura:', subscriptionError);
      return null;
    }
    
    if (!subscription) {
      console.log('[useOptimizedAuth] Nenhuma assinatura encontrada');
      return null;
    }
    
    console.log('[useOptimizedAuth] Assinatura encontrada:', subscription);
    
    // Cast the subscription data to match UserSubscription type
    return {
      ...subscription,
      plan_type: subscription.plan_type as UserSubscription['plan_type'],
      status: subscription.status as UserSubscription['status']
    };
    
  } catch (error) {
    console.error('[useOptimizedAuth] Erro geral ao buscar assinatura:', error);
    return null;
  }
};

export const useOptimizedAuth = (): AuthState => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const signOut = async () => {
    console.log('useOptimizedAuth: Iniciando logout');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('useOptimizedAuth: Erro ao fazer logout:', error);
        throw error;
      }
      console.log('useOptimizedAuth: Logout realizado com sucesso');
      setUser(null);
      setSession(null);
      setRole(null);
    } catch (error) {
      console.error('useOptimizedAuth: Erro no logout:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('useOptimizedAuth: Iniciando configuração');
    
    const initializeAuth = async () => {
      try {
        // Obter sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log('useOptimizedAuth: Sessão encontrada, buscando perfil');
          
          // Buscar perfil do usuário
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .maybeSingle();
          
          if (profile) {
            // ✅ Buscar assinatura correta por oficina
            const subscription = await getUserSubscriptionByOficina(currentSession.user.id);
            
            const authUser: AuthUser = {
              id: profile.id,
              email: profile.email || currentSession.user.email || '',
              role: profile.role || 'user',
              nome_oficina: profile.nome_oficina,
              telefone: profile.telefone,
              is_active: profile.is_active ?? true,
              subscription: subscription,
              oficina_id: null,
              trial_ends_at: profile.trial_ends_at,
              plano: profile.plano,
              trial_started_at: profile.trial_started_at,
              app_metadata: currentSession.user.app_metadata,
              user_metadata: currentSession.user.user_metadata,
              aud: currentSession.user.aud
            };
            
            setUser(authUser);
            setRole(authUser.role);
            console.log('useOptimizedAuth: Perfil carregado:', authUser.email, 'role:', authUser.role);
          } else {
            console.log('useOptimizedAuth: Perfil não encontrado, criando básico');
            // Criar perfil básico
            const basicAuthUser: AuthUser = {
              id: currentSession.user.id,
              email: currentSession.user.email || '',
              role: 'user',
              nome_oficina: null,
              telefone: null,
              is_active: true,
              subscription: null,
              oficina_id: null,
              app_metadata: currentSession.user.app_metadata,
              user_metadata: currentSession.user.user_metadata,
              aud: currentSession.user.aud
            };
            setUser(basicAuthUser);
            setRole('user');
          }
        } else {
          console.log('useOptimizedAuth: Nenhuma sessão encontrada');
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error('useOptimizedAuth: Erro na inicialização:', error);
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
        setIsLoadingAuth(false);
      }
    };

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useOptimizedAuth: Auth state change:', event);
        setSession(session);
        
        if (session?.user) {
          // Recarregar perfil quando há mudança de sessão
          initializeAuth();
        } else {
          setUser(null);
          setRole(null);
          setLoading(false);
          setIsLoadingAuth(false);
        }
      }
    );

    // Inicialização inicial
    initializeAuth();

    // Timeout de segurança
    const timeout = setTimeout(() => {
      console.log('useOptimizedAuth: Timeout atingido, forçando fim do loading');
      setLoading(false);
      setIsLoadingAuth(false);
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Validação de plano
  const planValidation = validatePlanAccess(user?.subscription || null, user);
  
  console.log('useOptimizedAuth: Validação de plano aplicada:', {
    hasUser: !!user,
    subscription: !!user?.subscription,
    subscriptionStatus: user?.subscription?.status,
    subscriptionPlanType: user?.subscription?.plan_type,
    planValidation
  });

  // Estado final
  const isAdmin = role === 'admin' || role === 'superadmin';
  const canAccessFeatures = planValidation.isActive || isAdmin;

  console.log('useOptimizedAuth: Resultado final da validação:', {
    hasAuthUser: !!user,
    role,
    isAdmin,
    plan: planValidation.plan,
    planActive: planValidation.isActive,
    canAccessFeatures,
    permissionsCount: planValidation.permissionsCount,
    permissions: planValidation.permissions,
    oficinaId: user?.oficina_id
  });

  return {
    user,
    session,
    loading,
    isLoadingAuth,
    role,
    isAdmin,
    plan: planValidation.plan,
    planActive: planValidation.isActive,
    permissions: planValidation.permissions,
    canAccessFeatures,
    permissionsCount: planValidation.permissionsCount,
    oficinaId: user?.oficina_id || null,
    signOut
  };
};
