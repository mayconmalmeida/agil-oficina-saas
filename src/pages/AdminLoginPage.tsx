
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminContext } from '@/contexts/AdminContext';
import { Loader2, Shield } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
  const { user, isLoading: isLoadingContext, error, loginAdmin } = useAdminContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  console.log('AdminLoginPage: Estado:', {
    user: user?.email,
    isAdmin: user?.isAdmin,
    isLoadingContext
  });

  // Se já está logado como admin, redirecionar
  if (!isLoadingContext && user && user.isAdmin) {
    console.log('AdminLoginPage: Admin já logado, redirecionando para /admin');
    return <Navigate to="/admin" replace />;
  }

  // Se ainda está carregando, mostrar loading simples
  if (isLoadingContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    try {
      const success = await loginAdmin(email, password);
      if (success) {
        console.log('AdminLoginPage: Login bem-sucedido, redirecionando');
        navigate('/admin');
      }
    } catch (err: any) {
      console.error('AdminLoginPage: Erro no submit:', err);
      setLoginError(err.message || 'Erro durante o login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Painel Administrativo</h2>
          <p className="mt-2 text-sm text-gray-600">
            Faça login para acessar o painel de administração
          </p>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Login de Administrador</CardTitle>
            <CardDescription>
              Digite suas credenciais de administrador para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(error || loginError) && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error || loginError}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@oficinagil.com.br"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar como Admin'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-gray-500">
          <p>Apenas administradores autorizados podem acessar este painel.</p>
          <p className="mt-2 text-xs">
            O login é validado através da tabela <code className="bg-gray-100 px-1 rounded">admins</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
