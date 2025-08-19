
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Bell, Shield, Database, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ConfigurationsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      lowStockAlerts: true,
      osUpdates: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '30'
    },
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
      darkMode: false
    },
    integrations: {
      whatsapp: '',
      email: '',
      googleCalendar: false
    }
  });
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram atualizadas com sucesso.",
    });
  };

  const updateNotificationSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const updateSecuritySetting = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }));
  };

  const updateSystemSetting = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      system: {
        ...prev.system,
        [key]: value
      }
    }));
  };

  const updateIntegrationSetting = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [key]: value
      }
    }));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="system">
            <Database className="mr-2 h-4 w-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Mail className="mr-2 h-4 w-4" />
            Integrações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações por E-mail</Label>
                  <p className="text-sm text-gray-500">Receber notificações importantes por e-mail</p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateNotificationSetting('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-gray-500">Receber notificações em tempo real</p>
                </div>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) => updateNotificationSetting('pushNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertas de Estoque Baixo</Label>
                  <p className="text-sm text-gray-500">Notificar quando produtos estiverem com estoque baixo</p>
                </div>
                <Switch
                  checked={settings.notifications.lowStockAlerts}
                  onCheckedChange={(checked) => updateNotificationSetting('lowStockAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Atualizações de OS</Label>
                  <p className="text-sm text-gray-500">Notificar sobre mudanças de status nas ordens de serviço</p>
                </div>
                <Switch
                  checked={settings.notifications.osUpdates}
                  onCheckedChange={(checked) => updateNotificationSetting('osUpdates', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-gray-500">Adicionar camada extra de segurança</p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => updateSecuritySetting('twoFactorAuth', checked)}
                />
              </div>

              <div>
                <Label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSecuritySetting('sessionTimeout', e.target.value)}
                  className="mt-1 w-32"
                />
                <p className="text-sm text-gray-500 mt-1">Tempo em minutos para logout automático</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Backup Automático</Label>
                  <p className="text-sm text-gray-500">Realizar backup automático dos dados</p>
                </div>
                <Switch
                  checked={settings.system.autoBackup}
                  onCheckedChange={(checked) => updateSystemSetting('autoBackup', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Modo Escuro</Label>
                  <p className="text-sm text-gray-500">Usar tema escuro na interface</p>
                </div>
                <Switch
                  checked={settings.system.darkMode}
                  onCheckedChange={(checked) => updateSystemSetting('darkMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="whatsapp">WhatsApp Business</Label>
                <Input
                  id="whatsapp"
                  value={settings.integrations.whatsapp}
                  onChange={(e) => updateIntegrationSetting('whatsapp', e.target.value)}
                  placeholder="Número do WhatsApp Business"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail para Notificações</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.integrations.email}
                  onChange={(e) => updateIntegrationSetting('email', e.target.value)}
                  placeholder="email@oficina.com"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Google Calendar</Label>
                  <p className="text-sm text-gray-500">Sincronizar agendamentos com Google Calendar</p>
                </div>
                <Switch
                  checked={settings.integrations.googleCalendar}
                  onCheckedChange={(checked) => updateIntegrationSetting('googleCalendar', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave}>
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default ConfigurationsPage;
