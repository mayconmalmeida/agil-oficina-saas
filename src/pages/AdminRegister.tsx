
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import DashboardHeader from "@/components/admin/DashboardHeader";

const AdminRegister = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      // Verificar role na tabela profiles ao invés da tabela admins
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error || !profileData) {
        await supabase.auth.signOut();
        navigate('/admin/login');
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Você não tem permissão de administrador.",
        });
      } else if (profileData.role !== 'admin' && profileData.role !== 'superadmin') {
        navigate('/admin/dashboard');
        toast({
          variant: "destructive",
          title: "Acesso restrito",
          description: "Apenas super administradores podem acessar esta funcionalidade.",
        });
      } else {
        setIsAuthorized(true);
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Verificando permissões...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Gerenciamento de Administradores"
        onLogout={handleLogout} 
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              Funcionalidade Desativada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Sistema de Administradores Refatorado
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p className="mb-3">
                    O cadastro de administradores foi refatorado para usar apenas a tabela 'profiles'. 
                    Não utilizamos mais uma tabela separada 'admins'.
                  </p>
                  
                  <div className="bg-yellow-100 p-3 rounded border">
                    <p className="font-medium mb-2">Para criar um novo administrador:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Acesse o SQL Editor no painel do Supabase</li>
                      <li>Execute o comando:</li>
                    </ol>
                    <code className="block mt-2 p-2 bg-gray-800 text-green-400 rounded text-xs">
                      UPDATE profiles SET role = 'admin' WHERE email = 'email@admin.com';
                    </code>
                    <p className="mt-2 text-xs">
                      Substitua 'email@admin.com' pelo email do usuário que deve ser admin.
                    </p>
                  </div>
                  
                  <p className="mt-3 text-xs">
                    O usuário deve ter uma conta criada no sistema antes de ser promovido a admin.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/dashboard')}
              >
                Voltar ao Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRegister;
