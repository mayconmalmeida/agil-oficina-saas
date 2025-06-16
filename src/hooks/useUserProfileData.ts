
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { fetchUserProfile, calculateCanAccessFeatures } from '@/services/authService';
import { AuthUser } from '@/types/auth';
import { UserSubscription } from '@/types/subscription';

export const useUserProfileData = (user: User | null) => {
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        console.log('useUserProfileData: Carregando perfil para usuário:', user.id);
        const userProfile = await fetchUserProfile(user.id);
        
        // Calcular se pode acessar funcionalidades
        const canAccessFeatures = calculateCanAccessFeatures(userProfile.subscription, userProfile.role);
        
        // Criar o perfil do usuário com todas as informações necessárias
        const authUser: AuthUser = {
          ...user,
          role: userProfile.role,
          isAdmin: userProfile.role === 'admin' || userProfile.role === 'superadmin',
          canAccessFeatures,
          subscription: userProfile.subscription ? {
            id: userProfile.subscription.id,
            user_id: user.id,
            created_at: userProfile.subscription.created_at || new Date().toISOString(),
            updated_at: userProfile.subscription.updated_at || new Date().toISOString(),
            plan_type: userProfile.subscription.plan_type as UserSubscription['plan_type'],
            status: userProfile.subscription.status as UserSubscription['status'],
            starts_at: userProfile.subscription.starts_at,
            ends_at: userProfile.subscription.ends_at || null,
            trial_ends_at: userProfile.subscription.trial_ends_at || null
          } : undefined,
          plano: userProfile.plano || 'Premium',
          trial_started_at: userProfile.trial_started_at
        };

        console.log('useUserProfileData: Perfil carregado:', {
          userId: authUser.id,
          email: authUser.email,
          role: authUser.role,
          isAdmin: authUser.isAdmin,
          canAccessFeatures: authUser.canAccessFeatures,
          plano: authUser.plano
        });

        setProfile(authUser);
        setRole(userProfile.role);
      } catch (error) {
        console.error('useUserProfileData: Erro ao carregar perfil:', error);
        
        // Em caso de erro, criar um perfil básico mas funcional
        const fallbackProfile: AuthUser = {
          ...user,
          role: 'user',
          isAdmin: false,
          canAccessFeatures: true, // Permitir acesso básico mesmo com erro
          plano: 'Premium' // Premium durante trial
        };
        
        setProfile(fallbackProfile);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  return { profile, loading, role };
};
