
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchUserProfile, signOutUser, UserProfile } from '@/services/authService';
import { AuthState } from '@/types/auth';

export const useManualAuth = (): AuthState => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    console.log('[useManualAuth] Iniciando configuração de autenticação');
    
    let isMounted = true;
    let isProcessing = false;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (!isMounted || isProcessing) return;
      
      console.log('[useManualAuth] Auth state changed:', event);
      isProcessing = true;
      
      try {
        setSession(session);
        
        if (session?.user) {
          console.log('[useManualAuth] Buscando perfil para:', session.user.id);
          
          const profile = await fetchUserProfile(session.user.id);
          if (isMounted) {
            setUser(profile);
            setRole(profile.role);
            console.log('[useManualAuth] Profile carregado:', profile.email);
          }
        } else {
          console.log('[useManualAuth] Sem sessão, limpando estados');
          if (isMounted) {
            setUser(null);
            setRole(null);
          }
        }
      } catch (error) {
        console.error('[useManualAuth] Erro ao processar mudança de auth:', error);
        if (isMounted) {
          // Criar perfil básico em caso de erro
          if (session?.user) {
            const basicProfile: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
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
          } else {
            setUser(null);
            setRole(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsLoadingAuth(false);
        }
        isProcessing = false;
      }
    };

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Verificar sessão existente
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await handleAuthStateChange('INITIAL_SESSION', session);
      } catch (error) {
        console.error('[useManualAuth] Erro na inicialização:', error);
        if (isMounted) {
          setLoading(false);
          setIsLoadingAuth(false);
        }
      }
    };

    initAuth();

    // Timeout de segurança para evitar loading infinito
    const timeout = setTimeout(() => {
      if (isMounted && (loading || isLoadingAuth)) {
        console.log('[useManualAuth] Timeout de segurança atingido');
        setLoading(false);
        setIsLoadingAuth(false);
      }
    }, 5000);

    return () => {
      console.log('[useManualAuth] Limpando recursos');
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
      setUser(null);
      setSession(null);
      setRole(null);
    } catch (error) {
      console.error('[useManualAuth] Erro no logout:', error);
    }
  }, []);

  // Valores derivados baseados na UserProfile
  const isAdmin = useMemo(() => {
    return role === 'admin' || role === 'superadmin';
  }, [role]);

  const plan = useMemo(() => {
    // Derivar o plano da subscription ou do campo plano
    if (user?.subscription?.plan_type) {
      if (user.subscription.plan_type.includes('premium')) {
        return 'Premium';
      }
    }
    // Usar o campo plano se disponível, senão usar Free como padrão
    return user?.plano === 'Premium' ? 'Premium' : 'Free';
  }, [user?.subscription?.plan_type, user?.plano]);

  const planActive = useMemo(() => {
    // Verificar se a subscription está ativa
    if (user?.subscription) {
      const now = new Date();
      const isActive = user.subscription.status === 'active';
      const notExpired = !user.subscription.ends_at || new Date(user.subscription.ends_at) > now;
      const trialNotExpired = !user.subscription.trial_ends_at || new Date(user.subscription.trial_ends_at) > now;
      
      return isActive && (notExpired || trialNotExpired);
    }
    return false;
  }, [user?.subscription]);

  const permissions = useMemo(() => {
    // Gerar permissões baseadas no plano e status
    if (isAdmin) {
      return ['*']; // Admin tem todas as permissões
    }
    
    if (!planActive) {
      return ['clientes', 'orcamentos']; // Permissões básicas
    }
    
    if (plan === 'Premium') {
      return [
        'clientes', 'orcamentos', 'servicos', 'relatorios_basicos', 
        'diagnostico_ia', 'campanhas_marketing', 'relatorios_avancados', 
        'agendamentos', 'backup_automatico', 'integracao_contabil',
        'suporte_prioritario', 'marketing_automatico'
      ];
    }
    
    return ['clientes', 'orcamentos']; // Padrão para planos não reconhecidos
  }, [isAdmin, planActive, plan]);

  const canAccessFeatures = useMemo(() => {
    return planActive || isAdmin;
  }, [planActive, isAdmin]);

  const oficinaId = useMemo(() => {
    return user?.oficina_id || null;
  }, [user?.oficina_id]);

  return {
    user,
    session,
    loading,
    isLoadingAuth,
    role,
    isAdmin,
    plan: plan as 'Premium' | 'Free' | null,
    planActive,
    permissions,
    canAccessFeatures,
    permissionsCount: permissions.length,
    oficinaId,
    signOut
  };
};
