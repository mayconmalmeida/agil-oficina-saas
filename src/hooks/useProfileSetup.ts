
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, ensureProfilesTable } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';

export const useProfileSetup = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [profileData, setProfileData] = useState({ nome_oficina: '', telefone: '' });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { updateProgress } = useOnboardingProgress(userId);

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
      
      try {
        // Verificar e garantir que a tabela profiles existe com as colunas necessárias
        await ensureProfilesTable();
        
        // Verificar se o perfil existe
        const { data, error } = await supabase
          .from('profiles')
          .select('nome_oficina, telefone')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error('Erro ao buscar perfil:', error);
          if (error.code === 'PGRST116') {
            console.log('Perfil não encontrado, criando um novo');
          } else {
            throw error;
          }
        }
          
        if (data) {
          setProfileData({
            nome_oficina: data.nome_oficina || '',
            telefone: data.telefone || ''
          });
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar perfil",
          description: "Ocorreu um erro ao buscar suas informações. Tente novamente mais tarde.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, [navigate, toast]);

  const handleProfileSaved = async () => {
    // Mark profile as completed
    if (userId) {
      await updateProgress('profile_completed', true);
      setSaveSuccess(true);
      
      // Navigate after a short delay to show the success state
      setTimeout(() => {
        navigate('/clientes');
      }, 1500);
    }
  };

  return { 
    isLoading, 
    userId, 
    profileData, 
    saveSuccess,
    handleProfileSaved 
  };
};
