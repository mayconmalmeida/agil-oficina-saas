
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

const supportSettingsSchema = z.object({
  whatsapp_suporte: z.string().min(8, { message: "Número de WhatsApp inválido" }),
});

type SupportSettingsFormValues = z.infer<typeof supportSettingsSchema>;

const SupportSettings: React.FC<{ userId?: string; initialValues?: { whatsapp_suporte?: string } }> = ({ 
  userId,
  initialValues = {}
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const { toast } = useToast();
  
  const form = useForm<SupportSettingsFormValues>({
    resolver: zodResolver(supportSettingsSchema),
    defaultValues: {
      whatsapp_suporte: initialValues.whatsapp_suporte || '46991270777',
    },
  });
  
  const onSubmit = async (values: SupportSettingsFormValues) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "ID do usuário não encontrado. Por favor, faça login novamente.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First check if the whatsapp_suporte column exists
      const { error: columnCheckError } = await supabase.rpc('ensure_whatsapp_suporte_column');
      
      if (columnCheckError) {
        console.log('Column check error, attempting direct update anyway:', columnCheckError);
      }
      
      // Attempt the update
      const { error } = await supabase
        .from('profiles')
        .update({
          whatsapp_suporte: values.whatsapp_suporte,
        })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: "Configurações atualizadas",
        description: "O número de suporte foi atualizado com sucesso.",
      });
      
      setSaveSuccess(true);
      
      // Reset success state after a bit
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Error saving support settings:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível salvar as configurações.",
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
          Configure o número de WhatsApp para contato de suporte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="whatsapp_suporte"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp para Suporte</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="46991270777" 
                      {...field} 
                      className={saveSuccess ? "border-green-500" : ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Este número será usado para contato via WhatsApp quando um usuário solicitar suporte
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className={`${saveSuccess ? 'bg-green-500 hover:bg-green-600' : ''}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : saveSuccess ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvo!
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SupportSettings;
