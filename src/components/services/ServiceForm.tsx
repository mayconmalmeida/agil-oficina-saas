
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Check } from 'lucide-react';

// Define the form schema with Zod
const serviceFormSchema = z.object({
  nome: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  tipo: z.enum(["produto", "servico"], {
    required_error: "Por favor selecione o tipo.",
  }),
  valor: z.string().min(1, {
    message: "Por favor insira um valor.",
  }).refine((val) => /^\d+([,.]\d{1,2})?$/.test(val), {
    message: "Formato inválido. Use apenas números com até 2 casas decimais."
  }),
  descricao: z.string().optional(),
});

// Export the type
export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export interface ServiceFormProps {
  onSubmit: (values: ServiceFormValues) => void;
  onSkip: () => void;
  isLoading?: boolean;
  saveSuccess?: boolean;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  onSubmit,
  onSkip,
  isLoading = false,
  saveSuccess = false,
}) => {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      nome: '',
      tipo: 'servico',
      valor: '',
      descricao: '',
    },
  });

  // Format number to currency as user types
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove non-numeric characters except commas and dots
    value = value.replace(/[^\d,.]/g, '');
    
    // Replace commas with dots for calculation
    const numericValue = value.replace(',', '.');
    
    // Check if it's a valid number
    if (!isNaN(parseFloat(numericValue))) {
      // Format with max 2 decimal places
      form.setValue('valor', value);
    } else if (value === '' || value === ',' || value === '.') {
      // Allow empty value or single comma/dot
      form.setValue('valor', value);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Serviço/Produto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Troca de óleo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="servico">Serviço</SelectItem>
                  <SelectItem value="produto">Produto</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valor"
          render={({ field: { value, onChange, ...restField } }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Ex: 150,00"
                  value={value}
                  onChange={(e) => {
                    onChange(e);
                    handleValorChange(e);
                  }}
                  {...restField}
                />
              </FormControl>
              <FormDescription>
                Informe o valor em reais (ex: 99,90)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva mais detalhes sobre o serviço ou produto"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 pt-2">
          <Button 
            type="submit" 
            disabled={isLoading || saveSuccess}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Salvo!
              </>
            ) : (
              'Adicionar'
            )}
          </Button>
          
          <Button 
            type="button"
            variant="outline"
            onClick={onSkip}
            disabled={isLoading || saveSuccess}
            className="flex-1"
          >
            Pular esta etapa
          </Button>
        </div>
      </form>
    </Form>
  );
};
