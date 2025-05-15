import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { formatPhoneNumber } from '@/utils/formatUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { safeRpc } from '@/utils/supabaseTypes';

export const clientFormSchema = z.object({
  nome: z.string().min(1, 'Nome do cliente é obrigatório'),
  tipo: z.enum(['pf', 'pj']).default('pf'),
  documento: z.string().optional(),
  telefone: z.string()
    .min(14, 'Telefone deve ter no mínimo 14 caracteres no formato (XX) XXXXX-XXXX')
    .max(15, 'Telefone deve ter no máximo 15 caracteres')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato inválido. Use (XX) XXXXX-XXXX'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().optional().or(z.literal('')),
  cidade: z.string().optional().or(z.literal('')),
  estado: z.string().optional().or(z.literal('')),
  cep: z.string().optional().or(z.literal('')),
  veiculo: z.object({
    marca: z.string().min(1, 'Marca do veículo é obrigatória'),
    modelo: z.string().min(1, 'Modelo do veículo é obrigatório'),
    ano: z.string().regex(/^\d{4}$/, 'Ano deve ter 4 dígitos'),
    placa: z.string().min(7, 'Placa deve ter no mínimo 7 caracteres').max(8, 'Placa deve ter no máximo 8 caracteres'),
    cor: z.string().optional().or(z.literal('')),
    kilometragem: z.string().optional().or(z.literal(''))
  })
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

interface EnhancedClientFormProps {
  onSave: () => void;
  isLoading: boolean;
  saveSuccess: boolean;
  initialData?: Partial<ClientFormValues>;
}

const EnhancedClientForm: React.FC<EnhancedClientFormProps> = ({ 
  onSave, 
  isLoading, 
  saveSuccess,
  initialData = {}
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('cliente');
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      nome: initialData.nome || '',
      tipo: initialData.tipo || 'pf',
      documento: initialData.documento || '',
      telefone: initialData.telefone || '',
      email: initialData.email || '',
      endereco: initialData.endereco || '',
      cidade: initialData.cidade || '',
      estado: initialData.estado || '',
      cep: initialData.cep || '',
      veiculo: {
        marca: initialData.veiculo?.marca || '',
        modelo: initialData.veiculo?.modelo || '',
        ano: initialData.veiculo?.ano || '',
        placa: initialData.veiculo?.placa || '',
        cor: initialData.veiculo?.cor || '',
        kilometragem: initialData.veiculo?.kilometragem || ''
      }
    },
  });
  
  // Format phone number as user types
  const { watch, setValue } = form;
  const phoneValue = watch('telefone');
  const tipoValue = watch('tipo');
  
  useEffect(() => {
    if (phoneValue) {
      const formattedPhone = formatPhoneNumber(phoneValue);
      if (formattedPhone !== phoneValue) {
        setValue('telefone', formattedPhone);
      }
    }
  }, [phoneValue, setValue]);
  
  const handleNextTab = () => {
    setActiveTab('veiculo');
  };
  
  const handlePrevTab = () => {
    setActiveTab('cliente');
  };
  
  const onSubmit = async (values: ClientFormValues) => {
    try {
      // Verificar autenticação
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Você precisa estar logado para adicionar clientes."
        });
        return;
      }

      // Preparar os dados do veículo formatados
      const veiculoFormatado = `${values.veiculo.marca} ${values.veiculo.modelo} ${values.veiculo.ano}, Placa: ${values.veiculo.placa}`;
      
      // Use the safeRpc function to ensure type safety
      const { error } = await safeRpc('create_client', {
        p_user_id: session.user.id,
        p_nome: values.nome,
        p_telefone: values.telefone,
        p_email: values.email || null,
        p_veiculo: veiculoFormatado,
        p_marca: values.veiculo.marca,
        p_modelo: values.veiculo.modelo, 
        p_ano: values.veiculo.ano,
        p_placa: values.veiculo.placa
      });
      
      if (error) throw error;
      
      onSave();
    } catch (error: any) {
      console.error('Erro ao adicionar cliente:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar cliente",
        description: error.message || "Ocorreu um erro ao adicionar o cliente."
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="cliente" className="flex-1">Dados do Cliente</TabsTrigger>
            <TabsTrigger value="veiculo" className="flex-1">Dados do Veículo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cliente">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <div className="flex space-x-4">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="pf"
                            value="pf"
                            checked={field.value === 'pf'}
                            onChange={() => field.onChange('pf')}
                            className="mr-2"
                          />
                          <label htmlFor="pf">Pessoa Física</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="pj"
                            value="pj"
                            checked={field.value === 'pj'}
                            onChange={() => field.onChange('pj')}
                            className="mr-2"
                          />
                          <label htmlFor="pj">Pessoa Jurídica</label>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={tipoValue === 'pj' ? "Razão Social" : "Nome Completo"} 
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
                  name="documento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tipoValue === 'pj' ? "CNPJ" : "CPF"}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={tipoValue === 'pj' ? "00.000.000/0000-00" : "000.000.000-00"} 
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="text-md font-medium mb-4">Endereço (opcional)</h3>
                
                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Endereço completo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Rua, número, bairro" 
                          {...field}
                          disabled={saveSuccess}
                          className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input 
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
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input 
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
                
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem className="max-w-xs">
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="00000-000"
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
              </div>
              
              <div className="flex justify-end pt-4">
                <Button 
                  type="button" 
                  onClick={handleNextTab}
                  disabled={saveSuccess}
                >
                  Próximo: Dados do Veículo
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="veiculo">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="veiculo.cor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Branco" 
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
                  name="veiculo.kilometragem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilometragem (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="50000"
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
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handlePrevTab}
                  disabled={saveSuccess}
                >
                  Voltar: Dados do Cliente
                </Button>
                
                <Button 
                  type="submit" 
                  className={`transition-colors ${saveSuccess 
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
                    'Adicionar Cliente'
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};

export default EnhancedClientForm;
