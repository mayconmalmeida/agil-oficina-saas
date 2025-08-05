
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

        console.log('AdminContext: Usuário autenticado encontrado:', {
          userId: session.user.id,
          email: session.user.email
        });
        
        // ✅ BUSCAR ADMIN USANDO O EMAIL DA SESSÃO COM SELECT EXPLÍCITO
        console.log('AdminContext: Buscando admin para email:', session.user.email);
        
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('id, email, is_superadmin, created_at')
          .eq('email', session.user.email)
          .single();

        console.log('AdminContext: Resultado completo da busca na tabela admins:', {
          adminData,
          adminError,
          email: session.user.email
        });

        if (adminError) {
          console.error('AdminContext: Erro ao buscar na tabela admins:', adminError);
          
          if (adminError.code === 'PGRST116') {
            console.log('AdminContext: Nenhum registro encontrado na tabela admins para:', session.user.email);
            throw new Error(`Usuário ${session.user.email} não está cadastrado como administrador na tabela admins`);
          } else {
            throw new Error(`Erro ao consultar tabela admins: ${adminError.message}`);
          }
        }

        if (!adminData) {
          console.log('AdminContext: adminData é null para email:', session.user.email);
          throw new Error(`Administrador não encontrado para email: ${session.user.email}`);
        }

        console.log('AdminContext: ✅ Admin encontrado na tabela admins:', {
          id: adminData.id,
          email: adminData.email,
          is_superadmin: adminData.is_superadmin,
          created_at: adminData.created_at
        });

        // ✅ DETERMINAR ROLE BASEADO NO is_superadmin
        const adminRole: AdminRole = adminData.is_superadmin ? 'superadmin' : 'admin';
        
        console.log('AdminContext: Role determinada:', adminRole);

        // ✅ SINCRONIZAR PERFIL NA TABELA PROFILES
        console.log('AdminContext: Sincronizando perfil admin na tabela profiles...');
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: adminData.email,
            role: adminRole,
            is_active: true,
            created_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.warn('AdminContext: Aviso - erro ao sincronizar perfil admin:', profileError);
          // Não bloquear o login por isso, apenas avisar
        } else {
          console.log('AdminContext: ✅ Perfil admin sincronizado com sucesso na tabela profiles');
        }

        if (mounted) {
          const adminUser: AdminUser = {
            id: session.user.id,
            email: adminData.email,
            role: adminRole,
            isAdmin: true,
            canAccessFeatures: true
          };

          console.log('AdminContext: ✅ Admin configurado com sucesso:', {
            email: adminUser.email,
            role: adminUser.role,
            userId: adminUser.id,
            isAdmin: adminUser.isAdmin
          });
          
          setUser(adminUser);
          setError(null);
        }

      } catch (error: any) {
        console.error('AdminContext: ❌ Erro na inicialização:', error);
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

    // Timeout de segurança - 5 segundos
    timeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn('AdminContext: ⚠️ Timeout de segurança atingido após 5 segundos');
        setIsLoading(false);
        setError('Timeout ao verificar permissões administrativas');
      }
    }, 5000);

    // Inicializar verificação
    initializeAdmin();

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('AdminContext: Auth state change detectado:', {
          event,
          userId: session?.user?.id,
          email: session?.user?.email
        });
        
        if (event === 'SIGNED_OUT') {
          console.log('AdminContext: Usuário fez logout');
          setUser(null);
          setError(null);
          setIsLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('AdminContext: Usuário logado ou token renovado, reinicializando...');
          // Pequeno delay para evitar conflitos
          setTimeout(() => {
            if (mounted) {
              initializeAdmin();
            }
          }, 200);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
      console.log('AdminContext: Cleanup realizado');
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
