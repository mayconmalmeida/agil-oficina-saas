
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Building, User, Bell, Palette } from 'lucide-react';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { SecuritySection } from '@/components/settings/SecuritySection';
import LogoSettingsSection from '@/components/settings/LogoSettingsSection';
import AppearanceSection from '@/components/settings/AppearanceSection';
import NotificationsSettings from '@/components/settings/NotificationsSettings';
import { useSettingsPage } from '@/hooks/useSettingsPage';

const ConfiguracoesPage: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isLoading,
    isLoadingProfile,
    themeSetting,
    userProfile,
    userId,
    profileForm,
    passwordForm,
    handleUpdateProfile,
    handleChangePassword,
    handleLogout,
    toggleTheme
  } = useSettingsPage();

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-1">
              <TabsTrigger value="perfil" className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Oficina</span>
              </TabsTrigger>
              <TabsTrigger value="seguranca" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Segurança</span>
              </TabsTrigger>
              <TabsTrigger value="logo" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Logo</span>
              </TabsTrigger>
              <TabsTrigger value="aparencia" className="flex items-center">
                <Palette className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Aparência</span>
              </TabsTrigger>
              <TabsTrigger value="notificacoes" className="flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Notificações</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="perfil">
              <ProfileSection 
                form={profileForm} 
                onSubmit={handleUpdateProfile} 
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="seguranca">
              <SecuritySection 
                passwordForm={passwordForm}
                onPasswordChange={handleChangePassword}
                onLogout={handleLogout}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="logo">
              <LogoSettingsSection 
                userId={userId}
                initialLogo={userProfile?.logo_url}
              />
            </TabsContent>
            
            <TabsContent value="aparencia">
              <AppearanceSection 
                themeSetting={themeSetting} 
                onToggleTheme={toggleTheme}
              />
            </TabsContent>
            
            <TabsContent value="notificacoes">
              <NotificationsSettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguracoesPage;
