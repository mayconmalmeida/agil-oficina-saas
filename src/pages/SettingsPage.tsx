
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Key, User, LogOut } from "lucide-react";
import Loading from '@/components/ui/loading';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, loading, handleLogout } = useUserProfile();
  
  if (loading) {
    return <Loading fullscreen text="Carregando configurações..." />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Conta
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings className="h-4 w-4 mr-2" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="security">
            <Key className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <p className="text-gray-700">{userProfile?.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-gray-700">{userProfile?.email}</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/perfil/editar')}
                className="mt-4"
              >
                Editar Perfil
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Personalize a aparência e comportamento do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Configurações adicionais do sistema serão implementadas em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Gerencie suas credenciais de acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Alteração de Senha</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Para alterar sua senha, você pode usar a funcionalidade de recuperação de senha.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/esqueceu-senha')}
                  >
                    Recuperar senha
                  </Button>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Encerrar Sessão</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Clique no botão abaixo para sair da sua conta.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
