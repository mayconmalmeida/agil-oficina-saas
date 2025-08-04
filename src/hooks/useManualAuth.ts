
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthUser, AuthState } from '@/types/auth';
import { validateUserPlan, PlanType } from '@/services/planValidationService';

const getUserProfile = async (userId: string) => {
  try {
    console.log('[useManualAuth] Buscando perfil para userId:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role, email, nome_oficina, telefone, is_active')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[useManualAuth] Erro ao buscar perfil:', error);
      return null;
    }

    console.log('[useManualAuth] Perfil encontrado:', data);
    return data;
  } catch (error) {
    console.error('[useManualAuth] Exception ao buscar perfil:', error);
    return null;
  }
};

const getOficinaId = async (userId: string) => {
  try {
    console.log('[useManualAuth] Buscando oficina para userId:', userId);
    
    const { data, error } = await supabase
      .from('oficinas')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[useManualAuth] Erro ao buscar oficina:', error);
      return null;
    }

    console.log('[useManualAuth] Oficina encontrada:', data);
    return data?.id || null;
  } catch (error) {
    console.error('[useManualAuth] Exception ao buscar oficina:', error);
    return null;
  }
};

export const useManualAuth = (): AuthState => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [planData, setPlanData] = useState<{
    plan: PlanType | null;
    planActive: boolean;
    permissions: string[];
  }>({
    plan: null,
    planActive: false,
    permissions: []
  });

  const signOut = async () => {
    console.log('[useManualAuth] Iniciando logout');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[useManualAuth] Erro ao fazer logout:', error);
        throw error;
      }
      console.log('[useManualAuth] Logout realizado com sucesso');
      setUser(null);
      setSession(null);
      setRole(null);
      setPlanData({ plan: null, planActive: false, permissions: [] });
      setLoading(false);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('[useManualAuth] Erro no logout:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('[useManualAuth] Iniciando configuração');
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const loadUserData = async (currentSession: Session) => {
      try {
        if (!mounted) return;
        
        const userId = currentSession.user.id;
        const userEmail = currentSession.user.email || '';
        
        console.log('[useManualAuth] Carregando dados para userId:', userId);
        
        // Buscar perfil
        const profile = await getUserProfile(userId);
        
        // Buscar oficina ID
        const oficinaId = await getOficinaId(userId);
        
        const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
        
        console.log('[useManualAuth] Dados carregados:', { 
          profile: !!profile, 
          oficinaId, 
          isAdmin, 
          role: profile?.role 
        });

        // Criar usuário base
        const authUser: AuthUser = {
          id: userId,
          email: userEmail,
          role: profile?.role || 'user',
          isAdmin: isAdmin,
          oficina_id: oficinaId
        };

        // Se é admin, bypass da validação de plano
        if (isAdmin) {
          console.log('[useManualAuth] Admin detectado, liberando acesso total');
          
          if (mounted) {
            authUser.planActive = true;
            authUser.expired = false;
            
            setUser(authUser);
            setRole(authUser.role);
            setPlanData({ 
              plan: 'premium', 
              planActive: true, 
              permissions: ['*'] // Admin tem todas as permissões
            });
            setLoading(false);
            setIsLoadingAuth(false);
            
            console.log('[useManualAuth] Admin configurado com sucesso');
          }
          return;
        }

        // Para usuários comuns, validar plano no banco
        const planValidation = await validateUserPlan(userId);
        
        console.log('[useManualAuth] Validação do plano:', planValidation);

        if (mounted) {
          authUser.planActive = planValidation.isActive;
          authUser.expired = !planValidation.isActive;
          
          setPlanData({
            plan: planValidation.plan,
            planActive: planValidation.isActive,
            permissions: planValidation.permissions
          });
          setUser(authUser);
          setRole(authUser.role);
          setLoading(false);
          setIsLoadingAuth(false);
          
          console.log('[useManualAuth] Usuário carregado:', {
            userId,
            email: userEmail,
            role: authUser.role,
            oficinaId,
            plan: planValidation.plan,
            planActive: planValidation.isActive,
            permissions: planValidation.permissions.length
          });
        }
      } catch (error) {
        console.error('[useManualAuth] Erro ao carregar dados do usuário:', error);
        if (mounted) {
          const userId = currentSession.user.id;
          const userEmail = currentSession.user.email || '';
          
          // Em caso de erro, criar usuário básico mas válido
          const basicUser: AuthUser = {
            id: userId,
            email: userEmail,
            role: 'user',
            planActive: false,
            expired: true,
            isAdmin: false,
            oficina_id: null
          };
          
          setUser(basicUser);
          setRole('user');
          setPlanData({ plan: null, planActive: false, permissions: [] });
          setLoading(false);
          setIsLoadingAuth(false);
          
          console.log('[useManualAuth] Usuário básico criado devido a erro');
        }
      }
    };

    const initializeAuth = async () => {
      try {
        console.log('[useManualAuth] Inicializando autenticação');
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(currentSession);
          
          if (currentSession?.user) {
            console.log('[useManualAuth] Sessão inicial encontrada para userId:', currentSession.user.id);
            await loadUserData(currentSession);
          } else {
            console.log('[useManualAuth] Nenhuma sessão inicial encontrada');
            setUser(null);
            setRole(null);
            setPlanData({ plan: null, planActive: false, permissions: [] });
            setLoading(false);
            setIsLoadingAuth(false);
          }
        }
      } catch (error) {
        console.error('[useManualAuth] Erro na inicialização:', error);
        if (mounted) {
          setUser(null);
          setRole(null);
          setPlanData({ plan: null, planActive: false, permissions: [] });
          setLoading(false);
          setIsLoadingAuth(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('[useManualAuth] Auth state change:', event, 'userId:', session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          console.log('[useManualAuth] Sessão detectada no auth state change');
          await loadUserData(session);
        } else {
          console.log('[useManualAuth] Sessão removida');
          setUser(null);
          setRole(null);
          setPlanData({ plan: null, planActive: false, permissions: [] });
          setLoading(false);
          setIsLoadingAuth(false);
        }
      }
    );

    initializeAuth();

    // Timeout de segurança
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('[useManualAuth] Timeout atingido, forçando fim do loading');
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

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.isAdmin;
  const canAccessFeatures = planData.planActive || isAdmin;

  console.log('[useManualAuth] Estado final:', {
    hasUser: !!user,
    userEmail: user?.email,
    userId: user?.id,
    oficinaId: user?.oficina_id,
    role,
    isAdmin,
    plan: planData.plan,
    planActive: planData.planActive,
    canAccessFeatures,
    permissionsCount: planData.permissions.length,
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
    plan: planData.plan === 'premium' ? 'Premium' : 
          planData.plan === 'essencial' ? 'Essencial' : 
          planData.plan === 'enterprise' ? 'Enterprise' : 'Free',
    planActive: planData.planActive,
    permissions: planData.permissions,
    canAccessFeatures,
    permissionsCount: planData.permissions.length,
    oficinaId: user?.oficina_id || null,
    signOut
  };
};
