
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { AuthContextValue } from '@/types/auth';
import { supabase } from '@/lib/supabase';
import { validatePlanAccess, PlanType } from '@/services/planValidation';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('AuthProvider: Renderizando contexto de autenticação');
  const authValue = useOptimizedAuth();
  const [realtimeSubscription, setRealtimeSubscription] = useState<any>(null);

  // ✅ Listener Realtime para atualizar quando Admin alterar assinatura
  useEffect(() => {
    if (authValue.user?.id) {
      console.log('AuthProvider: Configurando listener Realtime');
      
      const channel = supabase
        .channel('subscription-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_subscriptions'
          },
          (payload) => {
            console.log('AuthProvider: Mudança detectada em user_subscriptions:', payload);
            // Força uma nova validação dos dados
            window.location.reload();
          }
        )
        .subscribe();

      setRealtimeSubscription(channel);

      return () => {
        console.log('AuthProvider: Removendo listener Realtime');
        supabase.removeChannel(channel);
      };
    }
  }, [authValue.user?.id]);

  console.log('AuthProvider: Estado atual:', {
    user: authValue.user?.email || 'não logado',
    loading: authValue.loading,
    isLoadingAuth: authValue.isLoadingAuth,
    role: authValue.role,
    plan: authValue.plan,
    planActive: authValue.planActive,
    permissionsCount: authValue.permissions.length
  });

  return (
    <AuthContext.Provider value={authValue}>
      {children}
      {/* Debug UI no canto da tela */}
      <PlanDebugUI 
        plan={authValue.plan} 
        active={authValue.planActive} 
        permissions={authValue.permissions} 
      />
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ Debug UI para validar plano em tempo real
const PlanDebugUI: React.FC<{ plan: PlanType | null; active: boolean; permissions: string[] }> = ({ 
  plan, 
  active, 
  permissions 
}) => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div style={{
      position: 'fixed', 
      bottom: 10, 
      right: 10, 
      background: '#000', 
      color: '#fff',
      padding: '8px 12px', 
      borderRadius: '6px', 
      fontSize: '12px', 
      opacity: 0.8,
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div>Plano: {plan || 'null'}</div>
      <div>Status: {active ? 'Ativo' : 'Inativo'}</div>
      <div>Permissões: {permissions.length}</div>
    </div>
  );
};
