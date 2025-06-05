
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
import { testBasicConnection, ConnectionResult } from "@/hooks/admin/utils/connectionUtils";
import { AlertTriangle } from "lucide-react";

const AdminLogin = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error' | 'cors-error' | 'timeout'>('checking');
  const [connectionDetails, setConnectionDetails] = useState<ConnectionResult | null>(null);
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
        console.log("🔍 Verificando conexão com Supabase na página de admin login...");
        
        const result = await testBasicConnection();
        setConnectionDetails(result);
        
        if (result.isConnected) {
          console.log("✅ Conexão com Supabase estabelecida");
          setConnectionStatus('connected');
          setErrorMessage(null);
        } else {
          console.error("❌ Falha na conexão com Supabase:", result.error);
          
          // Determinar tipo específico de erro
          if (result.error?.includes('CORS') || result.error?.includes('Access-Control-Allow-Origin')) {
            setConnectionStatus('cors-error');
          } else if (result.statusCode === 408 || result.error?.includes('Timeout')) {
            setConnectionStatus('timeout');
          } else {
            setConnectionStatus('error');
          }
          
          setErrorMessage(result.error || "Erro de conexão desconhecido");
        }
      } catch (error) {
        console.error("💥 Erro ao verificar conexão:", error);
        setConnectionStatus('error');
        setErrorMessage(
          "Erro ao verificar conexão com o servidor: " + 
          (error instanceof Error ? error.message : "Erro desconhecido")
        );
      }
    };
    
    checkConnection();
    
    // Verificar conexão a cada 30 segundos, mas só se estivermos com erro
    const intervalId = setInterval(() => {
      if (connectionStatus === 'error' || connectionStatus === 'cors-error' || connectionStatus === 'timeout') {
        console.log("🔄 Tentando reconectar...");
        checkConnection();
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [connectionStatus]);

  // Função para lidar com o login do administrador
  const onSubmit = async (values: FormValues) => {
    if (connectionStatus !== 'connected') {
      setErrorMessage("Não é possível fazer login sem uma conexão estável com o servidor. Por favor, resolva os problemas de conectividade primeiro.");
      return;
    }
    
    await handleLogin(values);
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
            <AuthConnectionStatus 
              status={connectionStatus} 
              errorDetails={connectionDetails?.error}
            />
            <ErrorDisplay message={errorMessage} />
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Informação Importante</span>
              </div>
              <p className="text-xs text-blue-700">
                Administradores são gerenciados através da role na tabela 'profiles'. 
                Para criar um admin, execute no SQL Editor: 
                <br />
                <code className="bg-blue-100 px-1 rounded text-xs">
                  UPDATE profiles SET role = 'admin' WHERE email = 'seu@email.com'
                </code>
              </p>
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
            
            {connectionStatus !== 'connected' && (
              <div className="text-center text-xs text-gray-500 mt-2">
                <p>Problemas de conexão? Verifique:</p>
                <ul className="text-left mt-1 ml-4">
                  <li>• Configurações de CORS no Supabase</li>
                  <li>• Status do serviço em status.supabase.com</li>
                  <li>• Sua conexão de internet</li>
                </ul>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
