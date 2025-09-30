
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const useProfileEdit = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [profileData, setProfileData] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkUser = async () => {
      try {
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
        
        // Fetch user profile data
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error('Erro ao carregar perfil:', error);
          toast({
            variant: "destructive",
            title: "Erro ao carregar perfil",
            description: error.message,
          });
          return;
        }
        
        setProfileData(profile);
      } catch (error) {
        console.error('Erro inesperado:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, [navigate, toast]);
  
  const handleProfileSaved = () => {
    setSaveSuccess(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };
  
  return {
    isLoading,
    userId,
    profileData,
    saveSuccess,
    handleProfileSaved
  };
};
