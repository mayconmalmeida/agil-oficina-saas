
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const useUserProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Acesso não autorizado",
          description: "Você precisa fazer login para acessar este recurso.",
        });
        navigate('/login');
        return;
      }
      
      setUserId(session.user.id);
      
      // Carregar informações do perfil
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error || !data) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar as informações do perfil.",
        });
      } else {
        setUserProfile(data);
      }
      
      setLoading(false);
    };
    
    checkUser();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado com sucesso",
      description: "Você foi desconectado da sua conta.",
    });
    navigate('/');
  };

  return {
    userProfile,
    loading,
    userId,
    handleLogout
  };
};
