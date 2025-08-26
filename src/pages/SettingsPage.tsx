import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { useSettingsPage } from '@/hooks/useSettingsPage';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { SecuritySection } from '@/components/settings/SecuritySection';
import LogoSettingsSection from '@/components/settings/LogoSettingsSection';
import AppearanceSection from '@/components/settings/AppearanceSection';
import NotificationSettings from '@/components/settings/notifications/NotificationSettings';
import SupportSettings from '@/components/settings/support/SupportSettings';
import SettingsContainer from '@/components/settings/SettingsContainer';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const SettingsPage: React.FC = () => {
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
  
  const isMobile = useIsMobile();
  
  if (isLoadingProfile) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }
  
  return (
    <div className="relative">
      {/* Botão Sair fixo no topo direito */}
      <div className={`absolute z-10 ${isMobile ? 'right-4 top-4' : 'right-8 top-8'}`}>
        <Button
          variant="destructive"
          onClick={handleLogout}
          title="Sair"
          className={`flex items-center gap-2 ${isMobile ? 'px-3 py-2 text-sm' : ''}`}
        >
          <LogOut className={`mr-1 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
          {!isMobile && 'Sair'}
        </Button>
      </div>
      
      <SettingsContainer activeTab={activeTab} setActiveTab={setActiveTab}>
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
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="suporte">
          <SupportSettings 
            userId={userId}
            initialValues={{ whatsapp_suporte: userProfile?.whatsapp_suporte || '46999324779' }}
          />
        </TabsContent>
      </SettingsContainer>
    </div>
  );
};

export default SettingsPage;