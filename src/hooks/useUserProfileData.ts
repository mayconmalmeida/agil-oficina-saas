
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export const useUserProfileData = (user: User | null) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      if (!user?.id) {
        if (mounted) {
          setProfile(null);
          setRole(null);
          setLoading(false);
        }
        return;
      }

      try {
        console.log('Buscando perfil do usuário:', user.id);
        
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (!mounted) return;

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar perfil:', error);
          setProfile(null);
          setRole('user');
        } else {
          const userRole = profileData?.role || 'user';
          console.log('Perfil encontrado:', profileData, 'Role:', userRole);
          setProfile(profileData);
          setRole(userRole);
        }
      } catch (error) {
        console.error('Erro inesperado ao buscar perfil:', error);
        if (mounted) {
          setProfile(null);
          setRole('user');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  return { profile, loading, role };
};
