
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

        console.log('AdminContext: Usuário encontrado, verificando permissões admin...');
        
        // ✅ PRIMEIRO BUSCAR NA TABELA ADMINS PELO EMAIL
        const { data: admin, error: adminError } = await supabase
          .from('admins')
          .select('email, is_superadmin')
          .eq('email', session.user.email)
          .maybeSingle();

        if (adminError) {
          console.error('AdminContext: Erro ao buscar na tabela admins:', adminError);
          throw adminError;
        }

        if (!admin) {
          console.log('AdminContext: Usuário não encontrado na tabela admins');
          throw new Error('Acesso negado: usuário não é administrador');
        }

        // ✅ SE ENCONTRADO NA TABELA ADMINS, BUSCAR/CRIAR PERFIL NA PROFILES
        let profile;
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('role, email')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.warn('AdminContext: Erro ao buscar perfil:', profileError);
        }

        if (!existingProfile) {
          // Criar perfil admin se não existir
          console.log('AdminContext: Criando perfil admin...');
          const adminRole = admin.is_superadmin ? 'superadmin' : 'admin';
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              email: admin.email,
              role: adminRole,
              is_active: true,
              created_at: new Date().toISOString()
            })
            .select('role, email')
            .single();

          if (createError) {
            console.error('AdminContext: Erro ao criar perfil admin:', createError);
            // Usar dados da tabela admins mesmo se falhar
            profile = {
              email: admin.email,
              role: adminRole
            };
          } else {
            profile = newProfile;
          }
        } else {
          profile = existingProfile;
        }

        if (mounted) {
          const adminUser: AdminUser = {
            id: session.user.id,
            email: profile.email || session.user.email || '',
            role: (profile.role as 'admin' | 'superadmin') || (admin.is_superadmin ? 'superadmin' : 'admin'),
            isAdmin: true,
            canAccessFeatures: true
          };

          console.log('AdminContext: Admin autenticado com sucesso:', adminUser.email, 'role:', adminUser.role);
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

    // Timeout de segurança mais generoso para admin - 5 segundos
    timeoutId = setTimeout(() => {
      if (mounted && isLoading) {
        console.warn('AdminContext: Timeout de segurança atingido, mas continuando...');
        setIsLoading(false);
        // NÃO definir erro aqui - permitir que o usuário continue se já estiver autenticado
      }
    }, 5000);

    // Inicializar verificação
    initializeAdmin();

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('AdminContext: Auth state change:', event);
        
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
