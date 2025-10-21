import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase, testSupabaseConnection } from "@/lib/supabase";
import LoginForm from '@/components/auth/LoginForm';
import { useLogin } from '@/hooks/useLogin';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/loading';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading, userId, handleLogin, setUserId, checkConnection } = useLogin();
  const { user, loading, isLoadingAuth } = useAuth();
  const [checkingSession, setCheckingSession] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const hasCheckedSession = useRef(false);

  // Verificar conexão com Supabase
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      console.log("LoginPage: Verificando conexão com Supabase...");
      
      // Forçar status como conectado imediatamente para evitar loop
      setConnectionStatus('connected');
      
      try {
        const isConnected = await testSupabaseConnection();
        if (isConnected) {
          console.log("LoginPage: Conexão com Supabase estabelecida");
        } else {
          console.warn("LoginPage: Falha na conexão com Supabase");
          setConnectionError('Não foi possível conectar ao banco de dados. Continuando mesmo assim...');
        }
      } catch (error) {
        console.error("LoginPage: Erro ao testar conexão:", error);
        setConnectionError('Erro de rede. Continuando mesmo assim...');
      }
    };

    checkSupabaseConnection();
  }, []);

  // Verificar se já está autenticado usando o contexto de auth
  useEffect(() => {
    if (hasCheckedSession.current) return;
    
    // Definir um timeout máximo para a verificação de autenticação
    const authTimeout = setTimeout(() => {
      if (!hasCheckedSession.current) {
        console.log("LoginPage: Timeout na verificação de autenticação");
        hasCheckedSession.current = true;
        setCheckingSession(false);
      }
    }, 2000); // Timeout de 2 segundos
    
    const checkAuthAndRedirect = () => {
      console.log("LoginPage: Verificando sessão existente...");
      
      // Marcar como verificado ANTES de fazer a verificação para evitar loops
      hasCheckedSession.current = true;
      clearTimeout(authTimeout);
      
      // Se tiver usuário autenticado, redirecionar
      if (user && typeof user === 'object') {
        console.log("LoginPage: Usuário autenticado encontrado, redirecionando...");
        
        // Verificar se é admin
        if (user.role === 'admin' || user.role === 'superadmin') {
          console.log("LoginPage: Usuário é admin, redirecionando para /admin");
          navigate("/admin", { replace: true });
          return;
        }
        
        // Para usuários normais, redirecionar para dashboard
        console.log("LoginPage: Redirecionando para dashboard");
        navigate('/dashboard', { replace: true });
      } else {
        console.log("LoginPage: Nenhum usuário autenticado encontrado");
        setCheckingSession(false);
      }
    };

    // Só verificar se auth não está carregando
    if (!loading && !isLoadingAuth) {
      checkAuthAndRedirect();
    } else {
      // Se ainda estiver carregando, definir um limite de tempo para mostrar a tela de login
      setTimeout(() => {
        if (!hasCheckedSession.current) {
          console.log("LoginPage: Forçando exibição da tela de login após espera");
          hasCheckedSession.current = true;
          setCheckingSession(false);
        }
      }, 1000); // Mostrar tela de login após 1 segundo se auth ainda estiver carregando
    }

    return () => {
      clearTimeout(authTimeout);
    };
  }, [navigate, loading, isLoadingAuth, user]);

  if (checkingSession) {
    return <Loading fullscreen text="Verificando autenticação..." />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Oficina Go</h1>
            <p className="text-gray-600">Sistema de Gestão para Oficinas</p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Entrar na sua conta</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>

            {/* Status da Conexão */}
            {connectionStatus === 'checking' && (
              <Alert className="mb-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>Verificando conexão...</AlertDescription>
              </Alert>
            )}
            
            {connectionStatus === 'connected' && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Conectado ao servidor com sucesso
                </AlertDescription>
              </Alert>
            )}
            
            {connectionStatus === 'error' && (
              <Alert className="mb-4 border-yellow-200 bg-yellow-50" variant="default">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="space-y-1">
                    <p><strong>Modo Demo Ativo</strong></p>
                    <p className="text-sm">{connectionError}</p>
                    <p className="text-sm">Algumas funcionalidades podem estar limitadas.</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <LoginForm 
              onSubmit={async (values) => {
                console.log("LoginPage: Tentativa de login:", values.email);
                try {
                  console.log("LoginPage: Chamando handleLogin");
                  await handleLogin(values);
                  console.log("LoginPage: handleLogin concluído");
                } catch (error) {
                  console.error("LoginPage: Erro durante handleLogin", error);
                  toast({
                    variant: "destructive",
                    title: "Erro no login",
                    description: "Ocorreu um erro ao tentar fazer login. Tente novamente.",
                  });
                }
              }}
              isLoading={isLoading}
            />
          </CardContent>
          <CardFooter>
          </CardFooter>
        </Card>

        {connectionStatus === 'error' && (
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="text-gray-600"
            >
              <WifiOff className="h-4 w-4 mr-2" />
              Tentar Reconectar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;