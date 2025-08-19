
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

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('[useManualAuth] Auth state changed:', { event, hasSession: !!session });
        
        setSession(session);
        
        if (session?.user) {
          console.log('[useManualAuth] Buscando perfil para:', session.user.id);
          try {
            const profile = await fetchUserProfile(session.user.id);
            if (isMounted) {
              setUser(profile);
              setRole(profile.role);
              console.log('[useManualAuth] Profile carregado com sucesso:', profile.email);
            }
          } catch (error) {
            console.error('[useManualAuth] Erro ao carregar profile:', error);
            if (isMounted) {
              // Criar perfil básico em caso de erro
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
            }
          }
        } else {
          console.log('[useManualAuth] Sem sessão, limpando estados');
          if (isMounted) {
            setUser(null);
            setRole(null);
          }
        }
        
        if (isMounted) {
          setLoading(false);
          setIsLoadingAuth(false);
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        console.log('[useManualAuth] Sessão inicial verificada:', !!session);
      }
    });

    // Timeout de segurança
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.log('[useManualAuth] Timeout de segurança atingido');
        setLoading(false);
        setIsLoadingAuth(false);
      }
    }, 2000);

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

  // Valores derivados
  const isAdmin = useMemo(() => {
    return role === 'admin' || role === 'superadmin' || user?.isAdmin === true;
  }, [role, user?.isAdmin]);

  const plan = useMemo(() => {
    return user?.plan || 'Free';
  }, [user?.plan]);

  const planActive = useMemo(() => {
    return user?.planActive || false;
  }, [user?.planActive]);

  const permissions = useMemo(() => {
    return user?.permissions || [];
  }, [user?.permissions]);

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
