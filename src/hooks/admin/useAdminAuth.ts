
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useLogin } from '../useLogin';
import { testSupabaseConnection } from '@/lib/supabase';
import type { FormValues } from './types';
import { UseFormReturn } from 'react-hook-form';

export type { FormValues } from './types';

export const useAdminAuth = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error' | 'cors-error' | 'timeout'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Usar o hook de login regular ao invés de lógica separada
  const { isLoading, handleLogin } = useLogin();
  
  const checkConnection = async () => {
    try {
      const connected = await testSupabaseConnection();
      
      if (connected) {
        setConnectionStatus('connected');
        setErrorMessage(null);
      } else {
        setConnectionStatus('error');
        setErrorMessage('Não foi possível conectar ao servidor');
      }
      return connected;
    } catch (error) {
      console.error("Erro na verificação da conexão:", error);
      setConnectionStatus('error');
      setErrorMessage('Ocorreu um erro ao verificar a conexão.');
      return false;
    }
  };

  // Função de registro desativada - admins são criados via role na tabela profiles
  const registerAdmin = async (form: UseFormReturn<FormValues>) => {
    toast({
      variant: "destructive",
      title: "Acesso negado",
      description: "O cadastro de administradores deve ser feito através da atribuição de role na tabela profiles.",
    });
    return;
  };

  return {
    isLoading,
    connectionStatus,
    errorMessage,
    isRegistering: false,
    checkConnection,
    handleLogin,
    registerAdmin
  };
};
