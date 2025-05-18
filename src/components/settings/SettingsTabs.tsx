
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Lock, Palette, Bell, Phone, Upload } from 'lucide-react';

interface SettingsTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  children: React.ReactNode;
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({ 
  activeTab,
  setActiveTab,
  children
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6 grid grid-cols-3 md:grid-cols-6 gap-1">
        <TabsTrigger value="perfil" className="flex items-center">
          <Building className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">Oficina</span>
        </TabsTrigger>
        <TabsTrigger value="seguranca" className="flex items-center">
          <Lock className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">Segurança</span>
        </TabsTrigger>
        <TabsTrigger value="logo" className="flex items-center">
          <Upload className="w-4 h-4 mr-2" />
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
        <TabsTrigger value="suporte" className="flex items-center">
          <Phone className="w-4 h-4 mr-2" />
          <span className="hidden md:inline">Suporte</span>
        </TabsTrigger>
      </TabsList>
      
      {children}
    </Tabs>
  );
};

export default SettingsTabs;
