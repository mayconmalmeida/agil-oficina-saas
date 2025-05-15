
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save } from 'lucide-react';

import { 
  workshopRegistrationSchema, 
  WorkshopRegistrationFormValues,
  formatDocument
} from './workshopRegistrationSchema';
import LogoUpload from './LogoUpload';

const WorkshopRegistrationForm: React.FC<{ selectedPlan?: string }> = ({ selectedPlan = 'Essencial' }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<WorkshopRegistrationFormValues>({
    resolver: zodResolver(workshopRegistrationSchema),
    defaultValues: {
      documentType: 'CNPJ',
      documentNumber: '',
      businessName: '',
      tradingName: '',
      stateRegistration: '',
      responsiblePerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      addressComplement: '',
      password: '',
      confirmPassword: '',
    }
  });
  
  const documentType = form.watch('documentType');
  
  const onSubmit = async (data: WorkshopRegistrationFormValues) => {
    setIsLoading(true);
    
    try {
      // 1. Create user authentication with email and password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.responsiblePerson,
            document_type: data.documentType,
            document_number: data.documentNumber,
          }
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("Falha ao criar usuário");
      }
      
      // 2. Upload logo if provided
      let logoUrl = null;
      if (data.logo instanceof File) {
        const fileName = `${authData.user.id}/logo.${data.logo.name.split('.').pop()}`;
        
        // Check if bucket exists or create it
        try {
          const { data: bucketData } = await supabase.storage.getBucket('logos');
          if (!bucketData) {
            await supabase.storage.createBucket('logos', {
              public: true,
              fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
            });
          }
        } catch (error) {
          console.error("Error with logo bucket:", error);
        }
        
        // Upload the file
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('logos')
          .upload(fileName, data.logo, {
            upsert: true,
            contentType: data.logo.type,
          });
          
        if (uploadError) {
          console.error("Logo upload error:", uploadError);
        } else if (uploadData) {
          const { data: { publicUrl } } = supabase
            .storage
            .from('logos')
            .getPublicUrl(fileName);
            
          logoUrl = publicUrl;
        }
      }
      
      // 3. Update profile with additional information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nome_oficina: data.businessName,
          telefone: data.phone,
          endereco: data.address,
          cidade: data.city,
          estado: data.state,
          cep: data.zipCode,
          cnpj: data.documentType === 'CNPJ' ? data.documentNumber : null,
          inscricao_estadual: data.stateRegistration,
          responsavel: data.responsiblePerson,
          plano: selectedPlan || 'basic',
          logo_url: logoUrl,
        })
        .eq('id', authData.user.id);
        
      if (profileError) throw profileError;
      
      // 4. Create initial onboarding status
      try {
        await supabase
          .from('onboarding_status')
          .insert([{ user_id: authData.user.id, profile_completed: true }]);
      } catch (error) {
        console.error("Error creating onboarding status:", error);
      }
      
      // 5. Create a trial subscription
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 15); // 15-day trial
      
      try {
        await supabase.rpc('create_subscription', {
          user_id: authData.user.id,
          plan_type: selectedPlan.toLowerCase(),
          start_date: new Date().toISOString(),
          end_date: trialEndDate.toISOString()
        });
      } catch (error) {
        console.error("Error creating subscription:", error);
      }
      
      // Success!
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você será redirecionado para o painel em instantes."
      });
      
      // Login the user automatically
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (signInError) {
        console.error("Error signing in:", signInError);
        navigate('/login');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao processar o cadastro."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-md mb-4">
          <h3 className="text-lg font-medium text-blue-800">Plano Selecionado: {selectedPlan}</h3>
          <p className="text-sm text-blue-600">Você terá acesso a todos os recursos por 15 dias grátis.</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Dados Fiscais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de documento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de documento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CPF">CPF</SelectItem>
                      <SelectItem value="CNPJ">CNPJ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="documentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{documentType === 'CPF' ? 'CPF' : 'CNPJ'}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={documentType === 'CPF' ? '123.456.789-01' : '12.345.678/0001-90'}
                      {...field}
                      onChange={(e) => {
                        const formatted = formatDocument(e.target.value, documentType as 'CPF' | 'CNPJ');
                        field.onChange(formatted);
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{documentType === 'CPF' ? 'Nome completo' : 'Razão social'}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={documentType === 'CPF' ? 'João da Silva' : 'Auto Center Ltda'}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tradingName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome fantasia (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Auto Center São Paulo"
                      {...field}
                      value={field.value || ''}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="stateRegistration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inscrição Estadual</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234567890 ou ISENTO"
                      {...field}
                      value={field.value || ''}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Dados de Contato</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="responsiblePerson"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Responsável pela oficina</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome completo do responsável"
                      {...field}
                      disabled={isLoading}
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
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contato@oficina.com.br"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone/WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(11) 99999-9999"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Endereço completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Rua, número, bairro"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="São Paulo"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="SP"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00000-000"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="addressComplement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Bloco, sala, etc."
                      {...field}
                      value={field.value || ''}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Logo</h3>
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagem da Oficina</FormLabel>
                <FormControl>
                  <LogoUpload
                    value={field.value}
                    onChange={field.onChange}
                    error={form.formState.errors.logo?.message as string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Acesso</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                      disabled={isLoading}
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
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Finalizar Cadastro
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default WorkshopRegistrationForm;
