
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { useSettingsPage } from '@/hooks/useSettingsPage';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { SecuritySection } from '@/components/settings/SecuritySection';
import LogoSettingsSection from '@/components/settings/LogoSettingsSection';
import AppearanceSection from '@/components/settings/AppearanceSection';
import NotificationsSettings from '@/components/settings/NotificationsSettings';
import SupportContact from '@/components/settings/SupportContact';
import SettingsContainer from '@/components/settings/SettingsContainer';

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
  
  if (isLoadingProfile) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }
  
  return (
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
        <NotificationsSettings />
      </TabsContent>
      
      <TabsContent value="suporte">
        <SupportContact 
          supportPhone={userProfile?.whatsapp_suporte || '46991270777'}
        />
      </TabsContent>
    </SettingsContainer>
  );
};

export default SettingsPage;
