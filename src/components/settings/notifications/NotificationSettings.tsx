import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Volume2, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface NotificationSettings {
  push_clientes: boolean;
  email_clientes: boolean;
  sms_agendamentos: boolean;
  push_agendamentos: boolean;
  email_agendamentos: boolean;
  sms_pagamentos: boolean;
  push_pagamentos: boolean;
  email_pagamentos: boolean;
  sound_enabled: boolean;
  desktop_notifications: boolean;
}

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    push_clientes: false,
    email_clientes: false,
    sms_agendamentos: false,
    push_agendamentos: true,
    email_agendamentos: true,
    sms_pagamentos: false,
    push_pagamentos: false,
    email_pagamentos: true,
    sound_enabled: true,
    desktop_notifications: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notificationSupport, setNotificationSupport] = useState({
    push: false,
    desktop: false,
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkNotificationSupport();
    loadSettings();
  }, [user?.id]);

  const checkNotificationSupport = () => {
    const support = {
      push: 'serviceWorker' in navigator && 'PushManager' in window,
      desktop: 'Notification' in window,
    };
    setNotificationSupport(support);
  };

  const loadSettings = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_settings')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.notification_settings) {
        setSettings(prev => ({
          ...prev,
          ...(typeof data.notification_settings === 'object' ? data.notification_settings : {}),
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        variant: "destructive",
        title: "Notificações não suportadas",
        description: "Seu navegador não suporta notificações.",
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      toast({
        variant: "destructive",
        title: "Notificações bloqueadas",
        description: "As notificações estão bloqueadas. Ative-as nas configurações do navegador.",
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast({
        title: "Notificações ativadas",
        description: "Você receberá notificações importantes do sistema.",
      });
      return true;
    }

    return false;
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('✅ Teste de Notificação - Oficina Go', {
        body: 'Suas notificações estão funcionando perfeitamente! Sistema configurado com sucesso.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false,
        silent: !settings.sound_enabled,
      });

      if (settings.sound_enabled) {
        // Criar um tom de notificação usando Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }

      // Auto-close notification after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      toast({
        title: "✅ Notificação enviada!",
        description: "Verifique se recebeu a notificação na área de trabalho.",
      });
    } else {
      requestNotificationPermission();
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          notification_settings: updatedSettings 
        })
        .eq('id', user.id);

      if (error) throw error;

      setSettings(updatedSettings);
      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchChange = (key: keyof NotificationSettings, value: boolean) => {
    if ((key === 'desktop_notifications' || key === 'push_agendamentos' || key === 'push_clientes' || key === 'push_pagamentos') && value) {
      requestNotificationPermission().then((granted) => {
        if (granted) {
          updateSettings({ [key]: value });
        }
      });
    } else {
      updateSettings({ [key]: value });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Notificações</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure como e quando você deseja receber notificações
        </p>
      </div>

      {/* Configurações de Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Configurações do Sistema
          </CardTitle>
          <CardDescription>
            Configurações gerais de notificações do navegador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Notificações do Desktop</label>
              <p className="text-xs text-muted-foreground">
                Receber notificações mesmo quando o site não estiver aberto
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!notificationSupport.desktop && (
                <Badge variant="destructive">Não suportado</Badge>
              )}
              <Switch
                checked={settings.desktop_notifications}
                onCheckedChange={(value) => handleSwitchChange('desktop_notifications', value)}
                disabled={!notificationSupport.desktop}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Som das Notificações</label>
              <p className="text-xs text-muted-foreground">
                Reproduzir som quando receber notificações
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.sound_enabled}
                onCheckedChange={(value) => handleSwitchChange('sound_enabled', value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={testNotification}
                className="gap-1"
              >
                <Volume2 className="w-3 h-3" />
                Testar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notificações de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Clientes
          </CardTitle>
          <CardDescription>
            Notificações relacionadas aos seus clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Push - Novos Clientes</label>
              <p className="text-xs text-muted-foreground">
                Notificação instantânea quando um novo cliente for cadastrado
              </p>
            </div>
            <Switch
              checked={settings.push_clientes}
              onCheckedChange={(value) => handleSwitchChange('push_clientes', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Email - Relatório de Clientes</label>
              <p className="text-xs text-muted-foreground">
                Receber relatório semanal por email sobre novos clientes
              </p>
            </div>
            <Switch
              checked={settings.email_clientes}
              onCheckedChange={(value) => handleSwitchChange('email_clientes', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notificações de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Agendamentos
          </CardTitle>
          <CardDescription>
            Notificações sobre agendamentos e lembretes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Push - Novos Agendamentos</label>
              <p className="text-xs text-muted-foreground">
                Notificação quando houver novos agendamentos
              </p>
            </div>
            <Switch
              checked={settings.push_agendamentos}
              onCheckedChange={(value) => handleSwitchChange('push_agendamentos', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Email - Confirmação de Agendamentos</label>
              <p className="text-xs text-muted-foreground">
                Receber confirmação por email dos agendamentos
              </p>
            </div>
            <Switch
              checked={settings.email_agendamentos}
              onCheckedChange={(value) => handleSwitchChange('email_agendamentos', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">SMS - Lembretes</label>
              <p className="text-xs text-muted-foreground">
                Enviar lembretes via SMS sobre agendamentos
              </p>
            </div>
            <Switch
              checked={settings.sms_agendamentos}
              onCheckedChange={(value) => handleSwitchChange('sms_agendamentos', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notificações de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Pagamentos
          </CardTitle>
          <CardDescription>
            Notificações sobre pagamentos e cobranças
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Push - Status de Pagamentos</label>
              <p className="text-xs text-muted-foreground">
                Notificação sobre alterações no status dos pagamentos
              </p>
            </div>
            <Switch
              checked={settings.push_pagamentos}
              onCheckedChange={(value) => handleSwitchChange('push_pagamentos', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Email - Confirmação de Pagamentos</label>
              <p className="text-xs text-muted-foreground">
                Receber confirmação por email dos pagamentos recebidos
              </p>
            </div>
            <Switch
              checked={settings.email_pagamentos}
              onCheckedChange={(value) => handleSwitchChange('email_pagamentos', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">SMS - Avisos de Cobrança</label>
              <p className="text-xs text-muted-foreground">
                Enviar avisos de cobrança via SMS para clientes
              </p>
            </div>
            <Switch
              checked={settings.sms_pagamentos}
              onCheckedChange={(value) => handleSwitchChange('sms_pagamentos', value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={testNotification} variant="outline">
          <Volume2 className="w-4 h-4 mr-2" />
          Testar Notificação
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;