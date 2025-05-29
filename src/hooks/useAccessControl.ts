
import { useEffect } from 'react';
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

  useEffect(() => {
    // Não fazer nada se ainda está carregando
    if (isLoadingAuth) return;

    // Se não há usuário autenticado
    if (!user) {
      if (location.pathname !== '/login' && !location.pathname.startsWith('/admin')) {
        navigate('/login');
      }
      return;
    }

    // PRIORIDADE MÁXIMA: Admin sempre tem acesso total
    if (user.isAdmin) {
      // Se admin está em rota de usuário normal, redirecionar para admin dashboard
      if (!location.pathname.startsWith('/admin') && location.pathname !== '/dashboard') {
        navigate('/admin/dashboard');
      }
      return;
    }

    // LÓGICA PARA USUÁRIOS NORMAIS
    const hasGeneralAccess = user.canAccessFeatures || false;
    
    // Se não tem acesso geral
    if (!hasGeneralAccess) {
      const restrictedPaths = ['/dashboard', '/clientes', '/servicos', '/orcamentos', '/agendamentos', '/produtos'];
      if (restrictedPaths.some(path => location.pathname.startsWith(path))) {
        // Não usar navigate para evitar loops - usar replace direto
        window.location.replace('/login');
      }
      return;
    }

    // Se tem acesso geral mas precisa de plano específico
    if (requiredPlan && hasGeneralAccess) {
      const isPremium = user.subscription?.plan_type?.includes('premium') || false;
      
      if (requiredPlan === 'premium' && !isPremium) {
        // Usuário tem acesso básico mas precisa de premium
        // Deixar o componente decidir o que mostrar (upgrade card)
        return;
      }
    }

  }, [user, isLoadingAuth, location.pathname, navigate, requiredPlan]);

  return {
    shouldShowContent: !isLoadingAuth && user && (user.isAdmin || user.canAccessFeatures),
    isAdmin: user?.isAdmin || false,
    hasGeneralAccess: user?.canAccessFeatures || false
  };
};
