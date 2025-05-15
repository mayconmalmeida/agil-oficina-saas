
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Key, 
  User, 
  LogOut, 
  Building,
  Bell,
  Shield,
  Palette,
  HelpCircle
} from "lucide-react";
import Loading from '@/components/ui/loading';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, loading, handleLogout } = useUserProfile();
  const { toast } = useToast();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  
  const handleProfileEdit = () => {
    navigate('/perfil/editar');
  };
  
  const handleCompanyEdit = () => {
    navigate('/configuracoes/oficina');
  };
  
  const handlePasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        userProfile?.email || '',
        { redirectTo: `${window.location.origin}/perfil/editar` }
      );
      
      if (error) throw error;
      
      toast({
        title: "Email enviado",
        description: "Enviamos um email com instruções para redefinir sua senha.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível enviar o email de recuperação.",
      });
    }
  };
  
  const handlePreferenceChange = (preference: string, value: boolean) => {
    // In a real app, we would save these preferences to the user's profile
    switch (preference) {
      case 'notifications':
        setNotificationsEnabled(value);
        break;
      case 'darkMode':
        setDarkMode(value);
        break;
      case 'compactMode':
        setCompactMode(value);
        break;
    }
    
    toast({
      title: "Preferência salva",
      description: "Sua configuração foi atualizada com sucesso.",
    });
  };
  
  if (loading) {
    return <Loading fullscreen text="Carregando configurações..." />;
  }
  
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="account" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Conta
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center">
            <Building className="h-4 w-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            Preferências
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center">
            <HelpCircle className="h-4 w-4 mr-2" />
            Ajuda
          </TabsTrigger>
        </TabsList>
        
        {/* Conta */}
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
                onClick={handleProfileEdit}
                className="mt-4"
              >
                Editar Perfil
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Empresa */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Gerencie os dados da sua oficina
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome da Oficina</label>
                  <p className="text-gray-700">{userProfile?.nome_oficina || "Não informado"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">CNPJ</label>
                  <p className="text-gray-700">{userProfile?.cnpj || "Não informado"}</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleCompanyEdit}
                className="mt-4"
              >
                Editar Dados da Empresa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notificações */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Gerencie como você recebe notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificações por Email</p>
                  <p className="text-sm text-gray-500">Receba lembretes de agendamentos por email</p>
                </div>
                <Switch 
                  checked={notificationsEnabled} 
                  onCheckedChange={(value) => handlePreferenceChange('notifications', value)} 
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Novidades e Atualizações</p>
                  <p className="text-sm text-gray-500">Receba informações sobre novas funcionalidades</p>
                </div>
                <Switch 
                  checked={notificationsEnabled} 
                  onCheckedChange={(value) => handlePreferenceChange('notifications', value)} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Preferências */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferências do Sistema</CardTitle>
              <CardDescription>
                Personalize a aparência e comportamento do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Modo Escuro</p>
                  <p className="text-sm text-gray-500">Ativar tema escuro no sistema</p>
                </div>
                <Switch 
                  checked={darkMode} 
                  onCheckedChange={(value) => handlePreferenceChange('darkMode', value)} 
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Modo Compacto</p>
                  <p className="text-sm text-gray-500">Reduzir espaçamento entre elementos</p>
                </div>
                <Switch 
                  checked={compactMode} 
                  onCheckedChange={(value) => handlePreferenceChange('compactMode', value)} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Segurança */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Gerencie suas credenciais de acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Alteração de Senha</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Receba um email para alterar sua senha atual.
                </p>
                <Button 
                  variant="outline" 
                  onClick={handlePasswordReset}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Redefinir senha
                </Button>
              </div>
              
              <Separator />
              
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
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Ajuda */}
        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>Central de Ajuda</CardTitle>
              <CardDescription>
                Suporte e recursos para resolver dúvidas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Documentação</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Acesse nossa documentação completa com tutoriais e guias.
                </p>
                <Button variant="outline">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Abrir documentação
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Suporte Técnico</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Entre em contato com nossa equipe de suporte.
                </p>
                <Button variant="outline">
                  Contatar suporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
