
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { fetchUserProfile, UserProfile } from '@/services/authService';

export const useUserProfileData = (user: User | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        setRole(null);
        setLoading(false);
        return;
      }

      console.log('useUserProfileData: Iniciando com usuário:', user.email);
      setLoading(true);

      try {
        console.log('useUserProfileData: Carregando perfil para:', user.id);
        const userProfile = await fetchUserProfile(user.id);
        
        console.log('useUserProfileData: Perfil carregado:', {
          id: userProfile.id,
          email: userProfile.email,
          role: userProfile.role,
          is_active: userProfile.is_active,
          subscription: !!userProfile.subscription
        });

        setProfile(userProfile);
        setRole(userProfile.role);
      } catch (error) {
        console.error('useUserProfileData: Erro ao carregar perfil:', error);
        setProfile(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  return { profile, loading, role };
};
