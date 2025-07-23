
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthUser, AuthState } from '@/types/auth';

const getUserProfile = async (userId: string) => {
  try {
    console.log('[useOptimizedAuth] Buscando perfil para userId:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[useOptimizedAuth] Erro ao buscar perfil:', error);
      return null;
    }

    console.log('[useOptimizedAuth] Perfil encontrado:', data);
    return data;
  } catch (error) {
    console.error('[useOptimizedAuth] Exception ao buscar perfil:', error);
    return null;
  }
};

const getUserPlanStatus = async (userId: string) => {
  try {
    console.log('[useOptimizedAuth] Validando plano para userId:', userId);
    
    const now = new Date();

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('plan_type, status, trial_ends_at, stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[useOptimizedAuth] Erro ao buscar assinatura:', error);
      return { 
        plan: 'Free',
        planActive: false,
        expired: true,
        source: 'error'
      };
    }

    if (!data) {
      console.log('[useOptimizedAuth] Nenhuma assinatura encontrada para userId:', userId);
      return { 
        plan: 'Free',
        planActive: false,
        expired: true,
        source: 'none'
      };
    }

    const { plan_type, status, trial_ends_at, stripe_customer_id } = data;

    console.log('[useOptimizedAuth] Dados da assinatura:', {
      userId,
      plan_type,
      status,
      trial_ends_at,
      stripe_customer_id,
      now: now.toISOString()
    });

    // ✅ Regra 1: Se status = active → OK
    if (status === 'active') {
      console.log('[useOptimizedAuth] Status ativo encontrado para userId:', userId);
      
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
      console.log('[useOptimizedAuth] Trial válido até:', trial_ends_at, 'para userId:', userId);
      
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

    console.log('[useOptimizedAuth] Plano inativo/expirado para userId:', userId);
    return { 
      plan: 'Free',
      planActive: false,
      expired: true,
      source: 'expired'
    };
  } catch (err) {
    console.error('[useOptimizedAuth] Exception ao validar plano:', err);
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
    console.log('[useOptimizedAuth] Iniciando logout');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[useOptimizedAuth] Erro ao fazer logout:', error);
        throw error;
      }
      console.log('[useOptimizedAuth] Logout realizado com sucesso');
      setUser(null);
      setSession(null);
      setRole(null);
      setPlanData({ plan: 'Free', planActive: false, expired: true });
    } catch (error) {
      console.error('[useOptimizedAuth] Erro no logout:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('[useOptimizedAuth] Iniciando configuração única');
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const loadUserData = async (currentSession: Session) => {
      try {
        const userId = currentSession.user.id;
        const userEmail = currentSession.user.email || '';
        
        console.log('[useOptimizedAuth] Carregando dados para userId correto:', userId);
        
        // ✅ Buscar perfil para verificar se é admin
        const profile = await getUserProfile(userId);
        const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
        
        console.log('[useOptimizedAuth] Verificando admin:', { role: profile?.role, isAdmin, userId });

        // ✅ Se é admin, bypass da validação de plano
        if (isAdmin) {
          console.log('[useOptimizedAuth] Admin detectado, liberando acesso total para userId:', userId);
          
          if (mounted) {
            const authUser: AuthUser = {
              id: userId,
              email: userEmail,
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
            
            console.log('[useOptimizedAuth] Admin configurado com sucesso:', {
              userId,
              email: userEmail,
              role: authUser.role
            });
          }
          return;
        }

        // ✅ Para usuários comuns, validar plano
        const planStatus = await getUserPlanStatus(userId);
        
        console.log('[useOptimizedAuth] Status do plano para userId:', userId, planStatus);

        if (mounted) {
          setPlanData(planStatus);

          const authUser: AuthUser = {
            id: userId,
            email: userEmail,
            role: profile?.role || 'user',
            planActive: planStatus.planActive,
            expired: planStatus.expired,
            isAdmin: false
          };
          
          setUser(authUser);
          setRole(authUser.role);
          setLoading(false);
          setIsLoadingAuth(false);
          
          console.log('[useOptimizedAuth] Usuário carregado com sucesso:', {
            userId,
            email: userEmail,
            role: authUser.role,
            plan: planStatus.plan,
            planActive: planStatus.planActive,
            expired: planStatus.expired
          });
        }
      } catch (error) {
        console.error('[useOptimizedAuth] Erro ao carregar dados do usuário:', error);
        if (mounted) {
          const userId = currentSession.user.id;
          const userEmail = currentSession.user.email || '';
          
          const basicUser: AuthUser = {
            id: userId,
            email: userEmail,
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
        console.log('[useOptimizedAuth] Inicializando autenticação');
        
        // ✅ Buscar sessão atual PRIMEIRO
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(currentSession);
          
          if (currentSession?.user) {
            console.log('[useOptimizedAuth] Sessão inicial encontrada para userId:', currentSession.user.id);
            await loadUserData(currentSession);
          } else {
            console.log('[useOptimizedAuth] Nenhuma sessão inicial encontrada');
            setUser(null);
            setRole(null);
            setPlanData({ plan: 'Free', planActive: false, expired: true });
            setLoading(false);
            setIsLoadingAuth(false);
          }
        }
      } catch (error) {
        console.error('[useOptimizedAuth] Erro na inicialização:', error);
        if (mounted) {
          setUser(null);
          setRole(null);
          setPlanData({ plan: 'Free', planActive: false, expired: true });
          setLoading(false);
          setIsLoadingAuth(false);
        }
      }
    };

    // ✅ Configurar listener apenas UMA vez
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('[useOptimizedAuth] Auth state change:', event, 'userId:', session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          console.log('[useOptimizedAuth] Sessão detectada no auth state change para userId:', session.user.id);
          await loadUserData(session);
        } else {
          console.log('[useOptimizedAuth] Sessão removida');
          setUser(null);
          setRole(null);
          setPlanData({ plan: 'Free', planActive: false, expired: true });
          setLoading(false);
          setIsLoadingAuth(false);
        }
      }
    );

    // Inicializar
    initializeAuth();

    // Timeout de segurança
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('[useOptimizedAuth] Timeout atingido, forçando fim do loading');
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

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.isAdmin;
  const planValidation = validatePlanAccess(
    planData.plan, 
    planData.planActive, 
    isAdmin
  );
  
  const canAccessFeatures = planValidation.isActive || isAdmin;

  console.log('[useOptimizedAuth] Estado final:', {
    hasAuthUser: !!user,
    userEmail: user?.email,
    userId: user?.id,
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
