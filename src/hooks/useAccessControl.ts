
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
    // CRÍTICO: Não fazer nada se ainda está carregando
    if (isLoadingAuth) {
      console.log('Aguardando carregamento da autenticação...');
      return;
    }

    console.log('Processando controle de acesso:', {
      user: user?.email,
      role: user?.role,
      location: location.pathname,
      isLoadingAuth
    });

    // Se não há usuário autenticado
    if (!user) {
      console.log('Usuário não autenticado, redirecionando para login');
      if (location.pathname !== '/login' && !location.pathname.startsWith('/admin')) {
        navigate('/login', { replace: true });
      }
      return;
    }

    // PRIORIDADE MÁXIMA: Admin sempre tem acesso total
    if (user.role === 'admin' || user.role === 'superadmin') {
      console.log('Usuário é admin, bypass total de verificação de assinatura');
      
      // Se admin está em rota de usuário normal, redirecionar para admin dashboard
      if (!location.pathname.startsWith('/admin') && 
          location.pathname !== '/' && 
          location.pathname !== '/login') {
        console.log('Admin em rota de usuário, redirecionando para admin dashboard');
        navigate('/admin/dashboard', { replace: true });
        return;
      }
      
      // Se admin está na raiz (/), redirecionar para admin dashboard
      if (location.pathname === '/') {
        console.log('Admin na raiz, redirecionando para admin dashboard');
        navigate('/admin/dashboard', { replace: true });
        return;
      }
      
      return;
    }

    // LÓGICA PARA USUÁRIOS NORMAIS
    // CRÍTICO: Usuários autenticados têm acesso básico ao dashboard
    const hasGeneralAccess = user.canAccessFeatures || user.role === 'user';
    
    console.log('Verificando acesso para usuário normal:', {
      hasGeneralAccess,
      subscription: user.subscription,
      requiredPlan,
      role: user.role
    });

    // MUDANÇA IMPORTANTE: Não bloquear usuários autenticados do dashboard básico
    if (!hasGeneralAccess && user.role !== 'user') {
      const restrictedPaths = ['/dashboard', '/clientes', '/servicos', '/orcamentos', '/agendamentos', '/produtos'];
      if (restrictedPaths.some(path => location.pathname.startsWith(path))) {
        console.log('Usuário sem acesso tentando acessar área restrita, bloqueando');
        navigate('/login', { replace: true });
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
    shouldShowContent: !isLoadingAuth && user && (user.isAdmin || user.canAccessFeatures || user.role === 'user'),
    isAdmin: user?.isAdmin || false,
    hasGeneralAccess: user?.canAccessFeatures || user?.role === 'user' || false
  };
};
