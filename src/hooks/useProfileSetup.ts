
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { Profile } from '@/utils/supabaseTypes';

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
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("Nenhuma sessão encontrada, redirecionando para login");
          toast({
            variant: "destructive",
            title: "Acesso não autorizado",
            description: "Você precisa fazer login para configurar seu perfil.",
          });
          navigate('/login');
          return;
        }
        
        console.log("Sessão encontrada para usuário:", session.user.email);
        setUserId(session.user.id);
        
        // Check if profile exists
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.log('Perfil não encontrado ou erro ao buscar:', error.message);
          if (error.code === 'PGRST116') {
            console.log('Perfil não encontrado, criando um novo');
            // If no profile exists, we'll create one when the user submits the form
          } else {
            console.error('Erro ao buscar perfil:', error);
          }
        } else if (data) {
          console.log('Perfil encontrado:', data);
          const profile = data as Profile;
          setProfileData({
            nome_oficina: profile.nome_oficina || '',
            telefone: profile.telefone || ''
          });
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error);
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
      console.log("Atualizando progresso de onboarding após salvar perfil");
      const updated = await updateProgress('profile_completed', true);
      
      if (updated) {
        setSaveSuccess(true);
        
        // Navigate after a short delay to show the success state
        setTimeout(() => {
          console.log("Redirecionando para próxima etapa: clientes");
          navigate('/clientes');
        }, 1500);
      } else {
        toast({
          variant: "destructive",
          title: "Atenção",
          description: "Seu perfil foi salvo, mas não conseguimos atualizar seu progresso. Clique em 'Próxima Etapa' manualmente.",
        });
        setSaveSuccess(true);
      }
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
