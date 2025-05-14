
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Acesso não autorizado",
          description: "Você precisa fazer login para acessar este recurso.",
        });
        navigate('/login');
        return;
      }
      
      // Carregar informações do perfil
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error || !data) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar as informações do perfil.",
        });
      } else {
        setUserProfile(data);
      }
      
      setLoading(false);
    };
    
    checkUser();
  }, [navigate, toast]);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado com sucesso",
      description: "Você foi desconectado da sua conta.",
    });
    navigate('/');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Carregando...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-oficina-dark sm:text-4xl">
            Bem-vindo ao OficinaÁgil
          </h1>
          <p className="mt-3 text-xl text-oficina-gray">
            {userProfile?.nome_oficina}
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Seu Plano</CardTitle>
              <CardDescription>Detalhes da sua assinatura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Plano:</strong> {userProfile?.plano === 'premium' ? 'Premium' : 'Essencial'}</p>
                <p><strong>Status:</strong> Período de teste (7 dias)</p>
                <p className="text-green-600 font-medium">Sua assinatura está ativa!</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Início Rápido</CardTitle>
              <CardDescription>Primeiros passos para começar</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>✅ Criar sua conta</li>
                <li>▢ Configurar perfil da oficina</li>
                <li>▢ Adicionar seus primeiros clientes</li>
                <li>▢ Cadastrar produtos e serviços</li>
                <li>▢ Criar seu primeiro orçamento</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Suporte</CardTitle>
              <CardDescription>Precisa de ajuda?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Nossa equipe está pronta para ajudar você a aproveitar ao máximo o OficinaÁgil.</p>
              <Button className="w-full">Central de Ajuda</Button>
              <Button variant="outline" className="w-full">Contato</Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            variant="outline"
            onClick={handleLogout}
            className="text-oficina-gray"
          >
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
