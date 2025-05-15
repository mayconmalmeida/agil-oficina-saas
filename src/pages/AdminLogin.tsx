
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
import { createPredefinedAdmin } from "@/utils/adminSetup";
import { UserPlus, Loader2, AlertTriangle } from "lucide-react";

const AdminLogin = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [createAdminError, setCreateAdminError] = useState<string | null>(null);
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
        console.log("Verificando conexão com Supabase na página de admin login...");
        const isConnected = await testSupabaseConnection();
        
        if (isConnected) {
          console.log("Conexão com Supabase estabelecida");
          setConnectionStatus('connected');
          setErrorMessage(null);
        } else {
          console.error("Falha na conexão com Supabase");
          setConnectionStatus('error');
          setErrorMessage(
            "Não foi possível conectar ao servidor. Conecte o Supabase para ativar funcionalidades de backend."
          );
        }
      } catch (error) {
        console.error("Erro ao verificar conexão:", error);
        setConnectionStatus('error');
        setErrorMessage(
          "Erro ao verificar conexão com o servidor: " + 
          (error instanceof Error ? error.message : "Erro desconhecido")
        );
      }
    };
    
    checkConnection();
    
    // Verificar conexão a cada 30 segundos
    const intervalId = setInterval(checkConnection, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Função para lidar com o login do administrador
  const onSubmit = async (values: FormValues) => {
    if (connectionStatus === 'error') {
      setErrorMessage("Não é possível fazer login sem uma conexão com o servidor. Por favor, conecte o Supabase primeiro.");
      return;
    }
    
    await handleLogin(values);
  };

  // Função para criar o usuário admin predefinido
  const handleCreateAdmin = async () => {
    if (connectionStatus === 'error') {
      setErrorMessage("Não é possível criar um admin sem uma conexão com o servidor. Por favor, conecte o Supabase primeiro.");
      return;
    }
    
    setIsCreatingAdmin(true);
    setCreateAdminError(null);
    
    try {
      const result = await createPredefinedAdmin();
      
      // Preencher o formulário com as credenciais predefinidas
      form.setValue('email', 'mayconintermediacao@gmail.com');
      form.setValue('password', 'Oficina@123');
      
    } catch (error: any) {
      console.error("Erro ao criar admin:", error);
      setCreateAdminError(error.message || "Erro ao criar admin");
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8">
        <Card className="shadow-lg border-t-4 border-t-blue-600">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais de administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthConnectionStatus status={connectionStatus} />
            <ErrorDisplay message={errorMessage} />
            
            <div className="mb-6">
              <Button 
                onClick={handleCreateAdmin}
                disabled={isCreatingAdmin || connectionStatus !== 'connected'}
                variant="outline"
                className="w-full bg-green-50 border-green-300 hover:bg-green-100"
              >
                {isCreatingAdmin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Configurando admin...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4 text-green-600" />
                    Criar Admin (mayconintermediacao@gmail.com)
                  </>
                )}
              </Button>
              
              {createAdminError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {createAdminError}
                </div>
              )}
              
              {connectionStatus === 'connected' && !createAdminError && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Primeiro clique aqui para criar o usuário admin predefinido
                </p>
              )}
            </div>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">OU FAÇA LOGIN</span>
              </div>
            </div>
            
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
