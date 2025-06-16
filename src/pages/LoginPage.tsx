
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase, testSupabaseConnection } from "@/lib/supabase";
import LoginForm from '@/components/auth/LoginForm';
import { useLogin } from '@/hooks/useLogin';
import Loading from '@/components/ui/loading';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading, userId, handleLogin, setUserId, checkConnection } = useLogin();
  const [checkingSession, setCheckingSession] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Verificar conexão com o Supabase
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        setConnectionStatus('checking');
        console.log("Verificando conexão com Supabase na página de login...");
        const connected = await testSupabaseConnection();
        setConnectionStatus(connected ? 'connected' : 'error');
        
        if (!connected) {
          setConnectionError("Não foi possível conectar ao servidor. O sistema funcionará em modo de demonstração.");
          console.log("Conexão com Supabase falhou, usando modo demo");
        } else {
          console.log("Conexão com Supabase estabelecida com sucesso");
          setConnectionError(null);
        }
      } catch (error) {
        console.error("Erro ao verificar conexão:", error);
        setConnectionStatus('error');
        setConnectionError("Erro ao verificar conexão com o servidor: " + 
          (error instanceof Error ? error.message : "Erro desconhecido"));
      }
    };
    
    verifyConnection();
    
    // Re-verificar a cada minuto
    const intervalId = setInterval(verifyConnection, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Verificar se já está autenticado
  useEffect(() => {
    const checkSession = async () => {
      try {
        setCheckingSession(true);
        console.log("Verificando sessão existente na página de login...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao verificar sessão:", error);
          setCheckingSession(false);
          return;
        }
        
        if (session) {
          console.log("Sessão existente encontrada:", session.user.email);
          setUserId(session.user.id);
          
          // Verificar se é admin
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('role, nome_oficina, telefone')
              .eq('id', session.user.id)
              .maybeSingle();
                
            // Se é admin, redirecionar para admin
            if (profileData && (profileData.role === 'admin' || profileData.role === 'superadmin')) {
              console.log("Usuário é admin, redirecionando para dashboard admin");
              toast({
                title: "Login automático",
                description: "Você foi redirecionado para o painel de administração.",
              });
              navigate("/admin");
              return;
            }
            
            // Para usuários normais, verificar se o perfil existe e está completo
            if (profileError && profileError.code !== 'PGRST116') {
              console.log("Erro ao verificar profile:", profileError.message);
              // Em caso de erro, redirecionar para setup por segurança
              console.log("Erro na verificação do perfil, redirecionando para setup");
              toast({
                title: "Complete seu perfil",
                description: "Por favor, complete as informações da sua oficina.",
              });
              navigate('/perfil-setup');
              return;
            }
            
            if (!profileData) {
              // Perfil não existe, redirecionar para setup
              console.log("Perfil não encontrado, redirecionando para setup");
              toast({
                title: "Complete seu perfil",
                description: "Por favor, complete as informações da sua oficina.",
              });
              navigate('/perfil-setup');
              return;
            }
            
            // Verificar se o perfil está completo
            const isProfileComplete = profileData.nome_oficina && profileData.telefone &&
                                    profileData.nome_oficina.trim() !== '' && profileData.telefone.trim() !== '';
            
            if (!isProfileComplete) {
              console.log("Perfil incompleto detectado, redirecionando para setup");
              toast({
                title: "Complete seu perfil",
                description: "Por favor, complete as informações da sua oficina.",
              });
              navigate('/perfil-setup');
              return;
            }
            
          } catch (adminCheckError) {
            console.error("Erro ao verificar admin:", adminCheckError);
            // Em caso de erro, redirecionar para setup por segurança
            toast({
              title: "Complete seu perfil",
              description: "Por favor, complete as informações da sua oficina.",
            });
            navigate('/perfil-setup');
            return;
          }
          
          console.log("Perfil completo encontrado, redirecionando usuário para dashboard");
          navigate('/dashboard');
        } else {
          console.log("Nenhuma sessão encontrada, permanecendo na tela de login");
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      } finally {
        setCheckingSession(false);
      }
    };
    
    checkSession();
  }, [navigate, toast, setUserId]);

  if (checkingSession) {
    return <Loading fullscreen text="Verificando autenticação..." />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/" className="text-2xl font-bold text-oficina-dark">
            Oficina<span className="text-oficina-accent">Ágil</span>
          </Link>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Digite suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {connectionStatus === 'checking' && (
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <div className="animate-pulse flex items-center">
                  <div className="h-4 w-4 bg-blue-400 rounded-full mr-2"></div>
                  <AlertDescription className="text-blue-600">
                    Verificando conexão com o servidor...
                  </AlertDescription>
                </div>
              </Alert>
            )}
            
            {connectionStatus === 'error' && (
              <Alert className="mb-4 bg-yellow-50 border-yellow-300">
                <WifiOff className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  <strong>⚠️ Sistema em Modo de Demonstração</strong><br />
                  Estamos enfrentando problemas de conexão com o servidor.<br />
                  Algumas funcionalidades podem estar limitadas no momento.<br />
                  Enquanto isso, você pode explorar o sistema normalmente em modo de demonstração.
                </AlertDescription>
              </Alert>
            )}
            
            {connectionStatus === 'connected' && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Conexão com o servidor estabelecida.
                </AlertDescription>
              </Alert>
            )}
            
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              <Link to="/esqueceu-senha" className="text-oficina hover:underline">
                Esqueceu sua senha?
              </Link>
            </div>
            <div className="text-center text-sm">
              Não tem uma conta ainda?{' '}
              <Link to="/registrar" className="text-oficina hover:underline">
                Registre-se
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
