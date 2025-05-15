
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useToast } from "@/hooks/use-toast";
import { FormValues } from './types';
import { createAdminUser } from './adminAuthUtils';

export const useAdminRegistration = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const registerAdmin = async (form: UseFormReturn<FormValues>) => {
    setIsRegistering(true);
    setErrorMessage(null);
    
    try {
      // Cadastrar o usuário admin
      const adminEmail = "mayconintermediacao@gmail.com";
      const adminPassword = "Admin@123";
      
      await createAdminUser(adminEmail, adminPassword);
      
      toast({
        title: "Administrador criado",
        description: "O usuário administrador foi cadastrado com sucesso.",
      });
      
      // Preencher os campos do formulário com as credenciais do admin
      form.setValue('email', adminEmail);
      form.setValue('password', adminPassword);
      
    } catch (error: any) {
      console.error("Erro ao cadastrar admin:", error);
      
      if (error.message.includes('already registered')) {
        setErrorMessage('Este email já está registrado. Tente fazer login.');
        toast({
          variant: "default",
          title: "Usuário já existe",
          description: "Este email já está registrado. Tente fazer login.",
        });
        
        // Preencher o email no formulário de login
        form.setValue('email', "mayconintermediacao@gmail.com");
      } else {
        setErrorMessage('Erro ao cadastrar administrador: ' + (error.message || ''));
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível cadastrar o administrador.",
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    isRegistering,
    errorMessage,
    registerAdmin,
  };
};
