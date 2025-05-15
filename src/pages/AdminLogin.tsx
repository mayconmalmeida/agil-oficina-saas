
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LoginForm, { formSchema } from "@/components/admin/auth/LoginForm";
import AuthConnectionStatus from "@/components/admin/auth/AuthConnectionStatus";
import ErrorDisplay from "@/components/admin/auth/ErrorDisplay";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import type { FormValues } from "@/hooks/admin/types";

const AdminLogin = () => {
  const { 
    isLoading, 
    connectionStatus, 
    errorMessage, 
    checkConnection,
    handleLogin
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
