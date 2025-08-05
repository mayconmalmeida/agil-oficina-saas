
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AdminUser, AdminContextValue, AdminRole } from '@/types/admin';

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: React.ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkAdminPermissions = (requiredRole?: AdminRole): boolean => {
    if (!user) return false;
    
    if (!requiredRole) return true;
    
    if (user.role === 'superadmin') return true;
    
    return user.role === requiredRole;
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/admin/login');
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao realizar logout."
      });
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAdmin = async () => {
      try {
        console.log('AdminContext: Iniciando verificação de admin...');
        setIsLoading(true);
        setError(null);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('AdminContext: Erro ao obter sessão:', sessionError);
          throw sessionError;
        }

        if (!session?.user) {
          console.log('AdminContext: Nenhum usuário autenticado');
          if (mounted) {
            setUser(null);
            setError(null);
            setIsLoading(false);
          }
          return;
        }

        console.log('AdminContext: Usuário encontrado, verificando permissões admin...', {
          userId: session.user.id,
          email: session.user.email
        });
        
        // ✅ BUSCAR NA TABELA ADMINS USANDO O EMAIL DA SESSÃO
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('id, email, is_superadmin')
          .eq('email', session.user.email)
          .maybeSingle();

        console.log('AdminContext: Resultado busca admins:', { adminData, adminError });

        if (adminError) {
          console.error('AdminContext: Erro ao buscar na tabela admins:', adminError);
          throw adminError;
        }

        if (!adminData) {
          console.log('AdminContext: Usuário não encontrado na tabela admins para email:', session.user.email);
          throw new Error('Acesso negado: usuário não é administrador');
        }

        console.log('AdminContext: Admin encontrado na tabela admins:', {
          id: adminData.id,
          email: adminData.email,
          is_superadmin: adminData.is_superadmin
        });

        // ✅ CRIAR/ATUALIZAR PERFIL NA TABELA PROFILES PARA COMPATIBILIDADE
        const adminRole = adminData.is_superadmin ? 'superadmin' : 'admin';
        
        console.log('AdminContext: Sincronizando perfil admin...');
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: adminData.email,
            role: adminRole,
            is_active: true,
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.warn('AdminContext: Erro ao sincronizar perfil admin:', profileError);
          // Não bloquear o login por isso
        } else {
          console.log('AdminContext: Perfil admin sincronizado com sucesso');
        }

        if (mounted) {
          const adminUser: AdminUser = {
            id: session.user.id,
            email: adminData.email,
            role: adminRole,
            isAdmin: true,
            canAccessFeatures: true
          };

          console.log('AdminContext: Admin autenticado com sucesso:', {
            email: adminUser.email,
            role: adminUser.role,
            userId: adminUser.id
          });
          
          setUser(adminUser);
          setError(null);
        }

      } catch (error: any) {
        console.error('AdminContext: Erro na inicialização:', error);
        if (mounted) {
          setUser(null);
          setError(error.message || 'Erro ao verificar permissões administrativas');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Timeout de segurança - 3 segundos
    timeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn('AdminContext: Timeout de segurança atingido');
        setIsLoading(false);
      }
    }, 3000);

    // Inicializar verificação
    initializeAdmin();

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('AdminContext: Auth state change:', event, 'userId:', session?.user?.id);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setError(null);
          setIsLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Pequeno delay para evitar conflitos
          setTimeout(() => {
            if (mounted) {
              initializeAdmin();
            }
          }, 100);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const contextValue: AdminContextValue = {
    user,
    isLoading,
    error,
    checkAdminPermissions,
    signOut
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};
