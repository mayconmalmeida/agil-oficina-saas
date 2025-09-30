
import React, { useState, useEffect } from 'react';
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
          console.log('useAuthState: Buscando perfil para:', session.user.id);
          setProfileLoading(true);
          try {
            const profile = await fetchUserProfile(session.user.id);
            setUser(profile);
            setRole(profile.role);
            console.log('useAuthState: Profile carregado com sucesso:', profile.email);
          } catch (error) {
            console.error('useAuthState: Erro ao carregar profile:', error);
            // ✅ Se falhar, criar perfil básico com dados da sessão
            const basicProfile: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              role: 'user', // default role
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
            console.log('useAuthState: Usando perfil básico devido a erro');
          } finally {
            setProfileLoading(false);
          }
        } else {
          console.log('useAuthState: Sem sessão, limpando estados');
          setUser(null);
          setRole(null);
          setProfileLoading(false);
        }
        
        if (initialLoad) {
          setInitialLoad(false);
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('useAuthState: Sessão inicial verificada:', !!session);
    });

    // Timeout de segurança mais curto
    const timeout = setTimeout(() => {
      console.log('useAuthState: Timeout de segurança atingido - forçando fim do loading');
      setLoading(false);
      setIsLoadingAuth(false);
      setProfileLoading(false);
      setInitialLoad(false);
    }, 1500); // Reduzido para 1.5 segundos

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
    
    console.log('useAuthState: Atualizando loading states:', {
      initialLoad,
      profileLoading,
      finalLoading: isLoading
    });
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
