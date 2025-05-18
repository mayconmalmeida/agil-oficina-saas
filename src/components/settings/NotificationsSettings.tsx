
import React, { useState } from 'react';
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

// Schema for notifications settings
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
  const { userProfile } = useUserProfile();
  
  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      notify_new_client: userProfile?.notify_new_client || true,
      notify_approved_budget: userProfile?.notify_approved_budget || true,
      notify_by_email: userProfile?.notify_by_email || false,
      sound_enabled: userProfile?.sound_enabled || false
    }
  });
  
  const onSubmit = async (values: NotificationsFormValues) => {
    if (!userProfile?.id) {
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
        .eq('id', userProfile.id);
        
      if (error) throw error;
      
      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificações foram atualizadas.",
      });
      
      // Store sound setting in localStorage to persist between sessions
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
  
  // Effect to play a test sound when sound setting is enabled
  const playTestSound = () => {
    const sound = new Audio('/notification.mp3');  // You'll need to add this audio file
    sound.volume = 0.5;
    sound.play().catch(err => console.log('Audio playback failed:', err));
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-gray-500" />
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
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-gray-500" />
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
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
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
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Tema Sonoro</p>
                    <p className="text-sm text-muted-foreground">
                      Ativar sons ao receber notificações
                    </p>
                  </div>
                </div>
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
            
            <Button type="submit" disabled={isLoading}>
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
