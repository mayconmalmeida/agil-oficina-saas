
import React from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, { message: 'A senha atual é obrigatória' }),
  newPassword: z.string().min(6, { message: 'A nova senha deve ter pelo menos 6 caracteres' }),
  confirmPassword: z.string().min(6, { message: 'A confirmação de senha é obrigatória' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

export type PasswordFormValues = z.infer<typeof passwordChangeSchema>;

interface SecuritySectionProps {
  passwordForm: UseFormReturn<PasswordFormValues>;
  onPasswordChange: (values: PasswordFormValues) => Promise<void>;
  onLogout: () => Promise<void>;
  isLoading: boolean;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({ 
  passwordForm, 
  onPasswordChange, 
  onLogout, 
  isLoading 
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Alterar Senha</h2>
        <p className="text-sm text-gray-500">Atualize sua senha para manter sua conta segura</p>
      </div>
      
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(onPasswordChange)} className="space-y-4">
          <FormField
            control={passwordForm.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha Atual</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={passwordForm.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova Senha</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={passwordForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Nova Senha</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </form>
      </Form>
      
      <Separator />
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Sessão</h2>
          <p className="text-sm text-gray-500">Encerre todas as sessões ativas</p>
        </div>
        
        <Button variant="destructive" onClick={onLogout}>
          Sair de Todos os Dispositivos
        </Button>
      </div>
    </div>
  );
};

export { SecuritySection, passwordChangeSchema };
