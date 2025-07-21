
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2, Shield } from "lucide-react";
import { useAdminAuth } from '@/hooks/useAdminAuth';
import LoginForm from '@/components/admin/auth/LoginForm';
import ErrorDisplay from '@/components/admin/auth/ErrorDisplay';
import ConnectionStatus from '@/components/admin/auth/ConnectionStatus';
import AdminInfo from '@/components/admin/auth/AdminInfo';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { 
    isLoading, 
    connectionStatus, 
    errorMessage,
    checkConnection, 
    handleLogin 
  } = useAdminAuth();

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const onSubmit = async (values: { email: string; password: string }) => {
    const success = await handleLogin(values);
    if (success) {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Admin Login
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                Acesse o painel administrativo
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <ConnectionStatus 
              status={connectionStatus}
              errorMessage={errorMessage}
            />

            <ErrorDisplay message={errorMessage} />

            <AdminInfo />

            <LoginForm
              onSubmit={onSubmit}
              isLoading={isLoading}
              isConnectionChecking={connectionStatus === 'checking'}
            />

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                disabled={isLoading}
                className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                ← Voltar para a página inicial
              </Button>
            </div>
          </CardContent>
        </Card>

        {connectionStatus === 'error' && (
          <Card className="mt-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="text-center text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-2">Problemas de conexão?</p>
                <ul className="text-left space-y-1 max-w-xs mx-auto">
                  <li>• Verifique sua conexão de internet</li>
                  <li>• Configurações de CORS no Supabase</li>
                  <li>• Status do serviço em status.supabase.com</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminLoginPage;
