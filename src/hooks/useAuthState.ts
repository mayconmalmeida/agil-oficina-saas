
import { useAuthSessionListener } from './useAuthSessionListener';
import { useUserProfileData } from './useUserProfileData';

/**
 * Composição dos hooks de autenticação:
 * 1. Pega session e user do Supabase,
 * 2. Busca "profile" do usuário logado e seu papel,
 * 3. expõe loading unificado.
 */
export const useAuthState = () => {
  const { session, user } = useAuthSessionListener();
  const { profile, loading, role } = useUserProfileData(user);

  // isLoadingAuth: loading perfil OU sessão (não logado em window/contexto browser)
  const isLoadingAuth = loading || (typeof window !== 'undefined' && !session);

  return {
    user: profile,
    session,
    loading,
    isLoadingAuth,
    role
  };
};
