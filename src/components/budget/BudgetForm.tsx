
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { budgetFormSchema, BudgetFormValues } from './budgetSchema';
import { useClientSearch } from '@/hooks/useClientSearch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BudgetFormProps {
  onSubmit: (values: BudgetFormValues) => Promise<void>;
  onSkip: () => void;
  isLoading: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onSubmit, onSkip, isLoading }) => {
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      cliente: '',
      veiculo: '',
      descricao: '',
      valor_total: '',
    },
  });

  // Integração com a busca de clientes
  const { 
    searchTerm, 
    setSearchTerm,
    clients, 
    isLoading: isLoadingClients, 
    selectClient
  } = useClientSearch();

  // Quando um cliente for selecionado, atualize o formulário
  const handleSelectClient = (client: any) => {
    form.setValue('cliente', client.nome);
    form.setValue('veiculo', client.veiculo || '');
    setClientSearchOpen(false);
    selectClient(client);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="cliente"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Cliente</FormLabel>
              <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        {...field} 
                        placeholder="Buscar cliente..." 
                        className="pr-10"
                        onClick={() => setClientSearchOpen(true)}
                        onChange={(e) => {
                          field.onChange(e);
                          setSearchTerm(e.target.value);
                        }}
                      />
                      <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start" side="bottom" sideOffset={5}>
                  <Command>
                    <CommandInput 
                      placeholder="Digite o nome do cliente..." 
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                      className="h-9"
                    />
                    <CommandEmpty>
                      {isLoadingClients ? 'Carregando...' : 'Nenhum cliente encontrado'}
                    </CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-48">
                        {clients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={client.nome}
                            onSelect={() => handleSelectClient(client)}
                            className="cursor-pointer"
                          >
                            <div>
                              <div className="font-medium">{client.nome}</div>
                              <div className="text-xs text-muted-foreground">{client.telefone}</div>
                            </div>
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
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
                  readOnly={field.value !== ''}
                  className={field.value !== '' ? "bg-gray-100" : ""}
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
