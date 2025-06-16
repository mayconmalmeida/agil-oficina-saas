
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthUser } from '@/types/auth';

interface UseAccessControlProps {
  user: AuthUser | null;
  isLoadingAuth: boolean;
  requiredPlan?: 'essencial' | 'premium';
}

export const useAccessControl = ({ user, isLoadingAuth, requiredPlan }: UseAccessControlProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastLocationRef = useRef(location.pathname);
  const lastUserIdRef = useRef(user?.id);

  useEffect(() => {
    // Prevent unnecessary re-runs if user and location haven't changed
    if (lastLocationRef.current === location.pathname && lastUserIdRef.current === user?.id) {
      return;
    }

    lastLocationRef.current = location.pathname;
    lastUserIdRef.current = user?.id;

    console.log('[useAccessControl] INICIO', { 
      userId: user?.id, 
      isLoadingAuth, 
      requiredPlan, 
      pathname: location.pathname 
    });

    if (isLoadingAuth) {
      console.log('[useAccessControl] Aguardando carregamento da autenticação...');
      return;
    }

    if (!user) {
      console.log('[useAccessControl] Usuário não autenticado - redirecionando para login');
      if (location.pathname !== '/login' && !location.pathname.startsWith('/admin')) {
        navigate('/login', { replace: true });
      }
      return;
    }

    // ADMIN sempre tem acesso e é redirecionado se estiver em rota comum/deslogado
    if (user.role === 'admin' || user.role === 'superadmin' || user.isAdmin) {
      console.log('[useAccessControl] Usuário é admin/superadmin, acesso irrestrito');
      if (!location.pathname.startsWith('/admin') && location.pathname !== '/' && location.pathname !== '/login') {
        navigate('/admin/dashboard', { replace: true });
        return;
      }
      if (location.pathname === '/') {
        navigate('/admin/dashboard', { replace: true });
        return;
      }
      return;
    }

    // USUÁRIOS COMUNS: garantir acesso ao dashboard
    if (user.role === 'user' || user.canAccessFeatures) {
      console.log('[useAccessControl] Usuário comum autenticado (role=user ou canAccessFeatures), acesso ok');
      return;
    }

    // Se não é admin nem user comum, bloqueia rotas restritas
    const restrictedPaths = ['/dashboard', '/clientes', '/servicos', '/orcamentos', '/agendamentos', '/produtos'];
    if (!user.canAccessFeatures && user.role !== 'user') {
      if (restrictedPaths.some(path => location.pathname.startsWith(path))) {
        console.log('[useAccessControl] Usuário sem acesso tentando acessar área restrita, bloqueando');
        navigate('/login', { replace: true });
      }
      return;
    }

    // Verificação de plano
    if (requiredPlan && (user.role === 'user' || user.canAccessFeatures)) {
      const isPremium = user.subscription?.plan_type?.includes('premium') || false;
      if (requiredPlan === 'premium' && !isPremium) {
        console.log('[useAccessControl] Funcionalidade premium requerida, mas usuário não tem plano premium');
        return;
      }
    }
  }, [user?.id, user?.role, user?.canAccessFeatures, user?.isAdmin, isLoadingAuth, location.pathname, navigate, requiredPlan]);

  return {
    shouldShowContent: !isLoadingAuth && user && (user.role === 'user' || user.canAccessFeatures || user.isAdmin),
    isAdmin: user?.isAdmin || false,
    hasGeneralAccess: user?.canAccessFeatures || user?.role === 'user' || false
  };
};
