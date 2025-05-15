
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAdminLogin } from './admin/useAdminLogin';
import { useAdminRegistration } from './admin/useAdminRegistration';
import { verifyConnection } from './admin/connectionUtils';
import { checkAdminStatus } from './admin/adminAuthUtils';
import { FormValues } from './admin/types';
import { UseFormReturn } from 'react-hook-form';

export { FormValues } from './admin/types';

export const useAdminAuth = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Import subfunctionalities from smaller hooks
  const { isLoading, handleLogin } = useAdminLogin();
  const { isRegistering, registerAdmin } = useAdminRegistration();
  
  const checkConnection = async () => {
    try {
      const result = await verifyConnection();
      
      if (result.success) {
        setConnectionStatus('connected');
        
        // Check admin status if session exists
        if (result.session) {
          return checkAdminStatus(result.session);
        }
      } else {
        setConnectionStatus('error');
        setErrorMessage(result.error);
      }
      return false;
    } catch (error) {
      console.error("Erro na verificação da conexão:", error);
      setConnectionStatus('error');
      setErrorMessage('Ocorreu um erro ao verificar a conexão.');
      return false;
    }
  };

  return {
    isLoading,
    connectionStatus,
    errorMessage,
    isRegistering,
    checkConnection,
    handleLogin,
    registerAdmin
  };
};
