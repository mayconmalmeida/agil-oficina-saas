
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Updated type definition to include notification fields
export type UserProfile = {
  id?: string;
  nome_oficina?: string;
  telefone?: string;
  email?: string;
  full_name?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cnpj?: string;
  responsavel?: string;
  whatsapp_suporte?: string;
  logo_url?: string;
  plano?: string;
  created_at?: string;
  is_active?: boolean;
  trial_ends_at?: string;
  // Add notification fields
  notify_new_client?: boolean;
  notify_approved_budget?: boolean;
  notify_by_email?: boolean;
  sound_enabled?: boolean;
};

export function useUserProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setUserProfile(null);
          return;
        }
        
        // Set the userId so it can be used by components
        setUserId(user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setUserProfile(data);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserProfile();
  }, []);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado com sucesso",
      description: "Você foi desconectado da sua conta.",
    });
    navigate('/');
  };
  
  return { userProfile, loading, error, userId, handleLogout };
}
