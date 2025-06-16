
import { useAuthSessionListener } from './useAuthSessionListener';
import { useUserProfileData } from './useUserProfileData';

/**
 * Composição dos hooks de autenticação:
 * 1. Pega session e user do Supabase,
 * 2. Busca "profile" do usuário logado e seu papel,
 * 3. expõe loading unificado.
 */
export const useAuthState = () => {
  const { session, user, initialLoad } = useAuthSessionListener();
  const { profile, loading: profileLoading, role } = useUserProfileData(user);

  // Aguardar tanto o carregamento inicial da sessão quanto do perfil
  const loading = initialLoad || profileLoading;
  
  // isLoadingAuth: se está carregando OU se tem sessão mas não tem perfil ainda
  const isLoadingAuth = loading || (session && !profile);

  console.log('useAuthState: Estado atual:', {
    hasSession: !!session,
    hasUser: !!user,
    hasProfile: !!profile,
    initialLoad,
    profileLoading,
    loading,
    isLoadingAuth,
    role,
    userEmail: user?.email
  });

  return {
    user: profile,
    session,
    loading,
    isLoadingAuth,
    role
  };
};
