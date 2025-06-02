
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useToast } from "@/hooks/use-toast";
import { FormValues } from './types';

export const useAdminRegistration = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  // Função desabilitada - admins são gerenciados via role na tabela profiles
  const registerAdmin = async (form: UseFormReturn<FormValues>) => {
    toast({
      variant: "destructive",
      title: "Funcionalidade desativada",
      description: "Administradores são gerenciados através da role na tabela profiles, não por uma tabela separada.",
    });
    return;
  };

  return {
    isRegistering,
    errorMessage,
    registerAdmin,
  };
};
