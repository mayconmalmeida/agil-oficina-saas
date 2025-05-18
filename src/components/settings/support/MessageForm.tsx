
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Phone, MessageSquare, Send } from 'lucide-react';

// Schema for form validation
const messageSchema = z.object({
  message: z.string().min(5, { message: "Mensagem deve ter pelo menos 5 caracteres" })
});

interface MessageFormProps {
  supportPhone: string;
}

const MessageForm: React.FC<MessageFormProps> = ({ supportPhone }) => {
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: ''
    }
  });
  
  const onSubmit = async (values: z.infer<typeof messageSchema>) => {
    setIsSendingMessage(true);
    
    try {
      // In a real implementation, you would send this message to your backend
      // which would then use WhatsApp API to forward it to support
      console.log("Enviando mensagem para o suporte:", values.message);
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada para o suporte. Entraremos em contato em breve.",
      });
      
      // Clear message field after successful send
      form.reset();
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
  
  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    phone = phone.replace(/\D/g, '');
    if (phone.length === 11) {
      return `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7)}`;
    }
    if (phone.length === 10) {
      return `(${phone.substring(0, 2)}) ${phone.substring(2, 6)}-${phone.substring(6)}`;
    }
    return phone;
  };
  
  return (
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
            Suporte técnico: {formatPhoneNumber(supportPhone)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Envie uma mensagem e entraremos em contato o mais rápido possível.
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              type="submit" 
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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MessageForm;
