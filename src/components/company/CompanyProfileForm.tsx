
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';

const companyFormSchema = z.object({
  nome_oficina: z.string().min(1, 'Nome da oficina é obrigatório'),
  telefone: z.string().min(8, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().nullable(),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(1, 'Estado é obrigatório'),
  cep: z.string().min(8, 'CEP inválido').max(9, 'CEP inválido'),
  cnpj: z.string().optional().nullable(),
  inscricao_estadual: z.string().optional().nullable(),
  observacoes_orcamento: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

interface CompanyProfileFormProps {
  initialData: any;
  onSave: () => void;
}

const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({ initialData, onSave }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      nome_oficina: initialData?.nome_oficina || '',
      telefone: initialData?.telefone || '',
      email: initialData?.email || '',
      endereco: initialData?.endereco || '',
      cidade: initialData?.cidade || '',
      estado: initialData?.estado || '',
      cep: initialData?.cep || '',
      cnpj: initialData?.cnpj || '',
      inscricao_estadual: initialData?.inscricao_estadual || '',
      observacoes_orcamento: initialData?.observacoes_orcamento || '',
      website: initialData?.website || '',
    }
  });
  
  const onSubmit = async (data: CompanyFormValues) => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Faça login novamente para continuar.",
        });
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', session.user.id);
        
      if (error) throw error;
      
      onSave();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as alterações",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nome_oficina"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Oficina</FormLabel>
                <FormControl>
                  <Input placeholder="Auto Center São Paulo" {...field} />
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
                  <Input placeholder="(11) 99999-9999" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="contato@suaoficina.com.br" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="www.suaoficina.com.br" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl>
                  <Input placeholder="00.000.000/0000-00" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="inscricao_estadual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inscrição Estadual</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-md font-medium mb-4">Endereço</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Endereço completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, número, bairro, complemento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="00000-000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <FormField
            control={form.control}
            name="observacoes_orcamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações para Orçamentos</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Texto que aparecerá no rodapé dos orçamentos" 
                    rows={3} 
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> 
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> 
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CompanyProfileForm;
