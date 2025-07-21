
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/services/authService';
import { UserSubscription } from '@/types/subscription';

interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isLoadingAuth: boolean;
  role: string | null;
  isAdmin: boolean;
  plan: 'Essencial' | 'Premium' | 'Free' | null;
  planActive: boolean;
  permissions: string[];
  canAccessFeatures: boolean;
  permissionsCount: number;
  oficinaId: string | null;
}

const validatePlanAccess = (subscription: UserSubscription | null, profile: UserProfile | null) => {
  if (!subscription) {
    // Verificar se é trial ativo baseado no perfil
    if (profile?.trial_started_at && profile?.trial_ends_at) {
      const trialEnd = new Date(profile.trial_ends_at);
      const now = new Date();
      
      if (now <= trialEnd) {
        // Trial ativo - usar plano do perfil ou Premium por padrão
        const planType = profile.plano || 'Premium';
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
    return {
      isActive: false,
      plan: 'Free' as const,
      permissionsCount: 0,
      permissions: []
    };
  }
  
  // Com assinatura ativa
  const now = new Date();
  const isActive = subscription.status === 'active' && 
                  (!subscription.ends_at || new Date(subscription.ends_at) > now);
  
  if (!isActive) {
    return {
      isActive: false,
      plan: 'Free' as const,
      permissionsCount: 0,
      permissions: []
    };
  }
  
  // Determinar tipo de plano
  let planType: 'Essencial' | 'Premium' = 'Essencial';
  let permissionsCount = 10;
  let permissions = ['campanhas_marketing', 'relatorios_basicos'];
  
  if (subscription.plan_type?.includes('premium')) {
    planType = 'Premium';
    permissionsCount = 20;
    permissions = ['diagnostico_ia', 'campanhas_marketing', 'relatorios_avancados'];
  }
  
  return {
    isActive: true,
    plan: planType,
    permissionsCount,
    permissions
  };
};

export const useOptimizedAuth = (): AuthState => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [role, setRole] = useState<string | null>(null);

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
            const userProfile: UserProfile = {
              id: profile.id,
              email: profile.email || currentSession.user.email || '',
              role: profile.role || 'user',
              nome_oficina: profile.nome_oficina,
              telefone: profile.telefone,
              is_active: profile.is_active ?? true,
              subscription: null,
              oficina_id: null,
              created_at: profile.created_at,
              updated_at: profile.created_at,
              trial_ends_at: profile.trial_ends_at,
              plano: profile.plano,
              trial_started_at: profile.trial_started_at
            };
            
            setUser(userProfile);
            setRole(userProfile.role);
            console.log('useOptimizedAuth: Perfil carregado:', userProfile.email, 'role:', userProfile.role);
          } else {
            console.log('useOptimizedAuth: Perfil não encontrado, criando básico');
            // Criar perfil básico
            const basicProfile: UserProfile = {
              id: currentSession.user.id,
              email: currentSession.user.email || '',
              role: 'user',
              nome_oficina: null,
              telefone: null,
              is_active: true,
              subscription: null,
              oficina_id: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setUser(basicProfile);
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

  console.log('useOptimizedAuth: Estado atual detalhado:', {
    hasUser: !!user,
    hasSession: !!session,
    loading,
    isLoadingAuth,
    role,
    userEmail: user?.email || 'não logado',
    subscription: !!user?.subscription,
    subscriptionStatus: user?.subscription?.status,
    subscriptionPlanType: user?.subscription?.plan_type,
    oficinaId: user?.oficina_id
  });

  // Validação de plano
  const planValidation = validatePlanAccess(user?.subscription || null, user);
  
  console.log('useOptimizedAuth: Validação de plano aplicada:', {
    hasUser: !!user,
    subscription: !!user?.subscription,
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
    oficinaId: user?.oficina_id || null
  };
};
