
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Bell, Save } from 'lucide-react';

interface NotificationSettings {
  email_agendamentos: boolean;
  email_pagamentos: boolean;
  email_clientes: boolean;
  push_agendamentos: boolean;
  push_pagamentos: boolean;
  push_clientes: boolean;
  sms_agendamentos: boolean;
  sms_pagamentos: boolean;
}

const NotificationsSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    email_agendamentos: true,
    email_pagamentos: true,
    email_clientes: false,
    push_agendamentos: true,
    push_pagamentos: false,
    push_clientes: false,
    sms_agendamentos: false,
    sms_pagamentos: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('notification_settings')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar configurações:', error);
        return;
      }

      if (data && data.notification_settings) {
        const notificationSettings = data.notification_settings as any;
        setSettings({ ...settings, ...notificationSettings });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Usuário não autenticado"
        });
        return;
      }

      // Convert settings to JSON format for database storage
      const settingsJson = JSON.parse(JSON.stringify(settings));

      const { error } = await supabase
        .from('profiles')
        .update({ notification_settings: settingsJson })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Aplicar as configurações de notificação
      await applyNotificationSettings();

      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas."
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as configurações."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const applyNotificationSettings = async () => {
    // Configurar notificações push se habilitadas
    if (settings.push_agendamentos || settings.push_pagamentos || settings.push_clientes) {
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log('Permissão de notificação concedida');
          }
        }
      }
    }

    // Implementar outras configurações de notificação conforme necessário
    console.log('Configurações de notificação aplicadas:', settings);
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Notificações
        </h2>
        <p className="text-sm text-gray-500">Configure como deseja receber notificações</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notificações por Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Agendamentos</div>
                <div className="text-sm text-gray-500">Receber emails sobre novos agendamentos</div>
              </div>
              <Switch
                checked={settings.email_agendamentos}
                onCheckedChange={(value) => handleSettingChange('email_agendamentos', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Pagamentos</div>
                <div className="text-sm text-gray-500">Receber emails sobre pagamentos recebidos</div>
              </div>
              <Switch
                checked={settings.email_pagamentos}
                onCheckedChange={(value) => handleSettingChange('email_pagamentos', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Novos Clientes</div>
                <div className="text-sm text-gray-500">Receber emails quando novos clientes se cadastrarem</div>
              </div>
              <Switch
                checked={settings.email_clientes}
                onCheckedChange={(value) => handleSettingChange('email_clientes', value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações Push</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Agendamentos</div>
                <div className="text-sm text-gray-500">Receber notificações push sobre agendamentos</div>
              </div>
              <Switch
                checked={settings.push_agendamentos}
                onCheckedChange={(value) => handleSettingChange('push_agendamentos', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Pagamentos</div>
                <div className="text-sm text-gray-500">Receber notificações push sobre pagamentos</div>
              </div>
              <Switch
                checked={settings.push_pagamentos}
                onCheckedChange={(value) => handleSettingChange('push_pagamentos', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Novos Clientes</div>
                <div className="text-sm text-gray-500">Receber notificações push sobre novos clientes</div>
              </div>
              <Switch
                checked={settings.push_clientes}
                onCheckedChange={(value) => handleSettingChange('push_clientes', value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações por SMS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Agendamentos</div>
                <div className="text-sm text-gray-500">Receber SMS sobre agendamentos importantes</div>
              </div>
              <Switch
                checked={settings.sms_agendamentos}
                onCheckedChange={(value) => handleSettingChange('sms_agendamentos', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Pagamentos</div>
                <div className="text-sm text-gray-500">Receber SMS sobre pagamentos recebidos</div>
              </div>
              <Switch
                checked={settings.sms_pagamentos}
                onCheckedChange={(value) => handleSettingChange('sms_pagamentos', value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationsSettings;
