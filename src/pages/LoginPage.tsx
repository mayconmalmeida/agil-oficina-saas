
import React, { useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import LoginForm from '@/components/auth/LoginForm';
import { useLogin } from '@/hooks/useLogin';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading, handleLogin, setUserId } = useLogin();

  // Verificar se já está autenticado
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        
        // Verificar se é admin
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('email', session.user.email)
          .single();
          
        if (adminData) {
          toast({
            title: "Login automático",
            description: "Você foi redirecionado para o painel de administração.",
          });
          navigate("/admin/dashboard");
        } else {
          // Se não for admin, verificar próximo passo do onboarding
          try {
            const { data: onboardingData } = await supabase
              .from('onboarding_status')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            if (onboardingData) {
              if (!onboardingData.profile_completed) navigate('/perfil-oficina');
              else if (!onboardingData.clients_added) navigate('/clientes');
              else if (!onboardingData.services_added) navigate('/produtos-servicos');
              else if (!onboardingData.budget_created) navigate('/orcamentos/novo');
              else navigate('/dashboard');
            } else {
              navigate('/perfil-oficina');
            }
          } catch (error) {
            console.error("Erro ao verificar status de onboarding:", error);
            navigate('/perfil-oficina');
          }
        }
      }
    };
    
    checkSession();
  }, [navigate, toast, setUserId]);

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
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Link to="/esqueceu-senha" className="text-oficina hover:underline text-center text-sm w-full">
              Esqueceu sua senha?
            </Link>
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
