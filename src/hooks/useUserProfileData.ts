
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { fetchUserProfile } from '@/services/authService';
import { AuthUser } from '@/types/auth';

export function useUserProfileData(user: User | null) {
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    console.log('useUserProfileData: Iniciando com usuário:', user?.email || 'nenhum');
    
    if (!user) {
      console.log('useUserProfileData: Usuário não encontrado, limpando estado');
      setProfile(null);
      setRole(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      try {
        console.log('useUserProfileData: Carregando perfil para:', user.id);
        setLoading(true);
        
        const userProfile = await fetchUserProfile(user.id);
        
        if (!isMounted) return;

        console.log('useUserProfileData: Perfil carregado:', {
          id: userProfile.id,
          email: userProfile.email,
          role: userProfile.role,
          isActive: userProfile.is_active
        });
        
        // Criar o objeto AuthUser com todas as propriedades necessárias
        const authUser: AuthUser = {
          ...user,
          role: userProfile.role,
          isAdmin: userProfile.role === 'admin' || userProfile.role === 'superadmin',
          canAccessFeatures: true, // Será calculado no useOptimizedAuth
          subscription: userProfile.subscription,
          trial_ends_at: userProfile.trial_started_at ? 
            new Date(new Date(userProfile.trial_started_at).getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString() : 
            undefined,
          plano: userProfile.plano,
          trial_started_at: userProfile.trial_started_at,
          // Adicionar propriedades do perfil
          nome_oficina: userProfile.nome_oficina,
          telefone: userProfile.telefone || undefined,
          is_active: userProfile.is_active
        };

        setProfile(authUser);
        setRole(userProfile.role);
        
      } catch (error) {
        console.error('useUserProfileData: Erro ao carregar perfil:', error);
        if (!isMounted) return;
        
        // Em caso de erro, criar um perfil básico
        const basicAuthUser: AuthUser = {
          ...user,
          role: 'user',
          isAdmin: false,
          canAccessFeatures: true
        };
        
        setProfile(basicAuthUser);
        setRole('user');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { profile, loading, role };
}
