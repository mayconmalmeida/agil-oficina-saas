
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminLogin } from '@/hooks/admin/useAdminLogin';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/admin/auth/LoginForm';

const AdminLoginPage: React.FC = () => {
  const { isLoading, errorMessage, handleLogin } = useAdminLogin();
  const { user, isAdmin, isLoadingAuth } = useAuth();

  console.log('AdminLoginPage: Estado:', {
    user: user?.email,
    isAdmin,
    isLoadingAuth
  });

  // Se já está logado como admin, redirecionar
  if (!isLoadingAuth && user && isAdmin) {
    console.log('AdminLoginPage: Admin já logado, redirecionando para /admin');
    return <Navigate to="/admin" replace />;
  }

  // Se está logado mas não é admin, mostrar formulário
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Painel Administrativo</h2>
          <p className="mt-2 text-sm text-gray-600">
            Faça login para acessar o painel de administração
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login de Administrador</CardTitle>
            <CardDescription>
              Digite suas credenciais de administrador para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              isConnectionChecking={false}
            />
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-gray-500">
          <p>Apenas administradores autorizados podem acessar este painel.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
