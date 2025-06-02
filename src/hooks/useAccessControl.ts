
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
    if (isLoadingAuth) {
      console.log('Aguardando carregamento da autenticação...');
      return;
    }

    // Se não há usuário autenticado
    if (!user) {
      console.log('Usuário não autenticado, redirecionando para login');
      if (location.pathname !== '/login' && !location.pathname.startsWith('/admin')) {
        window.location.replace('/login');
      }
      return;
    }

    console.log('Verificando controle de acesso para usuário:', {
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      location: location.pathname
    });

    // PRIORIDADE MÁXIMA: Admin sempre tem acesso total
    if (user.role === 'admin' || user.role === 'superadmin') {
      console.log('Usuário é admin, bypass total de verificação de assinatura');
      
      // Se admin está em rota de usuário normal, redirecionar para admin dashboard
      if (!location.pathname.startsWith('/admin') && location.pathname !== '/') {
        console.log('Admin em rota de usuário, redirecionando para admin dashboard');
        window.location.replace('/admin/dashboard');
      }
      return;
    }

    // LÓGICA PARA USUÁRIOS NORMAIS
    const hasGeneralAccess = user.canAccessFeatures || false;
    
    console.log('Verificando acesso para usuário normal:', {
      hasGeneralAccess,
      subscription: user.subscription,
      requiredPlan
    });

    // Se não tem acesso geral
    if (!hasGeneralAccess) {
      const restrictedPaths = ['/dashboard', '/clientes', '/servicos', '/orcamentos', '/agendamentos', '/produtos'];
      if (restrictedPaths.some(path => location.pathname.startsWith(path))) {
        console.log('Usuário sem acesso tentando acessar área restrita, bloqueando');
        // Usar replace direto para evitar loops
        window.location.replace('/login');
      }
      return;
    }

    // Se tem acesso geral mas precisa de plano específico
    if (requiredPlan && hasGeneralAccess) {
      const isPremium = user.subscription?.plan_type?.includes('premium') || false;
      
      if (requiredPlan === 'premium' && !isPremium) {
        console.log('Funcionalidade premium requerida, mas usuário não tem plano premium');
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
