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
      try {
        const isConnected = await testSupabaseConnection();
        if (isConnected) {
          setConnectionStatus('connected');
          console.log("LoginPage: Conexão com Supabase estabelecida");
        } else {
          setConnectionStatus('error');
          setConnectionError('Não foi possível conectar ao banco de dados. Verificando em modo demo.');
          console.warn("LoginPage: Falha na conexão com Supabase");
        }
      } catch (error) {
        console.error("LoginPage: Erro ao testar conexão:", error);
        setConnectionStatus('error');
        setConnectionError('Erro de rede. Verificando configuração...');
      }
    };

    checkSupabaseConnection();
  }, []);

  // Verificar se já está autenticado usando o contexto de auth
  useEffect(() => {
    if (hasCheckedSession.current) return;
    
    const checkAuthAndRedirect = () => {
      console.log("LoginPage: Verificando sessão existente...");
      
      // Aguardar o contexto de auth carregar
      if (loading || isLoadingAuth) {
        console.log("LoginPage: Auth ainda carregando...");
        return;
      }

      hasCheckedSession.current = true;
      
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

    // Verificar a cada 500ms se o auth terminou de carregar
    const interval = setInterval(() => {
      if (!loading && !isLoadingAuth && !hasCheckedSession.current) {
        checkAuthAndRedirect();
        clearInterval(interval);
      }
    }, 500);

    // Timeout de segurança de 5 segundos
    const timeout = setTimeout(() => {
      if (!hasCheckedSession.current) {
        console.log("LoginPage: Timeout de verificação, assumindo não autenticado");
        hasCheckedSession.current = true;
        setCheckingSession(false);
      }
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">OficinaFlow</h1>
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
                await handleLogin(values);
              }}
              isLoading={isLoading}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center">
              <Link to="/reset-password" className="text-sm text-blue-600 hover:underline">
                Esqueceu sua senha?
              </Link>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-600">Não tem uma conta? </span>
              <Link to="/register" className="text-sm text-blue-600 hover:underline">
                Cadastre-se
              </Link>
            </div>
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