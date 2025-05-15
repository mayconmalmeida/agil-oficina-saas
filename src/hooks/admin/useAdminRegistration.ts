
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useToast } from "@/hooks/use-toast";
import { FormValues } from './types';
import { createAdminUser } from './adminAuthUtils';

export const useAdminRegistration = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  // Esta função foi desabilitada conforme solicitado
  const registerAdmin = async (form: UseFormReturn<FormValues>) => {
    toast({
      variant: "destructive",
      title: "Acesso negado",
      description: "O cadastro de administradores está desativado.",
    });
    return;
  };

  return {
    isRegistering,
    errorMessage,
    registerAdmin,
  };
};
