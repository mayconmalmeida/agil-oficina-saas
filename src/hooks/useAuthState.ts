
import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthUser } from '@/types/auth';
import { fetchUserProfile, calculateCanAccessFeatures } from '@/services/authService';

export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  
  // Ref para evitar múltiplas chamadas simultâneas
  const isUpdatingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const updateUserWithData = async (authUser: User) => {
    // Evitar atualizações simultâneas ou duplicadas
    if (isUpdatingRef.current || lastUserIdRef.current === authUser.id) {
      console.log('Evitando atualização duplicada para usuário:', authUser.id);
      return;
    }

    try {
      console.log('Buscando dados do perfil para usuário:', authUser.id);
      isUpdatingRef.current = true;
      lastUserIdRef.current = authUser.id;
      setIsLoadingAuth(true);
      
      const userData = await fetchUserProfile(authUser.id);
      
      // MUDANÇA CRÍTICA: Calcular canAccessFeatures levando em conta a role
      const isAdmin = userData.role === 'admin' || userData.role === 'superadmin';
      const canAccessFeatures = calculateCanAccessFeatures(userData.subscription, userData.role);
      
      console.log('Dados do usuário carregados:', {
        role: userData.role,
        isAdmin,
        canAccessFeatures,
        hasSubscription: !!userData.subscription
      });
      
      // Ensure subscription has all required properties for UserSubscription type
      const formattedSubscription = userData.subscription ? {
        id: userData.subscription.id,
        user_id: authUser.id,
        plan_type: userData.subscription.plan_type as "essencial_mensal" | "essencial_anual" | "premium_mensal" | "premium_anual" | "free_trial_essencial" | "free_trial_premium",
        status: userData.subscription.status as "active" | "trialing" | "cancelled" | "expired",
        starts_at: userData.subscription.starts_at,
        ends_at: userData.subscription.ends_at || null,
        trial_ends_at: userData.subscription.trial_ends_at || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } : null;
      
      const userWithData: AuthUser = {
        ...authUser,
        role: userData.role,
        isAdmin,
        canAccessFeatures,
        subscription: formattedSubscription
      };
      
      setUser(userWithData);
      setRole(userData.role);
      
      console.log('Estado do usuário atualizado completamente');
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      // Em caso de erro, define usuário sem dados extras mas com acesso básico se for user
      const role = 'user'; // Assumir user por padrão em caso de erro
      setUser({
        ...authUser,
        role,
        isAdmin: false,
        canAccessFeatures: true, // CRÍTICO: Dar acesso básico em caso de erro
        subscription: null
      });
      setRole(role);
    } finally {
      // CRÍTICO: Sempre definir isLoadingAuth como false após o processamento
      console.log('Finalizando carregamento de autenticação');
      setIsLoadingAuth(false);
      setLoading(false);
      isUpdatingRef.current = false;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.email);
        
        // Sempre atualizar a sessão
        setSession(session);
        
        if (session?.user) {
          // Só processar se for um novo usuário ou se não há processamento em andamento
          if (!isUpdatingRef.current) {
            await updateUserWithData(session.user);
          }
        } else {
          console.log('Usuário deslogado, limpando estado');
          setUser(null);
          setRole(null);
          setIsLoadingAuth(false);
          setLoading(false);
          isUpdatingRef.current = false;
          lastUserIdRef.current = null;
        }
      }
    );

    // Verificar sessão existente na inicialização
    const initializeAuth = async () => {
      try {
        console.log('Inicializando verificação de autenticação...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          throw error;
        }
        
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user && !isUpdatingRef.current) {
          console.log('Sessão existente encontrada, carregando dados do usuário');
          await updateUserWithData(session.user);
        } else if (!session?.user) {
          console.log('Nenhuma sessão encontrada');
          setIsLoadingAuth(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        if (mounted) {
          setIsLoadingAuth(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      isUpdatingRef.current = false;
      lastUserIdRef.current = null;
    };
  }, []);

  return {
    user,
    session,
    loading,
    isLoadingAuth,
    role
  };
};
