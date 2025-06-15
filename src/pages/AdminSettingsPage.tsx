
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Lock, Palette } from "lucide-react";
import AdminProfileSection from "@/components/admin/settings/AdminProfileSection";
import AdminSecuritySection from "@/components/admin/settings/AdminSecuritySection";
import AdminAppearanceSection from "@/components/admin/settings/AdminAppearanceSection";
import { useAdminSettings } from "@/hooks/admin/useAdminSettings";

const AdminSettingsPage: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    adminProfile,
    theme,
    onThemeToggle,
    onUpdateProfile,
    onChangePassword,
    isLoading,
    error,
    onLogout,
  } = useAdminSettings();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 sm:px-4">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <CardTitle>Configurações do Painel Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 grid grid-cols-3 gap-1">
                <TabsTrigger value="perfil" className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="seguranca" className="flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Segurança
                </TabsTrigger>
                <TabsTrigger value="aparencia" className="flex items-center">
                  <Palette className="w-4 h-4 mr-2" />
                  Aparência
                </TabsTrigger>
              </TabsList>
              <TabsContent value="perfil">
                <AdminProfileSection
                  adminProfile={adminProfile}
                  onSubmit={onUpdateProfile}
                  isLoading={isLoading}
                  error={error}
                />
              </TabsContent>
              <TabsContent value="seguranca">
                <AdminSecuritySection
                  onChangePassword={onChangePassword}
                  onLogout={onLogout}
                  isLoading={isLoading}
                  error={error}
                />
              </TabsContent>
              <TabsContent value="aparencia">
                <AdminAppearanceSection theme={theme} onThemeToggle={onThemeToggle} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
