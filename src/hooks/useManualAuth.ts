
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  const isInitializedRef = useRef(false);
  const profileCacheRef = useRef<{ userId: string; profile: UserProfile } | null>(null);

  useEffect(() => {
    console.log('[useManualAuth] Iniciando configuração de autenticação');
    
    let isMounted = true;

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('[useManualAuth] Auth state changed:', { event, hasSession: !!session });
        
        setSession(session);
        
        if (session?.user) {
          console.log('[useManualAuth] Buscando perfil para:', session.user.id);
          
          // Verificar cache primeiro
          if (profileCacheRef.current?.userId === session.user.id) {
            console.log('[useManualAuth] Cache encontrado, mas recarregando perfil para garantir dados atualizados');
            // Limpar cache para forçar recarregamento
            profileCacheRef.current = null;
          }

          try {
            // Buscar perfil diretamente sem timeout - fetchUserProfile já tem seus próprios tratamentos de erro
            console.log('[useManualAuth] Buscando perfil do usuário...');
            const profile = await fetchUserProfile(session.user.id);
            console.log('[useManualAuth] Profile carregado com sucesso:', profile.email);
            
            if (isMounted && profile) {
              setUser(profile);
              setRole(profile.role);
              // Salvar no cache
              profileCacheRef.current = {
                userId: session.user.id,
                profile
              };
              setLoading(false);
              setIsLoadingAuth(false);
              isInitializedRef.current = true;
            }
          } catch (error) {
            console.error('[useManualAuth] Erro ao carregar profile:', error);
            if (isMounted) {
              // Criar perfil básico em caso de erro mas manter a sessão
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
                updated_at: new Date().toISOString(),
                trial_ends_at: null,
                plano: 'Free',
                trial_started_at: null
              };
              setUser(basicProfile);
              setRole('user');
              setLoading(false);
              setIsLoadingAuth(false);
              isInitializedRef.current = true;
              console.log('[useManualAuth] Perfil básico criado devido a erro, mas sessão mantida');
            }
          }
        } else {
          console.log('[useManualAuth] Sem sessão, limpando estados');
          if (isMounted) {
            setUser(null);
            setRole(null);
            profileCacheRef.current = null; // Limpar cache
            setLoading(false);
            setIsLoadingAuth(false);
            isInitializedRef.current = true;
          }
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        console.log('[useManualAuth] Sessão inicial verificada:', !!session);
      }
    });

    return () => {
      console.log('[useManualAuth] Limpando recursos');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
      setUser(null);
      setSession(null);
      setRole(null);
      profileCacheRef.current = null; // Limpar cache
      isInitializedRef.current = false; // Reset da inicialização
    } catch (error) {
      console.error('[useManualAuth] Erro no logout:', error);
    }
  }, []);

  // Valores derivados baseados na UserProfile (memoizados para evitar recálculos)
  const derivedValues = useMemo(() => {
    const isAdmin = role === 'admin' || role === 'superadmin';

    const plan = (() => {
      // Derivar o plano da subscription ou do campo plano
      if (user?.subscription?.plan_type) {
        if (user.subscription.plan_type.includes('premium')) {
          return 'Premium';
        }
      }
      // Usar o campo plano se disponível, senão usar Free como padrão
      return user?.plano === 'Premium' ? 'Premium' : 'Free';
    })();

    const planActive = (() => {
      // Verificar se a subscription está ativa
      if (user?.subscription) {
        const now = new Date();
        const isActive = user.subscription.status === 'active';
        const notExpired = !user.subscription.ends_at || new Date(user.subscription.ends_at) > now;
        const trialNotExpired = !user.subscription.trial_ends_at || new Date(user.subscription.trial_ends_at) > now;
        
        return isActive && (notExpired || trialNotExpired);
      }
      return false;
    })();

    const permissions = (() => {
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
    })();

    return {
      isAdmin,
      plan: plan as 'Premium' | 'Free' | null,
      planActive,
      permissions,
      canAccessFeatures: planActive || isAdmin,
      oficinaId: user?.oficina_id || null
    };
  }, [user, role]);

  return {
    user,
    session,
    loading,
    isLoadingAuth,
    role,
    ...derivedValues,
    permissionsCount: derivedValues.permissions.length,
    signOut
  };
};
