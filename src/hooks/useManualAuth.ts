
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthUser, AuthState } from '@/types/auth';
import { validatePlanAccess, PlanStatus, ensureOficinaExists } from '@/services/planValidationCentralized';

const getUserProfile = async (userId: string) => {
  try {
    console.log('[useManualAuth] 🔍 Buscando perfil para userId:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role, email, nome_oficina, telefone, is_active, oficina_id')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[useManualAuth] ❌ Erro ao buscar perfil:', error);
      return null;
    }

    console.log('[useManualAuth] ✅ Perfil encontrado:', data);
    return data;
  } catch (error) {
    console.error('[useManualAuth] 💥 Exception ao buscar perfil:', error);
    return null;
  }
};

const checkOficinaExists = async (userId: string) => {
  try {
    console.log('[useManualAuth] 🔍 Verificando se oficina já existe para userId:', userId);
    
    const { data, error } = await supabase
      .from('oficinas')
      .select('id, nome_oficina, email, is_active, ativo')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[useManualAuth] ❌ Erro ao verificar oficina:', error);
      return null;
    }

    if (data) {
      console.log('[useManualAuth] ✅ Oficina já existe:', data);
      return data;
    }

    console.log('[useManualAuth] ❌ Oficina não encontrada');
    return null;
  } catch (error) {
    console.error('[useManualAuth] 💥 Exception ao verificar oficina:', error);
    return null;
  }
};

const createOficinaAndLinkToProfile = async (userId: string, userEmail: string) => {
  try {
    console.log('[useManualAuth] 🏗️ Criando oficina para userId:', userId);
    
    // Verificar se já existe uma oficina para este usuário
    const existingOficina = await checkOficinaExists(userId);
    let oficinaId = existingOficina?.id;

    if (!oficinaId) {
      // Criar nova oficina
      const { data: novaOficina, error: oficinaError } = await supabase
        .from('oficinas')
        .insert({
          user_id: userId,
          nome_oficina: 'Minha Oficina',
          email: userEmail,
          is_active: true,
          ativo: true,
        })
        .select('id')
        .single();

      if (oficinaError) {
        console.error('[useManualAuth] ❌ Erro ao criar oficina:', oficinaError);
        return null;
      }

      oficinaId = novaOficina.id;
      console.log('[useManualAuth] ✅ Nova oficina criada com ID:', oficinaId);
    }

    // Vincular oficina ao perfil se não estiver já vinculada
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ oficina_id: oficinaId })
      .eq('id', userId);

    if (updateError) {
      console.error('[useManualAuth] ❌ Erro ao vincular oficina ao perfil:', updateError);
    } else {
      console.log('[useManualAuth] ✅ Oficina vinculada ao perfil com sucesso');
    }

    return oficinaId;
  } catch (error) {
    console.error('[useManualAuth] 💥 Exception ao criar/vincular oficina:', error);
    return null;
  }
};

export const useManualAuth = (): AuthState => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [planData, setPlanData] = useState<PlanStatus>({
    isActive: false,
    plan: 'free',
    planName: 'Gratuito',
    permissions: [],
    daysRemaining: 0,
    source: 'none',
    isAdmin: false,
    isPremium: false,
    isEssencial: false,
    canAccessFeatures: false
  });

  // Refs para controlar estados e evitar re-renderizações
  const mountedRef = useRef(true);
  const lastUserStateRef = useRef<string>('');
  const lastLogRef = useRef<string>('');
  const authStateChangeRef = useRef<boolean>(false);
  const initializationRef = useRef<boolean>(false);
  const lastAuthStateRef = useRef<string>('');

  const signOut = useCallback(async () => {
    console.log('[useManualAuth] 🚪 Iniciando logout');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[useManualAuth] ❌ Erro ao fazer logout:', error);
        throw error;
      }
      console.log('[useManualAuth] ✅ Logout realizado com sucesso');
      setUser(null);
      setSession(null);
      setRole(null);
      setPlanData({
        isActive: false,
        plan: 'free',
        planName: 'Gratuito',
        permissions: [],
        daysRemaining: 0,
        source: 'none',
        isAdmin: false,
        isPremium: false,
        isEssencial: false,
        canAccessFeatures: false
      });
      setLoading(false);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('[useManualAuth] 💥 Erro no logout:', error);
      throw error;
    }
  }, []);

  const loadUserData = useCallback(async (currentSession: Session) => {
    try {
      if (!mountedRef.current) return;
      
      const userId = currentSession.user.id;
      const userEmail = currentSession.user.email || '';
      
      console.log('[useManualAuth] 📊 Carregando dados para userId:', userId, 'email:', userEmail);
      
      // Buscar perfil da tabela profiles
      let profile = await getUserProfile(userId);
      
      // Se não encontrar perfil, criar um básico
      if (!profile) {
        console.log('[useManualAuth] 🆕 Perfil não encontrado, criando perfil básico...');
        
        try {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              email: userEmail,
              role: 'user',
              is_active: true,
              created_at: new Date().toISOString()
            })
            .select('role, email, nome_oficina, telefone, is_active, oficina_id')
            .single();

          if (createError) {
            console.error('[useManualAuth] ❌ Erro ao criar perfil:', createError);
            // Fallback para dados básicos
            profile = {
              role: 'user',
              email: userEmail,
              nome_oficina: null,
              telefone: null,
              is_active: true,
              oficina_id: null
            };
          } else {
            console.log('[useManualAuth] ✅ Perfil criado com sucesso:', newProfile);
            profile = newProfile;
          }
        } catch (error) {
          console.error('[useManualAuth] 💥 Exception ao criar perfil:', error);
          // Fallback para dados básicos
          profile = {
            role: 'user',
            email: userEmail,
            nome_oficina: null,
            telefone: null,
            is_active: true,
            oficina_id: null
          };
        }
      }

      if (!mountedRef.current) return;

      const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
      
      console.log('[useManualAuth] 🔐 Dados processados:', { 
        profile: !!profile, 
        isAdmin, 
        role: profile?.role,
        hasOficinaId: !!profile?.oficina_id,
        email: profile?.email
      });

      // Verificar se já existe oficina cadastrada
      const existingOficina = await checkOficinaExists(userId);
      
      console.log('[useManualAuth] 🔍 Resultado da verificação de oficina:', {
        userId,
        existingOficina: !!existingOficina,
        oficinaId: existingOficina?.id,
        isAdmin,
        hasProfileOficinaId: !!profile?.oficina_id
      });
      
      // Se é admin ou já tem oficina cadastrada, ir direto para dashboard
      if (isAdmin || existingOficina) {
        console.log('[useManualAuth] 🚀 Usuário já tem oficina ou é admin, indo direto para dashboard');
        console.log('[useManualAuth] 📊 Detalhes do fluxo direto:', {
          isAdmin,
          hasExistingOficina: !!existingOficina,
          oficinaId: existingOficina?.id,
          profileOficinaId: profile?.oficina_id
        });
        
        // Garantir que o usuário tenha uma oficina vinculada (exceto admins)
        let oficinaId = profile?.oficina_id || existingOficina?.id;
        if (!isAdmin && !oficinaId) {
          console.log('[useManualAuth] 🏗️ Usuário sem oficina, criando/vinculando...');
          oficinaId = await createOficinaAndLinkToProfile(userId, userEmail);
        }

        // Criar usuário base
        const authUser: AuthUser = {
          id: userId,
          email: userEmail,
          role: profile?.role || 'user',
          isAdmin: isAdmin,
          oficina_id: oficinaId
        };

        console.log('[useManualAuth] 👤 AuthUser criado:', authUser);

        // ✅ Usar validação centralizada de plano
        console.log('[useManualAuth] 📋 Validando plano usando função centralizada:', userId);
        const planStatus = await validatePlanAccess(userId);
        
        console.log('[useManualAuth] 📊 Status do plano:', planStatus);
        
        if (mountedRef.current) {
          authUser.planActive = planStatus.canAccessFeatures;
          authUser.expired = !planStatus.isActive;
          authUser.isAdmin = planStatus.isAdmin;
          
          setUser(authUser);
          setRole(authUser.role);
          setPlanData(planStatus);
          setLoading(false);
          setIsLoadingAuth(false);
          
          console.log('[useManualAuth] ✅ Usuário configurado com sucesso:', {
            userId: authUser.id,
            email: authUser.email,
            role: authUser.role,
            isAdmin: planStatus.isAdmin,
            planActive: planStatus.canAccessFeatures,
            planName: planStatus.planName,
            plan: planStatus.plan
          });
        }
        return;
      }

      // Para usuários sem oficina, criar e validar
      console.log('[useManualAuth] 🏗️ Usuário sem oficina, criando/vinculando...');
      console.log('[useManualAuth] 📊 Fluxo de criação de oficina:', {
        userId,
        userEmail,
        isAdmin,
        hasExistingOficina: !!existingOficina
      });
      
      let oficinaId = await createOficinaAndLinkToProfile(userId, userEmail);

      // Criar usuário base
      const authUser: AuthUser = {
        id: userId,
        email: userEmail,
        role: profile?.role || 'user',
        isAdmin: isAdmin,
        oficina_id: oficinaId
      };

      console.log('[useManualAuth] 👤 AuthUser criado:', authUser);

      // ✅ Usar validação centralizada de plano
      console.log('[useManualAuth] 📋 Validando plano usando função centralizada:', userId);
      const planStatus = await validatePlanAccess(userId);
      
      console.log('[useManualAuth] 📊 Status do plano:', planStatus);
      
      if (mountedRef.current) {
        authUser.planActive = planStatus.canAccessFeatures;
        authUser.expired = !planStatus.isActive;
        authUser.isAdmin = planStatus.isAdmin;
        
        setUser(authUser);
        setRole(authUser.role);
        setPlanData(planStatus);
        setLoading(false);
        setIsLoadingAuth(false);
        
        console.log('[useManualAuth] ✅ Usuário configurado com sucesso:', {
          userId: authUser.id,
          email: authUser.email,
          role: authUser.role,
          isAdmin: planStatus.isAdmin,
          planActive: planStatus.canAccessFeatures,
          planName: planStatus.planName,
          plan: planStatus.plan
        });
      }
    } catch (error) {
      console.error('[useManualAuth] 💥 Erro no carregamento:', error);
      if (mountedRef.current) {
        console.log('[useManualAuth] 🚫 Erro no carregamento, forçando estado deslogado');
        setUser(null);
        setRole(null);
        setPlanData({
          isActive: false,
          plan: 'free',
          planName: 'Gratuito',
          permissions: [],
          daysRemaining: 0,
          source: 'none',
          isAdmin: false,
          isPremium: false,
          isEssencial: false,
          canAccessFeatures: false
        });
        setLoading(false);
        setIsLoadingAuth(false);
      }
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      if (initializationRef.current) return;
      initializationRef.current = true;
      
      console.log('[useManualAuth] 🔄 Inicializando autenticação');
      
      // Debug da sessão atual
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[useManualAuth] ❌ Erro ao obter sessão:', sessionError);
      }
      
      console.log('[useManualAuth] 📱 Sessão atual obtida:', {
        hasSession: !!currentSession,
        userId: currentSession?.user?.id || 'nenhum',
        email: currentSession?.user?.email || 'nenhum',
        error: !!sessionError
      });
      
      if (mountedRef.current) {
        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log('[useManualAuth] 🔑 Sessão inicial encontrada para userId:', currentSession.user.id);
          await loadUserData(currentSession);
        } else {
          console.log('[useManualAuth] 🚫 Nenhuma sessão inicial encontrada');
          setUser(null);
          setRole(null);
          setPlanData({
            isActive: false,
            plan: 'free',
            planName: 'Gratuito',
            permissions: [],
            daysRemaining: 0,
            source: 'none',
            isAdmin: false,
            isPremium: false,
            isEssencial: false,
            canAccessFeatures: false
          });
          setLoading(false);
          setIsLoadingAuth(false);
        }
      }
    } catch (error) {
      console.error('[useManualAuth] 💥 Erro na inicialização:', error);
      if (mountedRef.current) {
        setUser(null);
        setRole(null);
          setPlanData({
            isActive: false,
            plan: 'free',
            planName: 'Gratuito',
            permissions: [],
            daysRemaining: 0,
            source: 'none',
            isAdmin: false,
            isPremium: false,
            isEssencial: false,
            canAccessFeatures: false
          });
        setLoading(false);
        setIsLoadingAuth(false);
      }
    }
  }, [loadUserData]);

  useEffect(() => {
    console.log('[useManualAuth] 🚀 Iniciando configuração');
    mountedRef.current = true;
    let timeoutId: NodeJS.Timeout;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;
        
        console.log('[useManualAuth] 🔄 Auth state change:', event, 'userId:', session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          console.log('[useManualAuth] ✅ Sessão detectada no auth state change para userId:', session.user.id);
          setLoading(true);
          setIsLoadingAuth(true);
          
          // Usar setTimeout para evitar problemas de concorrência
          setTimeout(() => {
            if (mountedRef.current) {
              loadUserData(session);
            }
          }, 0);
        } else {
          console.log('[useManualAuth] 🚫 Sessão removida');
          setUser(null);
          setRole(null);
          setPlanData({
            isActive: false,
            plan: 'free',
            planName: 'Gratuito',
            permissions: [],
            daysRemaining: 0,
            source: 'none',
            isAdmin: false,
            isPremium: false,
            isEssencial: false,
            canAccessFeatures: false
          });
          setLoading(false);
          setIsLoadingAuth(false);
        }
      }
    );

    initializeAuth();

    // Timeout de segurança reduzido
    timeoutId = setTimeout(() => {
      if (mountedRef.current) {
        console.log('[useManualAuth] ⏰ Timeout atingido, forçando fim do loading');
        setLoading(false);
        setIsLoadingAuth(false);
      }
    }, 3000); // Reduzido para 3 segundos

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [initializeAuth, loadUserData]);

  // Memoizar valores calculados para evitar re-renderizações
  const isAdmin = useMemo(() => {
    return user?.role === 'admin' || user?.role === 'superadmin' || user?.isAdmin;
  }, [user?.role, user?.isAdmin]);

  const canAccessFeatures = useMemo(() => {
    return planData.canAccessFeatures || isAdmin;
  }, [planData.canAccessFeatures, isAdmin]);

  // Evitar logs duplicados
  const currentState = useMemo(() => {
    const stateKey = `${user?.id}-${user?.email}-${role}-${isAdmin}-${planData.isActive}-${loading}-${isLoadingAuth}`;
    
    if (lastLogRef.current !== stateKey) {
      console.log('[useManualAuth] 📊 Estado final:', {
        hasUser: !!user,
        userEmail: user?.email,
        userId: user?.id,
        oficinaId: user?.oficina_id,
        role,
        isAdmin,
        plan: planData.plan,
        planActive: planData.isActive,
        canAccessFeatures,
        permissionsCount: planData.permissions.length,
        loading,
        isLoadingAuth
      });
      lastLogRef.current = stateKey;
    }
    
    return stateKey;
  }, [user?.id, user?.email, user?.oficina_id, role, isAdmin, planData.plan, planData.isActive, planData.permissions.length, canAccessFeatures, loading, isLoadingAuth]);

  // Memoizar o objeto de retorno para evitar re-criações desnecessárias
  const authState = useMemo(() => {
    const stateKey = `${user?.id}-${user?.email}-${role}-${isAdmin}-${planData.plan}-${planData.isActive}-${planData.permissions.length}-${loading}-${isLoadingAuth}`;
    
    // Evitar re-criação se o estado não mudou realmente
    if (lastAuthStateRef.current === stateKey) {
      return {
        user,
        session,
        loading,
        isLoadingAuth,
        role,
        isAdmin,
        plan: (planData.plan === 'premium' ? 'Premium' : 
              planData.plan === 'essencial' ? 'Essencial' : 'Free') as 'Essencial' | 'Premium' | 'Enterprise' | 'Free',
        planActive: planData.isActive,
        permissions: planData.permissions,
        canAccessFeatures,
        permissionsCount: planData.permissions.length,
        oficinaId: user?.oficina_id || null,
        signOut
      };
    }
    
    lastAuthStateRef.current = stateKey;
    
    return {
      user,
      session,
      loading,
      isLoadingAuth,
      role,
      isAdmin,
      plan: (planData.plan === 'premium' ? 'Premium' : 
            planData.plan === 'essencial' ? 'Essencial' : 'Free') as 'Essencial' | 'Premium' | 'Enterprise' | 'Free',
      planActive: planData.isActive,
      permissions: planData.permissions,
      canAccessFeatures,
      permissionsCount: planData.permissions.length,
      oficinaId: user?.oficina_id || null,
      signOut
    };
  }, [
    user,
    session,
    loading,
    isLoadingAuth,
    role,
    isAdmin,
    planData.plan,
    planData.isActive,
    planData.permissions,
    canAccessFeatures,
    signOut
  ]);

  return authState;
};
