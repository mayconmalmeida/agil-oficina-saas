
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle } from 'lucide-react';
import { CardContent } from '@/components/ui/card';

// Enhanced schema with better validation
const formSchema = z.object({
  nome_oficina: z.string()
    .min(3, 'Nome da oficina deve ter pelo menos 3 caracteres')
    .max(50, 'Nome da oficina deve ter no máximo 50 caracteres'),
  telefone: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(15, 'Telefone deve ter no máximo 15 dígitos')
    .regex(/^[0-9() -]+$/, 'Telefone deve conter apenas números, parênteses, espaços e hífens')
    .refine((val) => {
      // Count only digits
      const digitCount = val.replace(/\D/g, '').length;
      return digitCount >= 10 && digitCount <= 11;
    }, 'Telefone deve ter entre 10 e 11 dígitos numéricos'),
});

export type ProfileFormValues = z.infer<typeof formSchema>;

interface ProfileSetupFormProps {
  userId: string | undefined;
  onSaveSuccess: () => void;
  initialValues?: {
    nome_oficina?: string;
    telefone?: string;
  };
}

const ProfileSetupForm: React.FC<ProfileSetupFormProps> = ({ 
  userId, 
  onSaveSuccess,
  initialValues = { nome_oficina: '', telefone: '' }
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_oficina: initialValues.nome_oficina || '',
      telefone: initialValues.telefone || '',
    },
    mode: 'onBlur', // Validate on blur for better user experience
  });
  
  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format based on length
    if (digits.length <= 2) {
      return `(${digits}`;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
  };
  
  const onSubmit = async (values: ProfileFormValues) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para salvar seu perfil.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (existingProfile) {
        // Profile exists, update it
        const { error } = await supabase
          .from('profiles')
          .update({
            nome_oficina: values.nome_oficina,
            telefone: values.telefone,
          })
          .eq('id', userId);
          
        if (error) {
          console.error('Erro ao atualizar perfil:', error);
          toast({
            variant: "destructive",
            title: "Erro ao salvar perfil",
            description: error.message || "Ocorreu um erro ao salvar seu perfil.",
          });
          return;
        }
      } else {
        // Profile doesn't exist, insert it
        const { error } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            nome_oficina: values.nome_oficina,
            telefone: values.telefone,
          }]);
          
        if (error) {
          console.error('Erro ao criar perfil:', error);
          toast({
            variant: "destructive",
            title: "Erro ao salvar perfil",
            description: error.message || "Ocorreu um erro ao salvar seu perfil.",
          });
          return;
        }
      }
      
      // Show success animation
      setSaveSuccess(true);
      
      // Call the onSaveSuccess callback
      setTimeout(() => {
        onSaveSuccess();
      }, 1500);
      
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado ao salvar seu perfil.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nome_oficina"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Oficina</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Auto Center São Paulo" 
                    {...field} 
                    disabled={saveSuccess}
                    className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(11) 99999-9999" 
                    {...field}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      field.onChange(formatted);
                    }}
                    disabled={saveSuccess}
                    className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className={`w-full transition-colors ${saveSuccess 
              ? "bg-green-500 hover:bg-green-600" 
              : "bg-oficina hover:bg-blue-700"}`}
            disabled={isLoading || saveSuccess}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Salvando...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Salvo com sucesso!
              </>
            ) : (
              'Salvar e Continuar'
            )}
          </Button>
        </form>
      </Form>
    </CardContent>
  );
};

export default ProfileSetupForm;
