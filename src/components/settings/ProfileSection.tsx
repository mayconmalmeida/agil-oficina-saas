
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CNPJInput } from '@/components/ui/cnpj-input';
import { CEPInput } from '@/components/ui/cep-input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const profileUpdateSchema = z.object({
  nome_oficina: z.string().min(1, 'Nome da oficina é obrigatório'),
  cnpj: z.string().optional(),
  responsavel: z.string().optional(),
  telefone: z.string().min(8, 'Telefone inválido'),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileUpdateSchema>;

interface ProfileSectionProps {
  form: any;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  isLoading: boolean;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ 
  form, 
  onSubmit, 
  isLoading 
}) => {
  const handleAddressFound = (address: any) => {
    form.setValue('endereco', address.street);
    form.setValue('cidade', address.city);
    form.setValue('estado', address.state);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Perfil</CardTitle>
        <CardDescription>
          Atualize as informações da sua oficina
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome_oficina"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Oficina *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Auto Center São Paulo" />
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
                      <CNPJInput 
                        value={field.value || ''} 
                        onChange={field.onChange}
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
                name="responsavel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="João Silva" />
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
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(11) 99999-9999" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <CEPInput 
                        value={field.value || ''} 
                        onChange={field.onChange}
                        onAddressFound={handleAddressFound}
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
                      <Input {...field} placeholder="São Paulo" />
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
                      <Input {...field} placeholder="SP" maxLength={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço Completo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Rua das Flores, 123 - Centro" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export { profileUpdateSchema };
