
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserSubscription } from '@/types/subscription';
import { AuthUser, AuthState } from '@/types/auth';

// ✅ Nova função para buscar plano da oficina com validação correta de data
const getOficinaPlan = async (oficinaId: string) => {
  try {
    console.log('[getOficinaPlan] Buscando plano para oficina:', oficinaId);
    
    const { data, error } = await supabase
      .from('oficinas')
      .select('plano, trial_ends_at')
      .eq('id', oficinaId)
      .maybeSingle();

    if (error) {
      console.error('[getOficinaPlan] Erro ao buscar plano:', error);
      return { plan: 'Free', planActive: false, expired: true };
    }

    if (!data) {
      console.log('[getOficinaPlan] Oficina não encontrada');
      return { plan: 'Free', planActive: false, expired: true };
    }

    // ✅ Validação correta da data de expiração
    const now = new Date();
    const trialEnd = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
    const expired = !trialEnd || trialEnd < now;

    console.log('[getOficinaPlan] Resultado:', {
      plano: data.plano,
      trial_ends_at: data.trial_ends_at,
      trialEnd: trialEnd?.toISOString(),
      now: now.toISOString(),
      expired,
      planActive: !expired
    });

    return {
      plan: data.plano || 'Free',
      planActive: !expired,
      expired
    };
  } catch (error) {
    console.error('[getOficinaPlan] Erro inesperado:', error);
    return { plan: 'Free', planActive: false, expired: true };
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

            // ✅ Buscar plano da oficina
            let planData = { plan: 'Free', planActive: false, expired: true };
            
            if (oficinaId) {
              planData = await getOficinaPlan(oficinaId);
            }

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
              expired: planData.expired
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
