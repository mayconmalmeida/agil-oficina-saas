
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LoginForm, { formSchema } from "@/components/admin/auth/LoginForm";
import AuthConnectionStatus from "@/components/admin/auth/AuthConnectionStatus";
import ErrorDisplay from "@/components/admin/auth/ErrorDisplay";
import AdminRegistrationButton from "@/components/admin/auth/AdminRegistrationButton";
import { useAdminAuth, FormValues } from "@/hooks/useAdminAuth";

const AdminLogin = () => {
  const { 
    isLoading, 
    connectionStatus, 
    errorMessage, 
    isRegistering,
    checkConnection,
    handleLogin,
    registerAdmin
  } = useAdminAuth();
  
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  useEffect(() => {
    checkConnection();
  }, []);

  const handleRegisterAdmin = async () => {
    await registerAdmin(form);
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
              onSubmit={handleLogin} 
              isLoading={isLoading} 
              isConnectionChecking={connectionStatus === 'checking'} 
            />
            
            <AdminRegistrationButton 
              onRegister={handleRegisterAdmin}
              isRegistering={isRegistering}
              isDisabled={connectionStatus !== 'connected'}
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
