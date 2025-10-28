
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchUserProfile, signOutUser, UserProfile, MOCK_PROFILE } from '@/services/authService';
import { AuthState } from '@/types/auth';

export const useManualAuth = (): AuthState => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const isInitializedRef = useRef(false);
  const profileCacheRef = useRef<{ userId: string; profile: UserProfile } | null>(null);
  const isFetchingRef = useRef(false);
  const eventDebounceRef = useRef<number | null>(null);
  const safetyTimeoutRef = useRef<number | null>(null);
  const loadingRef = useRef(true);
  const isLoadingAuthRef = useRef(true);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    isLoadingAuthRef.current = isLoadingAuth;
  }, [isLoadingAuth]);

  useEffect(() => {
    console.log('[useManualAuth] Iniciando configuração de autenticação');
    
    let isMounted = true;
    let currentSession: Session | null = null;

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        // Debounce rápido para evitar múltiplos disparos consecutivos
        if (eventDebounceRef.current) {
          clearTimeout(eventDebounceRef.current);
        }
        eventDebounceRef.current = window.setTimeout(async () => {
          console.log('[useManualAuth] Auth state changed:', { event, hasSession: !!session });
          
          currentSession = session; // Armazenar sessão atual
          setSession(session);

          // Limpar timeout de segurança se tivermos finalizado o loading
          if (!loadingRef.current && !isLoadingAuthRef.current && safetyTimeoutRef.current) {
            clearTimeout(safetyTimeoutRef.current);
            safetyTimeoutRef.current = null;
          }
          
          if (session?.user) {
            const userId = session.user.id;
            console.log('[useManualAuth] Processando sessão para usuário:', userId);

            // Evitar múltiplas buscas concorrentes
            if (isFetchingRef.current) {
              console.log('[useManualAuth] Busca de perfil já em andamento, ignorando evento');
              return;
            }
            isFetchingRef.current = true;

            try {
              // Usar cache se disponível e recente
              if (profileCacheRef.current?.userId === userId) {
                console.log('[useManualAuth] Usando perfil do cache');
                const cached = profileCacheRef.current.profile;
                setUser(cached);
                setRole(cached.role);
                setLoading(false);
                setIsLoadingAuth(false);
                isInitializedRef.current = true;
              } else {
                // Buscar perfil diretamente - fetchUserProfile trata timebox/erros
                console.log('[useManualAuth] Buscando perfil do usuário...');
                const profile = await fetchUserProfile(userId);
                console.log('[useManualAuth] Profile carregado com sucesso:', profile.email);
                
                if (isMounted && profile) {
                  setUser(profile);
                  setRole(profile.role);
                  // Salvar no cache
                  profileCacheRef.current = {
                    userId,
                    profile
                  };
                  setLoading(false);
                  setIsLoadingAuth(false);
                  isInitializedRef.current = true;
                }
              }
            } catch (error) {
              console.error('[useManualAuth] Erro ao carregar profile:', error);
              if (isMounted) {
                // Em caso de erro, usar o perfil offline
                console.log('[useManualAuth] Usando perfil offline após erro');
                const offlineProfile = {
                  ...MOCK_PROFILE,
                  id: userId,
                  email: session.user.email || MOCK_PROFILE.email
                };
                setUser(offlineProfile);
                setRole(offlineProfile.role);
                setLoading(false);
                setIsLoadingAuth(false);
                isInitializedRef.current = true;
                // Cachear para estabilizar a UI
                profileCacheRef.current = { userId, profile: offlineProfile };
              }
            } finally {
              isFetchingRef.current = false;
              // Garantir que o timeout de segurança não aplique offline após sucesso
              if (!loadingRef.current && !isLoadingAuthRef.current && safetyTimeoutRef.current) {
                clearTimeout(safetyTimeoutRef.current);
                safetyTimeoutRef.current = null;
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
              // Cancelar timeout de segurança se ativo
              if (safetyTimeoutRef.current) {
                clearTimeout(safetyTimeoutRef.current);
                safetyTimeoutRef.current = null;
              }
            }
          }
        }, 250);
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        console.log('[useManualAuth] Sessão inicial verificada:', !!session);
        currentSession = session; // Armazenar sessão inicial
      }
    });

    // Adicionar timeout de segurança para garantir que o loading termine
    safetyTimeoutRef.current = window.setTimeout(() => {
      if (isMounted && (loadingRef.current || isLoadingAuthRef.current)) {
        console.log('[useManualAuth] Timeout de segurança atingido - finalizando loading');
        
        // Sempre aplicar o perfil offline quando o timeout é atingido e temos uma sessão
        if (currentSession?.user) {
          console.log('[useManualAuth] Criando perfil offline após timeout para usuário:', currentSession.user.id);
          
          // Usar o perfil mock para garantir que o usuário tenha acesso
          const offlineProfile = {
            ...MOCK_PROFILE,
            id: currentSession.user.id,
            email: currentSession.user.email || MOCK_PROFILE.email
          };
          
          setUser(offlineProfile);
          setRole(offlineProfile.role);
          // Salvar no cache para uso futuro
          profileCacheRef.current = {
            userId: currentSession.user.id,
            profile: offlineProfile
          };
          console.log('[useManualAuth] Perfil offline aplicado após timeout:', offlineProfile);
        } else {
          console.log('[useManualAuth] Nenhuma sessão disponível para aplicar perfil offline');
        }
        
        setLoading(false);
        setIsLoadingAuth(false);
        isInitializedRef.current = true;
      }
    }, 15000); // Timeout de segurança para finalizar loading em redes lentas

    return () => {
      console.log('[useManualAuth] Limpando recursos');
      isMounted = false;
      subscription.unsubscribe();
      if (eventDebounceRef.current) {
        clearTimeout(eventDebounceRef.current);
        eventDebounceRef.current = null;
      }
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
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
