
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { budgetFormSchema, BudgetFormValues } from './budgetSchema';
import { useClientSearch, Client } from '@/hooks/useClientSearch';
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
    selectClient,
    selectedClient,
    clearSelection
  } = useClientSearch();

  // Reset search when form is reset
  useEffect(() => {
    const subscription = form.watch(() => {
      if (!form.getValues('cliente')) {
        clearSelection();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, clearSelection]);

  // Quando um cliente for selecionado, atualize o formulário
  const handleSelectClient = (client: Client) => {
    selectClient(client);
    form.setValue('cliente', client.nome);
    
    // Format vehicle information
    const vehicleInfo = formatVehicleInfo(client);
    form.setValue('veiculo', vehicleInfo);
    
    setClientSearchOpen(false);
  };
  
  // Formatar informações do veículo
  const formatVehicleInfo = (client: Client) => {
    if (client.marca && client.modelo) {
      let vehicleInfo = `${client.marca} ${client.modelo}`;
      if (client.ano) vehicleInfo += ` (${client.ano})`;
      if (client.placa) vehicleInfo += ` - Placa: ${client.placa}`;
      return vehicleInfo;
    }
    return client.veiculo || '';
  };

  const handlePopoverOpenChange = (open: boolean) => {
    // Only open if there's a search term with at least 2 characters
    if (open && (!searchTerm || searchTerm.length < 2)) {
      return;
    }
    setClientSearchOpen(open);
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
              <Popover open={clientSearchOpen} onOpenChange={handlePopoverOpenChange}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        {...field} 
                        placeholder="Buscar cliente..." 
                        className="pr-10"
                        onChange={(e) => {
                          field.onChange(e);
                          setSearchTerm(e.target.value);
                          if (e.target.value === '' && selectedClient) {
                            clearSelection();
                            form.setValue('veiculo', '');
                          }
                          // Open popover only if there's input with at least 2 characters
                          setClientSearchOpen(e.target.value.length >= 2);
                        }}
                      />
                      {field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            field.onChange('');
                            clearSelection();
                            form.setValue('veiculo', '');
                          }}
                          className="absolute right-10 top-2 h-5 w-5 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
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
                            value={client.id} // Use ID as the value for unique identification
                            onSelect={() => handleSelectClient(client)}
                            className="cursor-pointer"
                          >
                            <div>
                              <div className="font-medium">{client.nome}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatVehicleInfo(client) || client.telefone}
                              </div>
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
                  readOnly={selectedClient !== null}
                  className={selectedClient !== null ? "bg-gray-100" : ""}
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
                  onChange={(e) => {
                    // Permitir apenas números e vírgula
                    const value = e.target.value.replace(/[^\d,]/g, '');
                    field.onChange(value);
                  }}
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
