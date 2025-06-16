
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  nome_oficina?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cnpj?: string;
  responsavel?: string;
  role?: string;
  whatsapp_suporte?: string;
  logo_url?: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      if (!user?.id) {
        if (mounted) {
          setProfile(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!mounted) return;

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
          setError(profileError.message);
          setProfile(null);
        } else if (data) {
          setProfile(data);
        }
      } catch (err: any) {
        console.error('Erro ao buscar perfil:', err);
        if (mounted) {
          setError(err.message || 'Erro desconhecido');
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [user?.id]); // Só depende do ID do usuário

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Atualizar o estado local
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.message);
      return false;
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refetch: () => {
      if (user?.id) {
        setIsLoading(true);
        // O useEffect vai fazer o refetch automaticamente
      }
    }
  };
};
