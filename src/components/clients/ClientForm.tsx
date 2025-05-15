
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export const formSchema = z.object({
  nome: z.string().min(1, 'Nome do cliente é obrigatório'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  veiculo: z.string().min(1, 'Informação do veículo é obrigatória'),
});

export type ClientFormValues = z.infer<typeof formSchema>;

interface ClientFormProps {
  onSubmit: (values: ClientFormValues) => Promise<void>;
  onSkip: () => void;
  isLoading: boolean;
  saveSuccess: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({ 
  onSubmit, 
  onSkip, 
  isLoading, 
  saveSuccess 
}) => {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      telefone: '',
      email: '',
      veiculo: '',
    },
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input 
                  placeholder="João da Silva" 
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (opcional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="cliente@exemplo.com" 
                  type="email"
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
          name="veiculo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Veículo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Fiat Uno 2018, Placa ABC-1234" 
                  {...field}
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
              Adicionando...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Cliente adicionado!
            </>
          ) : (
            'Adicionar Cliente e Continuar'
          )}
        </Button>
        
        {!saveSuccess && (
          <div className="text-center mt-4">
            <Button 
              variant="link" 
              onClick={onSkip}
              type="button"
            >
              Pular esta etapa por enquanto
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default ClientForm;
