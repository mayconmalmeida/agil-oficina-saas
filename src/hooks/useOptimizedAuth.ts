import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserSubscription } from '@/types/subscription';
import { AuthUser, AuthState } from '@/types/auth';

// ✅ Função corrigida que valida user_subscriptions com lógica adequada
const getUserPlanStatus = async (userId: string) => {
  try {
    console.log('[getUserPlanStatus] Validando plano para usuário:', userId);
    
    const hoje = new Date();
    
    // 1. PRIORIDADE: Buscar assinatura ativa em user_subscriptions
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subError && subscription) {
      console.log('[getUserPlanStatus] Assinatura encontrada:', subscription);
      
      const sub = subscription;
      const now = new Date();
      const trialEnd = sub.trial_ends_at ? new Date(sub.trial_ends_at) : null;
      const endDate = sub.ends_at ? new Date(sub.ends_at) : null;

      let planActive = false;
      let expired = false;

      // Validar se o plano está ativo baseado em trial_ends_at ou ends_at
      if (trialEnd && now <= trialEnd) {
        planActive = true;
      } else if (endDate && now <= endDate) {
        planActive = true;
      } else {
        expired = true;
      }

      // Determinar o tipo de plano baseado no plan_type
      let planType = 'Free';
      if (sub.plan_type && sub.plan_type.includes('premium')) {
        planType = 'Premium';
      } else if (sub.plan_type && sub.plan_type.includes('essencial')) {
        planType = 'Essencial';
      }
      
      console.log('[getUserPlanStatus] Resultado da assinatura:', {
        planType,
        planActive,
        expired,
        trialEnd: trialEnd?.toISOString(),
        endDate: endDate?.toISOString(),
        hoje: hoje.toISOString(),
        source: 'user_subscriptions'
      });
      
      return {
        plan: planType,
        planActive,
        expired,
        source: 'user_subscriptions'
      };
    }

    console.log('[getUserPlanStatus] Nenhuma assinatura ativa encontrada, verificando oficinas...');

    // 2. FALLBACK: Buscar dados na tabela oficinas
    const { data: oficina, error: oficinaError } = await supabase
      .from('oficinas')
      .select('plano, trial_ends_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (!oficinaError && oficina && oficina.trial_ends_at) {
      const expiracao = new Date(oficina.trial_ends_at);
      const planActive = expiracao >= hoje;
      
      console.log('[getUserPlanStatus] Resultado da oficina:', {
        plano: oficina.plano,
        planActive,
        expired: !planActive,
        dataExpiracao: expiracao.toISOString(),
        hoje: hoje.toISOString(),
        source: 'oficinas'
      });
      
      return {
        plan: oficina.plano || 'Free',
        planActive,
        expired: !planActive,
        source: 'oficinas'
      };
    }

    console.log('[getUserPlanStatus] Nenhum plano encontrado');
    
    // 3. SEM PLANO
    return {
      plan: 'Free',
      planActive: false,
      expired: true,
      source: 'none'
    };
    
  } catch (error) {
    console.error('[getUserPlanStatus] Erro inesperado:', error);
    return {
      plan: 'Free',
      planActive: false,
      expired: true,
      source: 'error'
    };
  }
};

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
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const initializeAuth = async () => {
      try {
        // Obter sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) setSession(currentSession);
        
        if (currentSession?.user) {
          console.log('useOptimizedAuth: Sessão encontrada, buscando perfil');
          
          // Buscar perfil do usuário
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .maybeSingle();
          
          if (profile && mounted) {
            // ✅ Buscar oficina_id do usuário
            let oficinaId: string | null = null;
            
            try {
              const { data: oficina } = await supabase
                .from('oficinas')
                .select('id')
                .eq('user_id', currentSession.user.id)
                .maybeSingle();
              
              oficinaId = oficina?.id || null;
              console.log('useOptimizedAuth: Oficina ID encontrada:', oficinaId);
            } catch (oficinaError) {
              console.warn('useOptimizedAuth: Erro ao buscar oficina_id:', oficinaError);
            }

            // ✅ Buscar plano usando nova lógica corrigida
            const planData = await getUserPlanStatus(currentSession.user.id);

            const isAdmin = profile.role === 'admin' || profile.role === 'superadmin';
            
            const authUser: AuthUser = {
              id: profile.id,
              email: profile.email || currentSession.user.email || '',
              role: profile.role || 'user',
              nome_oficina: profile.nome_oficina,
              telefone: profile.telefone,
              is_active: profile.is_active ?? true,
              subscription: null, // Não usamos mais subscription
              oficina_id: oficinaId,
              trial_ends_at: profile.trial_ends_at,
              plano: planData.plan,
              trial_started_at: profile.trial_started_at,
              app_metadata: currentSession.user.app_metadata,
              user_metadata: currentSession.user.user_metadata,
              aud: currentSession.user.aud,
              planActive: planData.planActive,
              expired: planData.expired
            };
            
            setUser(authUser);
            setRole(authUser.role);
            console.log('useOptimizedAuth: Perfil carregado:', {
              email: authUser.email,
              role: authUser.role,
              plan: planData.plan,
              planActive: planData.planActive,
              expired: planData.expired,
              source: planData.source
            });
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
              aud: currentSession.user.aud,
              planActive: false,
              expired: true
            };
            if (mounted) {
              setUser(basicAuthUser);
              setRole('user');
            }
          }
        } else {
          console.log('useOptimizedAuth: Nenhuma sessão encontrada');
          if (mounted) {
            setUser(null);
            setRole(null);
          }
        }
      } catch (error) {
        console.error('useOptimizedAuth: Erro na inicialização:', error);
        if (mounted) {
          setUser(null);
          setRole(null);
        }
      } finally {
        if (mounted) {
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

    // Timeout de segurança mais generoso - 5 segundos
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('useOptimizedAuth: Timeout atingido, forçando fim do loading');
        setLoading(false);
        setIsLoadingAuth(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // Validação de plano usando os novos dados
  const isAdmin = role === 'admin' || role === 'superadmin';
  const planValidation = validatePlanAccess(
    user?.plano || 'Free', 
    user?.planActive || false, 
    isAdmin
  );
  
  console.log('useOptimizedAuth: Validação de plano aplicada:', {
    hasUser: !!user,
    plan: user?.plano,
    planActive: user?.planActive,
    expired: user?.expired,
    planValidation
  });

  // Estado final
  const canAccessFeatures = planValidation.isActive || isAdmin;

  console.log('useOptimizedAuth: Resultado final da validação:', {
    hasAuthUser: !!user,
    role,
    isAdmin,
    plan: planValidation.plan,
    planActive: planValidation.isActive,
    expired: user?.expired,
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
