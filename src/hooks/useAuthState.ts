
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { fetchUserProfile, UserProfile } from '@/services/authService';

export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    console.log('useAuthState: Iniciando configuração de autenticação');
    
    // Configurar listener primeiro para não perder eventos
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuthState: Auth state changed:', { event, hasSession: !!session });
        
        setSession(session);
        
        if (session?.user) {
          setProfileLoading(true);
          try {
            const profile = await fetchUserProfile(session.user.id);
            setUser(profile);
            setRole(profile.role);
            console.log('useAuthState: Profile carregado:', profile);
          } catch (error) {
            console.error('useAuthState: Erro ao carregar profile:', error);
            setUser(null);
            setRole(null);
          } finally {
            setProfileLoading(false);
          }
        } else {
          setUser(null);
          setRole(null);
        }
        
        if (initialLoad) {
          setInitialLoad(false);
        }
      }
    );

    // Depois verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('useAuthState: Sessão inicial verificada:', !!session);
      // O listener já vai processar esta sessão
    });

    // Timeout de segurança para evitar loading infinito
    const timeout = setTimeout(() => {
      console.log('useAuthState: Timeout de segurança atingido');
      setLoading(false);
      setIsLoadingAuth(false);
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Atualizar estados de loading
  useEffect(() => {
    const isLoading = initialLoad || profileLoading;
    setLoading(isLoading);
    setIsLoadingAuth(isLoading);
  }, [initialLoad, profileLoading]);

  console.log('useAuthState: Estado atual:', {
    hasSession: !!session,
    hasUser: !!user,
    hasProfile: !!user,
    initialLoad,
    profileLoading,
    loading,
    isLoadingAuth,
    role,
    userEmail: user?.email || undefined
  });

  return {
    user,
    session,
    loading,
    isLoadingAuth,
    role
  };
};
