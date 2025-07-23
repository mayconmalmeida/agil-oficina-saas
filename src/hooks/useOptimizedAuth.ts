
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthUser, AuthState } from '@/types/auth';

// ✅ Função para buscar perfil para verificar se é admin
const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, email')
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

// ✅ Função para validar plano EXCLUSIVAMENTE na user_subscriptions
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

    console.log('[getUserPlanStatus] Dados da assinatura:', {
      plan_type,
      status,
      trial_ends_at,
      stripe_customer_id,
      now: now.toISOString()
    });

    // ✅ Regra 1: Se status = active → OK
    if (status === 'active') {
      console.log('[getUserPlanStatus] Status ativo encontrado');
      
      let planType = 'Essencial';
      if (plan_type && plan_type.includes('premium')) {
        planType = 'Premium';
      }
      
      return {
        plan: planType,
        planActive: true,
        expired: false,
        source: 'active'
      };
    }

    // ✅ Regra 2: Se trial_ends_at > agora → OK
    if (trial_ends_at && new Date(trial_ends_at) > now) {
      console.log('[getUserPlanStatus] Trial válido até:', trial_ends_at);
      
      let planType = 'Essencial';
      if (plan_type && plan_type.includes('premium')) {
        planType = 'Premium';
      }
      
      return {
        plan: planType,
        planActive: true,
        expired: false,
        source: 'trial'
      };
    }

    console.log('[getUserPlanStatus] Plano inativo/expirado');
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

const validatePlanAccess = (plan: string, planActive: boolean, isAdmin: boolean) => {
  console.log('[validatePlanAccess] Validando acesso:', { plan, planActive, isAdmin });

  if (isAdmin) {
    return {
      isActive: true,
      plan: 'Premium' as const,
      permissionsCount: 20,
      permissions: ['diagnostico_ia', 'campanhas_marketing', 'relatorios_avancados']
    };
  }

  if (!planActive) {
    return {
      isActive: false,
      plan: 'Free' as const,
      permissionsCount: 0,
      permissions: []
    };
  }

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

  return {
    isActive: false,
    plan: 'Free' as const,
    permissionsCount: 0,
    permissions: []
  };
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
        console.log('useOptimizedAuth: Carregando dados para userId:', currentSession.user.id);
        
        // ✅ Buscar perfil para verificar se é admin
        const profile = await getUserProfile(currentSession.user.id);
        const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
        
        console.log('useOptimizedAuth: Verificando admin:', { role: profile?.role, isAdmin });

        // ✅ Se é admin, bypass da validação de plano
        if (isAdmin) {
          console.log('useOptimizedAuth: Admin detectado, liberando acesso total');
          
          if (mounted) {
            const authUser: AuthUser = {
              id: currentSession.user.id,
              email: currentSession.user.email || '',
              role: profile?.role || 'admin',
              planActive: true,
              expired: false,
              isAdmin: true
            };
            
            setUser(authUser);
            setRole(authUser.role);
            setPlanData({ plan: 'Premium', planActive: true, expired: false });
            setLoading(false);
            setIsLoadingAuth(false);
          }
          return;
        }

        // ✅ Para usuários comuns, validar plano EXCLUSIVAMENTE na user_subscriptions
        const planStatus = await getUserPlanStatus(currentSession.user.id);
        
        console.log('useOptimizedAuth: Status do plano:', planStatus);

        if (mounted) {
          setPlanData(planStatus);

          const authUser: AuthUser = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            role: profile?.role || 'user',
            planActive: planStatus.planActive,
            expired: planStatus.expired,
            isAdmin: false
          };
          
          setUser(authUser);
          setRole(authUser.role);
          setLoading(false);
          setIsLoadingAuth(false);
          
          console.log('useOptimizedAuth: Usuário carregado:', {
            email: authUser.email,
            role: authUser.role,
            plan: planStatus.plan,
            planActive: planStatus.planActive,
            expired: planStatus.expired
          });
        }
      } catch (error) {
        console.error('useOptimizedAuth: Erro ao carregar dados:', error);
        if (mounted) {
          const basicUser: AuthUser = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            role: 'user',
            planActive: false,
            expired: true,
            isAdmin: false
          };
          
          setUser(basicUser);
          setRole('user');
          setPlanData({ plan: 'Free', planActive: false, expired: true });
          setLoading(false);
          setIsLoadingAuth(false);
        }
      }
    };

    const initializeAuth = async () => {
      try {
        console.log('useOptimizedAuth: Inicializando autenticação');
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) setSession(currentSession);
        
        if (currentSession?.user) {
          console.log('useOptimizedAuth: Sessão encontrada');
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('useOptimizedAuth: Auth state change:', event);
        setSession(session);
        
        if (session?.user) {
          console.log('useOptimizedAuth: Sessão detectada no auth state change');
          await loadUserData(session);
        } else {
          console.log('useOptimizedAuth: Sessão removida');
          setUser(null);
          setRole(null);
          setPlanData({ plan: 'Free', planActive: false, expired: true });
          setLoading(false);
          setIsLoadingAuth(false);
        }
      }
    );

    initializeAuth();

    // Timeout de segurança reduzido
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('useOptimizedAuth: Timeout atingido, forçando fim do loading');
        setLoading(false);
        setIsLoadingAuth(false);
      }
    }, 2000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.isAdmin;
  const planValidation = validatePlanAccess(
    planData.plan, 
    planData.planActive, 
    isAdmin
  );
  
  const canAccessFeatures = planValidation.isActive || isAdmin;

  console.log('useOptimizedAuth: Estado final:', {
    hasAuthUser: !!user,
    userEmail: user?.email,
    role,
    isAdmin,
    plan: planValidation.plan,
    planActive: planValidation.isActive,
    expired: planData.expired,
    canAccessFeatures,
    loading,
    isLoadingAuth
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
