
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  profileExists: boolean;
}

export const useProfileCompletionCheck = (userId?: string) => {
  const [isChecking, setIsChecking] = useState(true);
  const [profileStatus, setProfileStatus] = useState<ProfileCompletionStatus>({
    isComplete: false,
    missingFields: [],
    profileExists: false
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkProfileCompletion = async (uid: string) => {
    try {
      setIsChecking(true);
      
      // Buscar perfil do usuário
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar perfil:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível verificar seu perfil."
        });
        return;
      }

      // Campos obrigatórios para oficina
      const requiredFields = ['nome_oficina', 'telefone', 'email'];
      const missingFields: string[] = [];

      if (!profile) {
        // Perfil não existe
        setProfileStatus({
          isComplete: false,
          missingFields: requiredFields,
          profileExists: false
        });
        return;
      }

      // Verificar campos obrigatórios
      requiredFields.forEach(field => {
        if (!profile[field] || profile[field].trim() === '') {
          missingFields.push(field);
        }
      });

      const isComplete = missingFields.length === 0;

      setProfileStatus({
        isComplete,
        missingFields,
        profileExists: true
      });

      // Se não está completo, redirecionar para configuração
      if (!isComplete) {
        console.log('Perfil incompleto, redirecionando para configuração');
        navigate('/perfil-setup');
      }

    } catch (error) {
      console.error('Erro inesperado ao verificar perfil:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao verificar seu perfil."
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (userId) {
      checkProfileCompletion(userId);
    } else {
      setIsChecking(false);
    }
  }, [userId]);

  return {
    isChecking,
    profileStatus,
    recheckProfile: () => userId && checkProfileCompletion(userId)
  };
};
