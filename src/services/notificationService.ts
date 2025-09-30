import { supabase } from '@/lib/supabase';

export interface NotificationSettings {
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

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
}

class NotificationService {
  private settings: NotificationSettings | null = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API não suportado:', error);
    }
  }

  async loadSettings(userId: string): Promise<NotificationSettings> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_settings')
        .eq('id', userId)
        .single();

      if (error) throw error;

      this.settings = (data?.notification_settings ? 
        (typeof data.notification_settings === 'string' ? 
          JSON.parse(data.notification_settings) : 
          data.notification_settings) as NotificationSettings : null) || {
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
      };

      return this.settings;
    } catch (error) {
      console.error('Erro ao carregar configurações de notificação:', error);
      return this.getDefaultSettings();
    }
  }

  private getDefaultSettings(): NotificationSettings {
    return {
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
    };
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notificações não suportadas neste navegador');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notificações foram negadas pelo usuário');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  private playNotificationSound() {
    if (!this.audioContext || !this.settings?.sound_enabled) {
      return;
    }

    try {
      // Criar um som de notificação agradável
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Configurar frequências para um som mais agradável
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);
      
      // Configurar volume com fade out
      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);
      
      oscillator.type = 'sine';
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.6);
    } catch (error) {
      console.warn('Erro ao reproduzir som de notificação:', error);
    }
  }

  async showNotification(data: NotificationData): Promise<boolean> {
    if (!this.settings?.desktop_notifications) {
      console.log('Notificações do desktop estão desabilitadas');
      return false;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      return false;
    }

    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: data.tag || 'oficina-go-notification',
        requireInteraction: data.requireInteraction || false,
        silent: !this.settings?.sound_enabled,
        data: data.data,
      });

      // Reproduzir som se habilitado
      if (this.settings?.sound_enabled) {
        this.playNotificationSound();
      }

      // Auto-close após 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Se há dados customizados, pode executar ações específicas
        if (data.data?.action) {
          this.handleNotificationAction(data.data.action, data.data.payload);
        }
      };

      return true;
    } catch (error) {
      console.error('Erro ao exibir notificação:', error);
      return false;
    }
  }

  private handleNotificationAction(action: string, payload?: any) {
    switch (action) {
      case 'navigate':
        if (payload?.url) {
          window.location.href = payload.url;
        }
        break;
      case 'focus-tab':
        // Apenas focar na aba atual
        break;
      default:
        console.log('Ação de notificação não reconhecida:', action);
    }
  }

  // Métodos específicos para diferentes tipos de notificação
  async notifyNewClient(clientName: string): Promise<boolean> {
    if (!this.settings?.push_clientes) return false;

    return this.showNotification({
      title: '👤 Novo Cliente Cadastrado',
      body: `${clientName} foi adicionado ao sistema`,
      tag: 'new-client',
      data: {
        type: 'client',
        action: 'navigate',
        payload: { url: '/dashboard/clientes' }
      }
    });
  }

  async notifyNewAppointment(clientName: string, date: string): Promise<boolean> {
    if (!this.settings?.push_agendamentos) return false;

    return this.showNotification({
      title: '📅 Novo Agendamento',
      body: `${clientName} agendou um serviço para ${date}`,
      tag: 'new-appointment',
      requireInteraction: true,
      data: {
        type: 'appointment',
        action: 'navigate',
        payload: { url: '/dashboard/agendamentos' }
      }
    });
  }

  async notifyPaymentReceived(amount: number, clientName: string): Promise<boolean> {
    if (!this.settings?.push_pagamentos) return false;

    return this.showNotification({
      title: '💰 Pagamento Recebido',
      body: `R$ ${amount.toFixed(2)} recebido de ${clientName}`,
      tag: 'payment-received',
      data: {
        type: 'payment',
        action: 'navigate',
        payload: { url: '/dashboard/financeiro' }
      }
    });
  }

  async testNotification(): Promise<boolean> {
    return this.showNotification({
      title: '✅ Teste de Notificação - Oficina Go',
      body: 'Suas notificações estão funcionando perfeitamente! Sistema configurado com sucesso.',
      tag: 'test-notification',
      data: {
        type: 'test',
        action: 'focus-tab'
      }
    });
  }

  // Verificar suporte do navegador
  static isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  static getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }
}

// Instância singleton
export const notificationService = new NotificationService();
export default NotificationService;