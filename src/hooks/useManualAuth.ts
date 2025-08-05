
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthUser, AuthState } from '@/types/auth';
import { validateUserPlan, PlanType } from '@/services/planValidationService';

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

const createOficinaAndLinkToProfile = async (userId: string, userEmail: string) => {
  try {
    console.log('[useManualAuth] 🏗️ Criando oficina para userId:', userId);
    
    // Verificar se já existe uma oficina para este usuário
    const { data: existingOficina } = await supabase
      .from('oficinas')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

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
      setPlanData({ plan: null, planActive: false, permissions: [] });
      setLoading(false);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('[useManualAuth] 💥 Erro no logout:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('[useManualAuth] 🚀 Iniciando configuração');
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const loadUserData = async (currentSession: Session) => {
      try {
        if (!mounted) return;
        
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

        if (!mounted) return;

        const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
        
        console.log('[useManualAuth] 🔐 Dados processados:', { 
          profile: !!profile, 
          isAdmin, 
          role: profile?.role,
          hasOficinaId: !!profile?.oficina_id,
          email: profile?.email
        });

        // Garantir que o usuário tenha uma oficina vinculada (exceto admins)
        let oficinaId = profile?.oficina_id;
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

        // ✅ Se é admin, bypass completo da validação de plano
        if (isAdmin) {
          console.log('[useManualAuth] 👑 Admin detectado, liberando acesso total');
          
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
            
            console.log('[useManualAuth] ✅ Admin configurado com sucesso:', {
              userId: authUser.id,
              email: authUser.email,
              role: authUser.role,
              isAdmin: authUser.isAdmin,
              planActive: true
            });
          }
          return;
        }

        // Para usuários comuns, validar plano no banco
        console.log('[useManualAuth] 📋 Validando plano para usuário comum:', userId);
        const planValidation = await validateUserPlan(userId);
        
        console.log('[useManualAuth] 📊 Validação do plano:', planValidation);

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
          
          console.log('[useManualAuth] ✅ Usuário comum carregado:', {
            userId,
            email: userEmail,
            role: authUser.role,
            oficinaId,
            plan: planValidation.plan,
            planActive: planValidation.isActive,
            permissions: planValidation.permissions.length,
            source: planValidation.source
          });
        }
      } catch (error) {
        console.error('[useManualAuth] 💥 Erro ao carregar dados do usuário:', error);
        if (mounted) {
          console.log('[useManualAuth] 🚫 Erro no carregamento, forçando estado deslogado');
          setUser(null);
          setRole(null);
          setPlanData({ plan: null, planActive: false, permissions: [] });
          setLoading(false);
          setIsLoadingAuth(false);
        }
      }
    };

    const initializeAuth = async () => {
      try {
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
        
        if (mounted) {
          setSession(currentSession);
          
          if (currentSession?.user) {
            console.log('[useManualAuth] 🔑 Sessão inicial encontrada para userId:', currentSession.user.id);
            await loadUserData(currentSession);
          } else {
            console.log('[useManualAuth] 🚫 Nenhuma sessão inicial encontrada');
            setUser(null);
            setRole(null);
            setPlanData({ plan: null, planActive: false, permissions: [] });
            setLoading(false);
            setIsLoadingAuth(false);
          }
        }
      } catch (error) {
        console.error('[useManualAuth] 💥 Erro na inicialização:', error);
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
        
        console.log('[useManualAuth] 🔄 Auth state change:', event, 'userId:', session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          console.log('[useManualAuth] ✅ Sessão detectada no auth state change para userId:', session.user.id);
          setLoading(true);
          setIsLoadingAuth(true);
          
          // Usar setTimeout para evitar problemas de concorrência
          setTimeout(() => {
            if (mounted) {
              loadUserData(session);
            }
          }, 0);
        } else {
          console.log('[useManualAuth] 🚫 Sessão removida');
          setUser(null);
          setRole(null);
          setPlanData({ plan: null, planActive: false, permissions: [] });
          setLoading(false);
          setIsLoadingAuth(false);
        }
      }
    );

    initializeAuth();

    // Timeout de segurança reduzido
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('[useManualAuth] ⏰ Timeout atingido, forçando fim do loading');
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

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.isAdmin;
  const canAccessFeatures = planData.planActive || isAdmin;

  console.log('[useManualAuth] 📊 Estado final:', {
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
