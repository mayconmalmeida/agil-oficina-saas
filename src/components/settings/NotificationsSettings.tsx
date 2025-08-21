
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Bell, Save, Volume2, VolumeX } from 'lucide-react';

interface NotificationSettings {
  email_agendamentos: boolean;
  email_pagamentos: boolean;
  email_clientes: boolean;
  push_agendamentos: boolean;
  push_pagamentos: boolean;
  push_clientes: boolean;
  push_sound_enabled: boolean;
}

const NotificationsSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    email_agendamentos: true,
    email_pagamentos: true,
    email_clientes: false,
    push_agendamentos: true,
    push_pagamentos: false,
    push_clientes: false,
    push_sound_enabled: true,
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

      const settingsJson = JSON.parse(JSON.stringify(settings));

      const { error } = await supabase
        .from('profiles')
        .update({ notification_settings: settingsJson })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

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
    if (settings.push_agendamentos || settings.push_pagamentos || settings.push_clientes) {
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log('Permissão de notificação concedida');
            
            // Testar notificação com som
            if (settings.push_sound_enabled) {
              new Notification('Notificações ativadas!', {
                body: 'Você receberá notificações com som.',
                icon: '/favicon.ico',
                tag: 'test-notification'
              });
            }
          }
        }
      }
    }

    console.log('Configurações de notificação aplicadas:', settings);
  };

  const testPushNotification = () => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('Teste de notificação', {
        body: settings.push_sound_enabled 
          ? 'Esta é uma notificação de teste com som ativado.'
          : 'Esta é uma notificação de teste sem som.',
        icon: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false
      });

      if (settings.push_sound_enabled) {
        // Criar um som de notificação simples
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }

      setTimeout(() => notification.close(), 3000);
    } else {
      toast({
        variant: "destructive",
        title: "Permissão negada",
        description: "Permita as notificações no navegador para testar."
      });
    }
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
        <h2 className="text-lg font-medium flex items-center text-gray-900 dark:text-white">
          <Bell className="mr-2 h-5 w-5" />
          Notificações
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure como deseja receber notificações</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Notificações por Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Agendamentos</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Receber emails sobre novos agendamentos</div>
              </div>
              <Switch
                checked={settings.email_agendamentos}
                onCheckedChange={(value) => handleSettingChange('email_agendamentos', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Pagamentos</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Receber emails sobre pagamentos recebidos</div>
              </div>
              <Switch
                checked={settings.email_pagamentos}
                onCheckedChange={(value) => handleSettingChange('email_pagamentos', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Novos Clientes</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Receber emails quando novos clientes se cadastrarem</div>
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
            <CardTitle className="text-gray-900 dark:text-white">Notificações Push</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white flex items-center">
                  {settings.push_sound_enabled ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
                  Som das Notificações
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Reproduzir som ao receber notificações push</div>
              </div>
              <Switch
                checked={settings.push_sound_enabled}
                onCheckedChange={(value) => handleSettingChange('push_sound_enabled', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Agendamentos</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Receber notificações push sobre agendamentos</div>
              </div>
              <Switch
                checked={settings.push_agendamentos}
                onCheckedChange={(value) => handleSettingChange('push_agendamentos', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Pagamentos</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Receber notificações push sobre pagamentos</div>
              </div>
              <Switch
                checked={settings.push_pagamentos}
                onCheckedChange={(value) => handleSettingChange('push_pagamentos', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Novos Clientes</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Receber notificações push sobre novos clientes</div>
              </div>
              <Switch
                checked={settings.push_clientes}
                onCheckedChange={(value) => handleSettingChange('push_clientes', value)}
              />
            </div>

            <Button 
              variant="outline" 
              onClick={testPushNotification}
              className="w-full"
            >
              <Bell className="mr-2 h-4 w-4" />
              Testar Notificação Push
            </Button>
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
