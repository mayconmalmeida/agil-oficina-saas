
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, Mail, Volume2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/hooks/useUserProfile';

const notificationsSchema = z.object({
  notify_new_client: z.boolean().default(true),
  notify_approved_budget: z.boolean().default(true),
  notify_by_email: z.boolean().default(false),
  sound_enabled: z.boolean().default(false)
});

export type NotificationsFormValues = z.infer<typeof notificationsSchema>;

const NotificationsSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { userProfile, userId } = useUserProfile();
  
  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      notify_new_client: true,
      notify_approved_budget: true,
      notify_by_email: false,
      sound_enabled: false
    }
  });
  
  // Atualizar valores do form quando o perfil carregar
  useEffect(() => {
    if (userProfile) {
      form.reset({
        notify_new_client: userProfile.notify_new_client ?? true,
        notify_approved_budget: userProfile.notify_approved_budget ?? true,
        notify_by_email: userProfile.notify_by_email ?? false,
        sound_enabled: userProfile.sound_enabled ?? false
      });
    }
  }, [userProfile, form]);
  
  const onSubmit = async (values: NotificationsFormValues) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não encontrado. Por favor, faça login novamente.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notify_new_client: values.notify_new_client,
          notify_approved_budget: values.notify_approved_budget,
          notify_by_email: values.notify_by_email,
          sound_enabled: values.sound_enabled
        })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificações foram atualizadas.",
      });
      
      // Armazenar configuração de som no localStorage
      localStorage.setItem('sound_enabled', values.sound_enabled ? 'true' : 'false');
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar configurações",
        description: error.message || "Ocorreu um erro ao salvar suas preferências.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Som de teste
  const playTestSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
      
      toast({
        title: "Som de teste",
        description: "Assim você será notificado sobre eventos importantes.",
      });
    } catch (error) {
      console.log('Erro ao reproduzir som:', error);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências de Notificações</CardTitle>
        <CardDescription>
          Configure como você deseja ser notificado sobre eventos importantes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Novo Cliente</p>
                    <p className="text-sm text-muted-foreground">
                      Receber alerta quando um novo cliente for cadastrado
                    </p>
                  </div>
                </div>
                <Switch
                  checked={form.watch('notify_new_client')}
                  onCheckedChange={(checked) => form.setValue('notify_new_client', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Orçamento Aprovado</p>
                    <p className="text-sm text-muted-foreground">
                      Receber notificação quando um orçamento for aprovado
                    </p>
                  </div>
                </div>
                <Switch
                  checked={form.watch('notify_approved_budget')}
                  onCheckedChange={(checked) => form.setValue('notify_approved_budget', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Notificações por E-mail</p>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações também por e-mail
                    </p>
                  </div>
                </div>
                <Switch
                  checked={form.watch('notify_by_email')}
                  onCheckedChange={(checked) => form.setValue('notify_by_email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Tema Sonoro</p>
                    <p className="text-sm text-muted-foreground">
                      Ativar sons ao receber notificações
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={playTestSound}
                    className="text-xs"
                  >
                    Testar
                  </Button>
                  <Switch
                    checked={form.watch('sound_enabled')}
                    onCheckedChange={(checked) => {
                      form.setValue('sound_enabled', checked);
                      if (checked) {
                        playTestSound();
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Preferências'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default NotificationsSettings;
