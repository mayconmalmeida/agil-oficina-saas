
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Phone, MessageSquare, Send } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';

// Schema for form validation
const supportSchema = z.object({
  whatsapp_suporte: z.string()
    .min(10, { message: "Número deve ter pelo menos 10 dígitos" })
    .max(15, { message: "Número não deve exceder 15 dígitos" }),
  message: z.string().optional()
});

interface SupportSettingsProps {
  userId?: string;
  initialValues?: {
    whatsapp_suporte?: string;
  };
}

const SupportSettings: React.FC<SupportSettingsProps> = ({ 
  userId,
  initialValues = {}
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  
  const form = useForm<z.infer<typeof supportSchema>>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      whatsapp_suporte: initialValues.whatsapp_suporte || '46991270777',
      message: ''
    }
  });
  
  const onSubmit = async (values: z.infer<typeof supportSchema>) => {
    // Get user ID from profile if not provided via props
    const effectiveUserId = userId || userProfile?.id;
    
    if (!effectiveUserId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "ID de usuário não encontrado. Faça login novamente.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Salvando número do WhatsApp:', values.whatsapp_suporte);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          whatsapp_suporte: values.whatsapp_suporte 
        })
        .eq('id', effectiveUserId);
        
      if (error) {
        console.error("Erro ao atualizar configurações:", error);
        throw error;
      }
      
      toast({
        title: "Configurações salvas",
        description: "Número do WhatsApp de suporte foi atualizado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as configurações. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async () => {
    const message = form.getValues('message');
    
    if (!message) {
      toast({
        variant: "destructive",
        title: "Mensagem vazia",
        description: "Por favor, escreva uma mensagem antes de enviar.",
      });
      return;
    }
    
    setIsSendingMessage(true);
    
    try {
      // In a real implementation, you would send this message to your backend
      // which would then use WhatsApp API to forward it to support
      console.log("Enviando mensagem para o suporte:", message);
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada para o suporte. Entraremos em contato em breve.",
      });
      
      // Clear message field after successful send
      form.setValue('message', '');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagem",
        description: error.message || "Não foi possível enviar sua mensagem. Tente novamente.",
      });
    } finally {
      setIsSendingMessage(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Suporte</CardTitle>
          <CardDescription>
            Defina o número do WhatsApp para suporte aos seus clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="whatsapp_suporte"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do WhatsApp de Suporte</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Phone className="mr-2 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="46991270777"
                          {...field}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Use o formato com DDD, sem +55 ou outros prefixos
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Configurações'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Contato com Suporte</CardTitle>
          <CardDescription>
            Envie uma mensagem diretamente para nossa equipe de suporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center text-sm font-medium mb-2">
              <Phone className="mr-2 h-4 w-4" />
              Suporte técnico: (46) 99127-0777
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Envie uma mensagem e entraremos em contato o mais rápido possível.
            </p>
          </div>
          
          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sua mensagem</FormLabel>
                    <FormControl>
                      <div className="flex items-start">
                        <MessageSquare className="mt-2 mr-2 h-4 w-4 text-gray-500" />
                        <Textarea
                          placeholder="Descreva sua dúvida ou problema..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="button" 
                onClick={handleSendMessage} 
                disabled={isSendingMessage}
              >
                {isSendingMessage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportSettings;
