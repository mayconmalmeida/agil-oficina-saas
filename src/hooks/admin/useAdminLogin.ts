
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminContext } from '@/contexts/AdminContext';
import { FormValues } from './types';

export const useAdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { loginAdmin } = useAdminContext();
  const navigate = useNavigate();
  
  const handleLogin = async (values: FormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("🔐 Usando contexto admin para login:", values.email);
      
      const success = await loginAdmin(values.email, values.password);
      
      if (success) {
        console.log("✅ Login admin bem-sucedido, redirecionando");
        navigate("/admin");
      } else {
        setErrorMessage("Falha no login. Verifique suas credenciais.");
      }
    } catch (error: any) {
      console.error("💥 Erro no hook de login admin:", error);
      setErrorMessage(error.message || 'Ocorreu um erro durante o login.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    errorMessage,
    handleLogin,
  };
};
