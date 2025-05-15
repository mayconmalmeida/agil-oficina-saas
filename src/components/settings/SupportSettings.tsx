
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Schema para validação do formulário
const supportSchema = z.object({
  whatsapp_suporte: z.string()
    .min(10, { message: "Número deve ter pelo menos 10 dígitos" })
    .max(15, { message: "Número não deve exceder 15 dígitos" })
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
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof supportSchema>>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      whatsapp_suporte: initialValues.whatsapp_suporte || '46991270777',
    }
  });
  
  const onSubmit = async (values: z.infer<typeof supportSchema>) => {
    if (!userId) {
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
        .eq('id', userId);
        
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
  
  return (
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
                    <Input
                      placeholder="46991270777"
                      {...field}
                      disabled={isLoading}
                    />
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
  );
};

export default SupportSettings;
