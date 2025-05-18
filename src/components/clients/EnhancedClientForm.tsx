
import React, { useEffect, useState } from 'react';
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
import { 
  validateCPF, 
  formatCPF, 
  validateLicensePlate, 
  formatLicensePlate, 
  fetchAddressByCEP, 
  formatCEP,
  ViaCEPResponse 
} from '@/utils/validationUtils';

// Schema with enhanced validations
export const clientFormSchema = z.object({
  nome: z.string().min(1, 'Nome do cliente é obrigatório'),
  tipo: z.enum(['pf', 'pj']).default('pf'),
  documento: z.string()
    .refine(val => 
      val === '' || 
      (val.length >= 11 && validateCPF(val)), 
      {
        message: 'CPF inválido. Formato: 000.000.000-00'
      }
    ).optional().or(z.literal('')),
  telefone: z.string()
    .min(14, 'Telefone deve ter no mínimo 14 caracteres no formato (XX) XXXXX-XXXX')
    .max(15, 'Telefone deve ter no máximo 15 caracteres')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato inválido. Use (XX) XXXXX-XXXX'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  cep: z.string()
    .regex(/^\d{5}-\d{3}$/, 'Formato de CEP inválido. Use XXXXX-XXX')
    .optional().or(z.literal('')),
  endereco: z.string().optional().or(z.literal('')),
  numero: z.string().optional().or(z.literal('')),
  bairro: z.string().optional().or(z.literal('')),
  cidade: z.string().optional().or(z.literal('')),
  estado: z.string().optional().or(z.literal('')),
  veiculo: z.object({
    marca: z.string().min(1, 'Marca do veículo é obrigatória'),
    modelo: z.string().min(1, 'Modelo do veículo é obrigatório'),
    ano: z.string().regex(/^\d{4}$/, 'Ano deve ter exatamente 4 dígitos'),
    placa: z.string()
      .refine(val => validateLicensePlate(val), {
        message: 'Formato de placa inválido. Use ABC-1234 ou ABC1D23'
      }),
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
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      nome: initialData.nome || '',
      tipo: initialData.tipo || 'pf',
      documento: initialData.documento || '',
      telefone: initialData.telefone || '',
      email: initialData.email || '',
      cep: initialData.cep || '',
      endereco: initialData.endereco || '',
      numero: initialData.numero || '',
      bairro: initialData.bairro || '',
      cidade: initialData.cidade || '',
      estado: initialData.estado || '',
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
  
  // Format fields as user types
  const { watch, setValue } = form;
  const phoneValue = watch('telefone');
  const tipoValue = watch('tipo');
  const documentValue = watch('documento');
  const cepValue = watch('cep');
  const placaValue = watch('veiculo.placa');
  const anoValue = watch('veiculo.ano');
  
  // Format phone number
  useEffect(() => {
    if (phoneValue) {
      const formattedPhone = formatPhoneNumber(phoneValue);
      if (formattedPhone !== phoneValue) {
        setValue('telefone', formattedPhone);
      }
    }
  }, [phoneValue, setValue]);
  
  // Format CPF
  useEffect(() => {
    if (documentValue && tipoValue === 'pf') {
      const formattedCPF = formatCPF(documentValue);
      if (formattedCPF !== documentValue) {
        setValue('documento', formattedCPF);
      }
    }
  }, [documentValue, tipoValue, setValue]);
  
  // Format CEP
  useEffect(() => {
    if (cepValue) {
      const formattedCEP = formatCEP(cepValue);
      if (formattedCEP !== cepValue) {
        setValue('cep', formattedCEP);
      }
    }
  }, [cepValue, setValue]);
  
  // Format license plate
  useEffect(() => {
    if (placaValue) {
      const formattedPlaca = formatLicensePlate(placaValue);
      if (formattedPlaca !== placaValue) {
        setValue('veiculo.placa', formattedPlaca);
      }
    }
  }, [placaValue, setValue]);
  
  // Handle CEP lookup
  const handleCepLookup = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    setIsLoadingAddress(true);
    
    try {
      const addressData = await fetchAddressByCEP(cep);
      
      if (addressData) {
        setValue('endereco', addressData.logradouro);
        setValue('bairro', addressData.bairro);
        setValue('cidade', addressData.localidade);
        setValue('estado', addressData.uf);
        
        // Focus the number field after filling address
        setTimeout(() => {
          document.getElementById('endereco-numero')?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    } finally {
      setIsLoadingAddress(false);
    }
  };
  
  // Restrict year field to only numbers and 4 digits
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setValue('veiculo.ano', value);
  };
  
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

      // Format complete address
      const enderecoCompleto = values.endereco + (values.numero ? `, ${values.numero}` : '');
      
      // Prepare vehicle data
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
        p_placa: values.veiculo.placa,
        p_endereco: enderecoCompleto,
        p_cidade: values.cidade || null,
        p_estado: values.estado || null,
        p_cep: values.cep || null,
        p_documento: values.documento || null
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="overflow-visible">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="cliente" className="flex-1">Dados do Cliente</TabsTrigger>
            <TabsTrigger value="veiculo" className="flex-1">Dados do Veículo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cliente" className="overflow-visible">
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
                          inputMode={tipoValue === 'pf' ? "numeric" : "text"}
                          onKeyDown={(e) => {
                            // Allow only digits, backspace, tab, delete, and arrow keys
                            if (
                              tipoValue === 'pf' && 
                              !/^\d$/.test(e.key) && 
                              !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)
                            ) {
                              e.preventDefault();
                            }
                          }}
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
                          inputMode="numeric"
                          onKeyDown={(e) => {
                            // Allow only digits, backspace, tab, delete, and arrow keys
                            if (
                              !/^\d$/.test(e.key) && 
                              !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)
                            ) {
                              e.preventDefault();
                            }
                          }}
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
                <h3 className="text-md font-medium mb-4">Endereço</h3>
                
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="00000-000" 
                          {...field}
                          disabled={saveSuccess || isLoadingAddress}
                          className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                          inputMode="numeric"
                          onBlur={handleCepLookup}
                          onKeyDown={(e) => {
                            // Allow only digits, backspace, tab, delete, and arrow keys
                            if (
                              !/^\d$/.test(e.key) && 
                              !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)
                            ) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="endereco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Rua, Avenida..." 
                              {...field}
                              disabled={saveSuccess || isLoadingAddress}
                              className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                              readOnly={isLoadingAddress}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input 
                            id="endereco-numero"
                            placeholder="123" 
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
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="bairro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            disabled={saveSuccess || isLoadingAddress}
                            className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                            readOnly={isLoadingAddress}
                          />
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
                          <Input 
                            {...field}
                            disabled={saveSuccess || isLoadingAddress}
                            className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                            readOnly={isLoadingAddress}
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
                            disabled={saveSuccess || isLoadingAddress}
                            className={saveSuccess ? "bg-green-50 border-green-200" : ""}
                            readOnly={isLoadingAddress}
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
          
          <TabsContent value="veiculo" className="overflow-visible">
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
                          inputMode="numeric"
                          onChange={handleYearChange}
                          onKeyDown={(e) => {
                            // Allow only digits, backspace, tab, delete, and arrow keys
                            if (
                              !/^\d$/.test(e.key) && 
                              !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)
                            ) {
                              e.preventDefault();
                            }
                          }}
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
                          placeholder="ABC1D23 ou ABC-1234"
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
                          inputMode="numeric"
                          onKeyDown={(e) => {
                            // Allow only digits, backspace, tab, delete, and arrow keys
                            if (
                              !/^\d$/.test(e.key) && 
                              !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)
                            ) {
                              e.preventDefault();
                            }
                          }}
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
