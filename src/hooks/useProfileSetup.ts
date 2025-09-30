
import React, { useState, useEffect } from 'react';
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
        console.log('Verificando usuário na página de setup...');
        
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
        
        // Buscar perfil existente
        const { data: existingProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar perfil:', error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar perfil",
            description: "Ocorreu um erro ao buscar suas informações.",
          });
        } else if (existingProfile) {
          console.log('Perfil existente encontrado:', existingProfile);
          const profile = existingProfile as Profile;
          
          // Verificar se já está completo
          const isComplete = profile.nome_oficina && profile.telefone && 
                           profile.nome_oficina.trim() !== '' && profile.telefone.trim() !== '';
          
          if (isComplete) {
            console.log('Perfil já está completo, redirecionando para dashboard');
            toast({
              title: "Perfil já configurado",
              description: "Seu perfil já está completo. Redirecionando para o dashboard.",
            });
            navigate('/dashboard');
            return;
          }
          
          setProfileData({
            nome_oficina: profile.nome_oficina || '',
            telefone: profile.telefone || ''
          });
        } else {
          console.log('Nenhum perfil encontrado, criando um novo registro básico');
          // Criar perfil básico se não existir
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              nome_oficina: '',
              telefone: '',
              role: 'user'
            });
            
          if (createError) {
            console.error('Erro ao criar perfil inicial:', createError);
            toast({
              variant: "destructive",
              title: "Erro ao criar perfil",
              description: "Ocorreu um erro ao criar seu perfil. Tente novamente.",
            });
          } else {
            console.log('Perfil inicial criado com sucesso');
          }
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
    console.log("Perfil salvo com sucesso, processando próximos passos...");
    
    if (userId) {
      // Marcar perfil como completo no onboarding
      console.log("Atualizando progresso de onboarding após salvar perfil");
      const updated = await updateProgress('profile_completed', true);
      
      setSaveSuccess(true);
      
      toast({
        title: "Perfil configurado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      
      // Redirecionar após um pequeno delay para mostrar o sucesso
      setTimeout(() => {
        console.log("Redirecionando para dashboard");
        navigate('/dashboard');
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
