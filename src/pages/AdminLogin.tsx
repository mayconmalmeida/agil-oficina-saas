
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import LoginForm, { formSchema } from "@/components/admin/auth/LoginForm";
import AuthConnectionStatus from "@/components/admin/auth/AuthConnectionStatus";
import ErrorDisplay from "@/components/admin/auth/ErrorDisplay";
import { useForm } from "react-hook-form";
import type { FormValues } from "@/hooks/admin/types";
import { useAdminLogin } from "@/hooks/admin/useAdminLogin";
import { testSupabaseConnection } from "@/lib/supabase";

const AdminLogin = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { isLoading, handleLogin } = useAdminLogin();
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  // Verificar conexão com Supabase quando o componente montar
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('checking');
        const isConnected = await testSupabaseConnection();
        
        if (isConnected) {
          console.log("Conexão com Supabase estabelecida");
          setConnectionStatus('connected');
          setErrorMessage(null);
        } else {
          console.error("Falha na conexão com Supabase");
          setConnectionStatus('error');
          setErrorMessage("Não foi possível conectar ao servidor. Conecte o Supabase para ativar funcionalidades de backend.");
        }
      } catch (error) {
        console.error("Erro ao verificar conexão:", error);
        setConnectionStatus('error');
        setErrorMessage("Erro ao verificar conexão com o servidor.");
      }
    };
    
    checkConnection();
  }, []);

  // Função para lidar com o login do administrador
  const onSubmit = async (values: FormValues) => {
    if (connectionStatus === 'error') {
      setErrorMessage("Não é possível fazer login sem uma conexão com o servidor. Por favor, conecte o Supabase primeiro.");
      return;
    }
    
    await handleLogin(values);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais de administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthConnectionStatus status={connectionStatus} />
            <ErrorDisplay message={errorMessage} />
            
            <LoginForm 
              onSubmit={onSubmit} 
              isLoading={isLoading} 
              isConnectionChecking={connectionStatus === 'checking'} 
            />
          </CardContent>
          <CardFooter className="flex justify-center flex-col space-y-2">
            <Button
              variant="link"
              onClick={() => navigate("/")}
            >
              Voltar para a página inicial
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
