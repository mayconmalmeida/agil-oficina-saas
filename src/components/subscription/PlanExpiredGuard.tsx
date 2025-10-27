
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/loading';
import { useDaysRemaining } from '@/hooks/useDaysRemaining';
import { supabase } from '@/lib/supabase';

interface PlanExpiredGuardProps {
  children: React.ReactNode;
}

const PlanExpiredGuard: React.FC<PlanExpiredGuardProps> = ({ children }) => {
  const { user, isLoadingAuth, isAdmin, planActive } = useAuth();
  const { diasRestantes, loading: daysLoading } = useDaysRemaining();
  const [clientsCount, setClientsCount] = useState<number>(0);
  const [countsLoading, setCountsLoading] = useState<boolean>(true);
  const lastDecisionRef = useRef<string>('');
  const lastLogRef = useRef<string>('');

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user?.id) {
        setCountsLoading(false);
        return;
      }
      try {
        const { count } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        setClientsCount(count || 0);
      } catch (err) {
        console.error('PlanExpiredGuard: erro ao contar clientes', err);
      } finally {
        setCountsLoading(false);
      }
    };
    fetchCounts();
  }, [user?.id]);

  // Memoizar a decisão para evitar re-renders desnecessários
  const accessDecision = useMemo(() => {
    const decisionKey = `${user?.id}-${isLoadingAuth}-${isAdmin}-${planActive}-${diasRestantes}-${clientsCount}-${daysLoading}-${countsLoading}`;
    
    // Evitar logs duplicados
    if (lastLogRef.current !== decisionKey) {
      console.log('PlanExpiredGuard: Verificando acesso', {
        hasUser: !!user,
        isAdmin,
        planActive,
        diasRestantes,
        clientsCount,
        isLoadingAuth,
        daysLoading,
        countsLoading
      });
      lastLogRef.current = decisionKey;
    }

    if (isLoadingAuth || daysLoading || countsLoading) {
      return 'loading';
    }

    if (!user) {
      return 'loading'; // Aguarda AuthContext resolver
    }

    // Admin sempre tem acesso
    if (isAdmin) {
      console.log('PlanExpiredGuard: Admin detectado, acesso liberado');
      return 'allowed';
    }

    // Se possui assinatura ativa, acesso liberado
    if (planActive) {
      console.log('PlanExpiredGuard: Assinatura ativa, acesso liberado');
      return 'allowed';
    }

    // Trial: 7 dias OU até 10 clientes
    const hasTrialAccess = diasRestantes > 0 && clientsCount < 10;
    if (hasTrialAccess) {
      console.log('PlanExpiredGuard: Trial ativo dentro dos limites, acesso liberado');
      return 'allowed';
    }

    console.log('PlanExpiredGuard: Bloqueado, redirecionar para Assinatura', {
      diasRestantes,
      clientsCount,
      planActive
    });
    return 'blocked';
  }, [user?.id, isLoadingAuth, isAdmin, planActive, diasRestantes, clientsCount, daysLoading, countsLoading]);

  // Evitar re-renderizações desnecessárias
  useEffect(() => {
    const currentDecision = `${accessDecision}-${user?.id}-${isAdmin}-${planActive}-${diasRestantes}-${clientsCount}`;
    if (lastDecisionRef.current === currentDecision) {
      return;
    }
    lastDecisionRef.current = currentDecision;
  }, [accessDecision, user?.id, isAdmin, planActive, diasRestantes, clientsCount]);

  if (accessDecision === 'loading') {
    return <Loading fullscreen text="Verificando plano..." />;
  }

  if (accessDecision === 'blocked') {
    return <Navigate to="/dashboard/assinatura" replace />;
  }

  return <>{children}</>;
};

export default PlanExpiredGuard;
