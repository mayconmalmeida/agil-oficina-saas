
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserSubscription } from '@/types/subscription';
import { AuthUser, AuthState } from '@/types/auth';

const validatePlanAccess = (plan: string, planActive: boolean, isAdmin: boolean) => {
  console.log('[useOptimizedAuth] Validando acesso ao plano:', { plan, planActive, isAdmin });

  if (isAdmin) {
    // Admin tem acesso total
    return {
      isActive: true,
      plan: 'Premium' as const,
      permissionsCount: 20,
      permissions: ['diagnostico_ia', 'campanhas_marketing', 'relatorios_avancados']
    };
  }

  if (!planActive) {
    // Plano expirado
    console.log('[useOptimizedAuth] Plano expirado ou inativo');
    return {
      isActive: false,
      plan: 'Free' as const,
      permissionsCount: 0,
      permissions: []
    };
  }

  // Plano ativo - definir permissões baseado no tipo
  if (plan === 'Premium') {
    return {
      isActive: true,
      plan: 'Premium' as const,
      permissionsCount: 20,
      permissions: ['diagnostico_ia', 'campanhas_marketing', 'relatorios_avancados']
    };
  } else if (plan === 'Essencial') {
    return {
      isActive: true,
      plan: 'Essencial' as const,
      permissionsCount: 10,
      permissions: ['campanhas_marketing', 'relatorios_basicos']
    };
  }

  // Fallback para Free
  return {
    isActive: false,
    plan: 'Free' as const,
    permissionsCount: 0,
    permissions: []
  };
};

// ✅ Função para buscar perfil para verificar se é admin
const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[getUserProfile] Erro ao buscar perfil:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('[getUserProfile] Exception:', error);
    return null;
  }
};

// ✅ Função para buscar plano do usuário exclusivamente na user_subscriptions
const getUserPlanStatus = async (userId: string) => {
  try {
    console.log('[getUserPlanStatus] Validando plano para usuário:', userId);
    
    const now = new Date();

    // Buscar assinatura do usuário
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('plan_type, status, trial_ends_at, stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[getUserPlanStatus] Erro ao buscar assinatura:', error);
      return { 
        plan: 'Free',
        planActive: false,
        expired: true,
        source: 'error'
      };
    }

    if (!data) {
      console.warn('[getUserPlanStatus] Nenhuma assinatura encontrada');
      return { 
        plan: 'Free',
        planActive: false,
        expired: true,
        source: 'none'
      };
    }

    const { plan_type, status, trial_ends_at, stripe_customer_id } = data;

    console.log('[getUserPlanStatus] Assinatura encontrada:', {
      plan_type,
      status,
      trial_ends_at,
      stripe_customer_id,
      now: now.toISOString()
    });

    // ✅ Regra 1: Se status = active e assinatura Stripe ativa → OK
    if (status === 'active' && stripe_customer_id) {
      console.log('[getUserPlanStatus] Assinatura Stripe ativa');
      
      let planType = 'Essencial';
      if (plan_type && plan_type.includes('premium')) {
        planType = 'Premium';
      }
      
      return {
        plan: planType,
        planActive: true,
        expired: false,
        source: 'stripe'
      };
    }

    // ✅ Regra 2: Se stripe_customer_id é NULL e trial_ends_at > hoje → OK
    if (status === 'active' && !stripe_customer_id) {
      if (trial_ends_at && new Date(trial_ends_at) > now) {
        console.log('[getUserPlanStatus] Trial manual ativo até:', trial_ends_at);
        
        let planType = 'Essencial';
        if (plan_type && plan_type.includes('premium')) {
          planType = 'Premium';
        }
        
        return {
          plan: planType,
          planActive: true,
          expired: false,
          source: 'manual'
        };
      } else {
        console.log('[getUserPlanStatus] Trial manual expirado');
      }
    }

    console.log('[getUserPlanStatus] Plano inativo');
    return { 
      plan: 'Free',
      planActive: false,
      expired: true,
      source: 'expired'
    };
  } catch (err) {
    console.error('[getUserPlanStatus] Exception:', err);
    return { 
      plan: 'Free',
      planActive: false,
      expired: true,
      source: 'error'
    };
  }
};

export const useOptimizedAuth = (): AuthState => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [planData, setPlanData] = useState<{
    plan: string;
    planActive: boolean;
    expired: boolean;
  }>({
    plan: 'Free',
    planActive: false,
    expired: true
  });

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
      setPlanData({ plan: 'Free', planActive: false, expired: true });
    } catch (error) {
      console.error('useOptimizedAuth: Erro no logout:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('useOptimizedAuth: Iniciando configuração');
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const loadUserData = async (currentSession: Session) => {
      try {
        console.log('useOptimizedAuth: Sessão encontrada, buscando dados para userId:', currentSession.user.id);
        
        // ✅ Buscar perfil para verificar se é admin
        const profile = await getUserProfile(currentSession.user.id);
        const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
        
        console.log('useOptimizedAuth: Verificando se é admin:', { 
          role: profile?.role, 
          isAdmin 
        });

        // ✅ Se é admin, bypass da validação de plano
        if (isAdmin) {
          console.log('useOptimizedAuth: Admin detectado, liberando acesso total');
          
          if (mounted) {
            const authUser: AuthUser = {
              id: currentSession.user.id,
              email: currentSession.user.email || '',
              role: profile?.role || 'admin',
              nome_oficina: null,
              telefone: null,
              is_active: true,
              subscription: null,
              oficina_id: null,
              app_metadata: currentSession.user.app_metadata,
              user_metadata: currentSession.user.user_metadata,
              aud: currentSession.user.aud,
              planActive: true,
              expired: false,
              isAdmin: true
            };
            
            setUser(authUser);
            setRole(authUser.role);
            setPlanData({ plan: 'Premium', planActive: true, expired: false });
          }
          return;
        }

        // ✅ Para usuários comuns, validar plano apenas na user_subscriptions
        const planStatus = await getUserPlanStatus(currentSession.user.id);
        
        console.log('useOptimizedAuth: Status do plano obtido:', planStatus);

        if (mounted) {
          setPlanData(planStatus);

          const authUser: AuthUser = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            role: profile?.role || 'user',
            nome_oficina: null,
            telefone: null,
            is_active: true,
            subscription: null,
            oficina_id: null,
            app_metadata: currentSession.user.app_metadata,
            user_metadata: currentSession.user.user_metadata,
            aud: currentSession.user.aud,
            planActive: planStatus.planActive,
            expired: planStatus.expired,
            isAdmin: false
          };
          
          setUser(authUser);
          setRole(authUser.role);
          
          console.log('useOptimizedAuth: Usuário carregado:', {
            email: authUser.email,
            role: authUser.role,
            isAdmin: false,
            plan: planStatus.plan,
            planActive: planStatus.planActive,
            expired: planStatus.expired
          });
        }
      } catch (error) {
        console.error('useOptimizedAuth: Erro ao carregar dados do usuário:', error);
        if (mounted) {
          // Criar usuário básico mesmo com erro
          const basicUser: AuthUser = {
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
            aud: currentSession.user.aud,
            planActive: false,
            expired: true,
            isAdmin: false
          };
          
          setUser(basicUser);
          setRole('user');
          setPlanData({ plan: 'Free', planActive: false, expired: true });
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsLoadingAuth(false);
        }
      }
    };

    const initializeAuth = async () => {
      try {
        console.log('useOptimizedAuth: Inicializando autenticação');
        
        // Obter sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) setSession(currentSession);
        
        if (currentSession?.user) {
          console.log('useOptimizedAuth: Sessão encontrada, carregando dados do usuário');
          await loadUserData(currentSession);
        } else {
          console.log('useOptimizedAuth: Nenhuma sessão encontrada');
          if (mounted) {
            setUser(null);
            setRole(null);
            setPlanData({ plan: 'Free', planActive: false, expired: true });
            setLoading(false);
            setIsLoadingAuth(false);
          }
        }
      } catch (error) {
        console.error('useOptimizedAuth: Erro na inicialização:', error);
        if (mounted) {
          setUser(null);
          setRole(null);
          setPlanData({ plan: 'Free', planActive: false, expired: true });
          setLoading(false);
          setIsLoadingAuth(false);
        }
      }
    };

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('useOptimizedAuth: Auth state change:', event);
        setSession(session);
        
        if (session?.user) {
          console.log('useOptimizedAuth: Sessão detectada no auth state change');
          await loadUserData(session);
        } else {
          console.log('useOptimizedAuth: Sessão removida no auth state change');
          setUser(null);
          setRole(null);
          setPlanData({ plan: 'Free', planActive: false, expired: true });
          setLoading(false);
          setIsLoadingAuth(false);
        }
      }
    );

    // Inicialização inicial
    initializeAuth();

    // Timeout de segurança
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('useOptimizedAuth: Timeout atingido, forçando fim do loading');
        setLoading(false);
        setIsLoadingAuth(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // Só aplicar validação de plano APÓS carregar os dados do usuário
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.isAdmin;
  const planValidation = validatePlanAccess(
    planData.plan, 
    planData.planActive, 
    isAdmin
  );
  
  console.log('useOptimizedAuth: Validação de plano aplicada:', {
    hasUser: !!user,
    userRole: user?.role,
    isAdmin,
    plan: planData.plan,
    planActive: planData.planActive,
    expired: planData.expired,
    planValidation
  });

  // Estado final
  const canAccessFeatures = planValidation.isActive || isAdmin;

  console.log('useOptimizedAuth: Resultado final da validação:', {
    hasAuthUser: !!user,
    userEmail: user?.email,
    role,
    isAdmin,
    plan: planValidation.plan,
    planActive: planValidation.isActive,
    expired: planData.expired,
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
