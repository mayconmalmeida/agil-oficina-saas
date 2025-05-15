
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { budgetFormSchema, BudgetFormValues } from './budgetSchema';

interface BudgetFormProps {
  onSubmit: (values: BudgetFormValues) => Promise<void>;
  onSkip: () => void;
  isLoading: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onSubmit, onSkip, isLoading }) => {
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      cliente: '',
      veiculo: '',
      descricao: '',
      valor_total: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="cliente"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <FormControl>
                <Input 
                  placeholder="João da Silva" 
                  {...field} 
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Serviço</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Revisão completa com troca de óleo e filtros" 
                  className="min-h-32"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="valor_total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Total (R$)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="299,90" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-oficina hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Criando...
            </>
          ) : (
            'Criar Orçamento e Finalizar'
          )}
        </Button>
        
        <div className="text-center mt-4">
          <Button 
            variant="link" 
            onClick={onSkip}
            type="button"
          >
            Pular esta etapa por enquanto
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BudgetForm;
