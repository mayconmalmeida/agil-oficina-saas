
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
    let retryCount = 0;
    const maxRetries = 3;
    
    const initializeAdmin = async () => {
      if (retryCount >= maxRetries) {
        console.error('AdminContext: Máximo de tentativas atingido');
        if (mounted) {
          setUser(null);
          setError('Não foi possível verificar permissões administrativas após múltiplas tentativas');
          setIsLoading(false);
        }
        return;
      }

      try {
        console.log(`AdminContext: Tentativa ${retryCount + 1} de verificação de admin...`);
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

        console.log('AdminContext: Usuário encontrado:', {
          userId: session.user.id,
          email: session.user.email
        });
        
        // Primeiro verificar na tabela profiles se já tem role admin
        console.log('AdminContext: Verificando role na tabela profiles...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, email')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('AdminContext: Erro ao buscar perfil:', profileError);
        }

        console.log('AdminContext: Perfil encontrado:', {
          profile,
          role: profile?.role
        });

        // Se já tem role admin/superadmin no profiles, usar
        if (profile && (profile.role === 'admin' || profile.role === 'superadmin')) {
          console.log('AdminContext: ✅ Admin encontrado via profiles:', profile.role);
          
          if (mounted) {
            const adminUser: AdminUser = {
              id: session.user.id,
              email: profile.email || session.user.email || '',
              role: profile.role as AdminRole,
              isAdmin: true,
              canAccessFeatures: true
            };

            setUser(adminUser);
            setError(null);
            setIsLoading(false);
          }
          return;
        }

        // Se não tem role admin no profiles, verificar tabela admins
        console.log('AdminContext: Verificando na tabela admins...');
        
        try {
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('email, is_superadmin, is_active')
            .eq('email', session.user.email)
            .eq('is_active', true)
            .maybeSingle();

          console.log('AdminContext: Resultado da busca na tabela admins:', {
            adminData,
            adminError: adminError?.message,
            email: session.user.email
          });

          if (adminError) {
            console.error('AdminContext: Erro ao buscar na tabela admins:', adminError.message);
            
            // Se for erro 406 ou similar, considerar que não é admin
            if (adminError.code === 'PGRST116' || adminError.message.includes('406')) {
              console.log('AdminContext: ❌ Tabela admins inacessível ou não existe - usuário não é admin');
              throw new Error(`Usuário ${session.user.email} não é administrador`);
            }
            
            throw new Error(`Erro ao verificar admin: ${adminError.message}`);
          }

          if (!adminData) {
            console.log('AdminContext: ❌ Usuário não encontrado na tabela admins');
            throw new Error(`Usuário ${session.user.email} não é administrador`);
          }

          console.log('AdminContext: ✅ Admin encontrado na tabela admins');

          // Determinar role
          const adminRole: AdminRole = adminData.is_superadmin ? 'superadmin' : 'admin';
          
          // Sincronizar com tabela profiles
          console.log('AdminContext: Sincronizando com tabela profiles...');
          const { error: profileSyncError } = await supabase
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

          if (profileSyncError) {
            console.warn('AdminContext: Erro ao sincronizar perfil:', profileSyncError);
          } else {
            console.log('AdminContext: ✅ Perfil sincronizado');
          }

          if (mounted) {
            const adminUser: AdminUser = {
              id: session.user.id,
              email: adminData.email,
              role: adminRole,
              isAdmin: true,
              canAccessFeatures: true
            };

            setUser(adminUser);
            setError(null);
            setIsLoading(false);
          }
        } catch (adminTableError: any) {
          console.error('AdminContext: Erro na tabela admins:', adminTableError);
          
          if (mounted) {
            setUser(null);
            setError(adminTableError.message || 'Erro ao verificar permissões administrativas');
            setIsLoading(false);
          }
        }

      } catch (error: any) {
        console.error('AdminContext: ❌ Erro geral:', error);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`AdminContext: Tentando novamente em 2 segundos... (${retryCount}/${maxRetries})`);
          setTimeout(() => {
            if (mounted) {
              initializeAdmin();
            }
          }, 2000);
          return;
        }
        
        if (mounted) {
          setUser(null);
          setError(error.message || 'Erro ao verificar permissões administrativas');
          setIsLoading(false);
        }
      }
    };

    // Executar verificação inicial
    initializeAdmin();

    // Configurar listener de mudanças de auth - mas apenas para logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      console.log('AdminContext: Auth state change:', { event, userId: session?.user?.id });
      
      if (event === 'SIGNED_OUT') {
        console.log('AdminContext: Logout detectado, limpando estado');
        setUser(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      // Para SIGNED_IN, não fazer nada para evitar loop - a verificação inicial já cuida disso
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      console.log('AdminContext: Cleanup realizado');
    };
  }, []); // Dependências vazias para executar apenas uma vez

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
