
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserSubscription } from '@/types/subscription';
import { AuthUser, AuthState } from '@/types/auth';
import { getUserPlanStatus } from '@/services/subscriptionPersistence';

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
        console.log('useOptimizedAuth: Sessão encontrada, buscando perfil para userId:', currentSession.user.id);
        
        // Tentar buscar perfil do usuário com timeout individual
        const profilePromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .maybeSingle();

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout ao buscar perfil')), 3000);
        });

        const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
        
        if (error) {
          console.error('useOptimizedAuth: Erro ao buscar perfil:', error);
          // Mesmo com erro, criar um usuário básico se temos uma sessão válida
          if (mounted) {
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
            setLoading(false);
            setIsLoadingAuth(false);
            
            console.log('useOptimizedAuth: Usuário básico criado devido a erro no perfil');
          }
          return;
        }
        
        if (profile && mounted) {
          console.log('useOptimizedAuth: Perfil encontrado:', profile);
          
          // Buscar oficina_id do usuário
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

          // Verificar se é admin ANTES de buscar plano
          const isAdmin = profile.role === 'admin' || profile.role === 'superadmin';
          console.log('useOptimizedAuth: Verificando se é admin:', { role: profile.role, isAdmin });

          // Buscar plano (mas não depender dele se for admin)
          let planStatus = { plan: 'Free', planActive: false, expired: true };
          
          try {
            planStatus = await getUserPlanStatus(currentSession.user.id);
            console.log('useOptimizedAuth: Status do plano obtido:', planStatus);
          } catch (planError) {
            console.warn('useOptimizedAuth: Erro ao buscar plano:', planError);
          }

          if (mounted) {
            setPlanData(planStatus);

            const authUser: AuthUser = {
              id: profile.id,
              email: profile.email || currentSession.user.email || '',
              role: profile.role || 'user',
              nome_oficina: profile.nome_oficina,
              telefone: profile.telefone,
              is_active: profile.is_active ?? true,
              subscription: null,
              oficina_id: oficinaId,
              trial_ends_at: profile.trial_ends_at,
              plano: planStatus.plan,
              trial_started_at: profile.trial_started_at,
              app_metadata: currentSession.user.app_metadata,
              user_metadata: currentSession.user.user_metadata,
              aud: currentSession.user.aud,
              planActive: planStatus.planActive,
              expired: planStatus.expired,
              isAdmin: isAdmin
            };
            
            setUser(authUser);
            setRole(authUser.role);
            console.log('useOptimizedAuth: Perfil carregado:', {
              email: authUser.email,
              role: authUser.role,
              isAdmin: isAdmin,
              plan: planStatus.plan,
              planActive: planStatus.planActive,
              expired: planStatus.expired
            });
          }
        } else if (mounted) {
          console.log('useOptimizedAuth: Perfil não encontrado, criando básico');
          // Criar perfil básico se não encontrou nada
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
            expired: true,
            isAdmin: false
          };
          
          setUser(basicAuthUser);
          setRole('user');
          setPlanData({ plan: 'Free', planActive: false, expired: true });
        }
      } catch (error) {
        console.error('useOptimizedAuth: Erro ao carregar dados do usuário:', error);
        if (mounted) {
          // Mesmo com erro, tentar criar um usuário básico se temos sessão
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

    // Timeout de segurança reduzido
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('useOptimizedAuth: Timeout atingido, forçando fim do loading');
        setLoading(false);
        setIsLoadingAuth(false);
      }
    }, 3000); // Reduzido para 3 segundos

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
