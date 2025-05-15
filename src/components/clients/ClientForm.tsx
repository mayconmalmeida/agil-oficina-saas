
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { formatPhoneNumber } from '@/utils/formatUtils';

export const formSchema = z.object({
  nome: z.string().min(1, 'Nome do cliente é obrigatório'),
  telefone: z.string()
    .min(14, 'Telefone deve ter no mínimo 14 caracteres no formato (XX) XXXXX-XXXX')
    .max(15, 'Telefone deve ter no máximo 15 caracteres')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato inválido. Use (XX) XXXXX-XXXX'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  veiculo: z.object({
    marca: z.string().min(1, 'Marca do veículo é obrigatória'),
    modelo: z.string().min(1, 'Modelo do veículo é obrigatório'),
    ano: z.string().regex(/^\d{4}$/, 'Ano deve ter 4 dígitos'),
    placa: z.string().min(7, 'Placa deve ter no mínimo 7 caracteres').max(8, 'Placa deve ter no máximo 8 caracteres')
  })
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
      veiculo: {
        marca: '',
        modelo: '',
        ano: '',
        placa: ''
      }
    },
  });
  
  // Format phone number as user types
  const { watch, setValue } = form;
  const phoneValue = watch('telefone');
  
  useEffect(() => {
    if (phoneValue) {
      const formattedPhone = formatPhoneNumber(phoneValue);
      if (formattedPhone !== phoneValue) {
        setValue('telefone', formattedPhone);
      }
    }
  }, [phoneValue, setValue]);
  
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
        
        <div className="border-t pt-3 mt-2">
          <h3 className="text-md font-medium mb-3">Dados do Veículo</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="veiculo.marca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Fiat" 
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
              name="veiculo.modelo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Uno" 
                      {...field}
                      disabled={saveSuccess}
                      className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <FormField
              control={form.control}
              name="veiculo.ano"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="2022" 
                      {...field}
                      maxLength={4}
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
              name="veiculo.placa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placa</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="ABC1D23"
                      {...field}
                      maxLength={8}
                      disabled={saveSuccess}
                      className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
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
